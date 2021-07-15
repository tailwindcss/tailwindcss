import fs from 'fs'
import path from 'path'

import tmp from 'tmp'
import chokidar from 'chokidar'
import fastGlob from 'fast-glob'
import LRU from 'quick-lru'
import normalizePath from 'normalize-path'

import hash from '../../util/hashConfig'
import log from '../../util/log'
import getModuleDependencies from '../../lib/getModuleDependencies'
import getPurgeContent from '../../lib/getPurgeContent'
import resolveConfig from '../../../resolveConfig'
import resolveConfigPath from '../../util/resolveConfigPath'
import { getContext } from './setupContextUtils'

// This is used to trigger rebuilds. Just updating the timestamp
// is significantly faster than actually writing to the file (10x).

function touch(filename) {
  let time = new Date()

  try {
    fs.utimesSync(filename, time, time)
  } catch (err) {
    fs.closeSync(fs.openSync(filename, 'w'))
  }
}

let watchers = new WeakMap()

function getWatcher(context) {
  if (watchers.has(context)) {
    return watchers.get(context)
  }

  return null
}

function setWatcher(context, watcher) {
  return watchers.set(context, watcher)
}

let touchFiles = new WeakMap()

function getTouchFile(context) {
  if (touchFiles.has(context)) {
    return touchFiles.get(context)
  }

  return null
}

function setTouchFile(context, touchFile) {
  return touchFiles.set(context, touchFile)
}

let configPaths = new WeakMap()

function getConfigPath(context, configOrPath) {
  if (!configPaths.has(context)) {
    configPaths.set(context, resolveConfigPath(configOrPath))
  }

  return configPaths.get(context)
}

function rebootWatcher(context, configPath, configDependencies, candidateFiles) {
  let touchFile = getTouchFile(context)

  if (touchFile === null) {
    touchFile = tmp.fileSync().name
    setTouchFile(context, touchFile)
    touch(touchFile)
  }

  let watcher = getWatcher(context)

  Promise.resolve(watcher ? watcher.close() : null).then(() => {
    log.info([
      'Tailwind CSS is watching for changes...',
      'https://tailwindcss.com/docs/just-in-time-mode#watch-mode-and-one-off-builds',
    ])

    watcher = chokidar.watch([...candidateFiles, ...configDependencies], {
      ignoreInitial: true,
    })

    setWatcher(context, watcher)

    watcher.on('add', (file) => {
      let changedFile = path.resolve('.', file)
      let content = fs.readFileSync(changedFile, 'utf8')
      let extension = path.extname(changedFile).slice(1)
      context.changedContent.push({ content, extension })
      touch(touchFile)
    })

    watcher.on('change', (file) => {
      // If it was a config dependency, touch the config file to trigger a new context.
      // This is not really that clean of a solution but it's the fastest, because we
      // can do a very quick check on each build to see if the config has changed instead
      // of having to get all of the module dependencies and check every timestamp each
      // time.
      if (configDependencies.has(file)) {
        for (let dependency of configDependencies) {
          delete require.cache[require.resolve(dependency)]
        }
        touch(configPath)
      } else {
        let changedFile = path.resolve('.', file)
        let content = fs.readFileSync(changedFile, 'utf8')
        let extension = path.extname(changedFile).slice(1)
        context.changedContent.push({ content, extension })
        touch(touchFile)
      }
    })

    watcher.on('unlink', (file) => {
      // Touch the config file if any of the dependencies are deleted.
      if (configDependencies.has(file)) {
        for (let dependency of configDependencies) {
          delete require.cache[require.resolve(dependency)]
        }
        touch(configPath)
      }
    })
  })
}

let configPathCache = new LRU({ maxSize: 100 })

let configDependenciesCache = new WeakMap()

function getConfigDependencies(context) {
  if (!configDependenciesCache.has(context)) {
    configDependenciesCache.set(context, new Set())
  }

  return configDependenciesCache.get(context)
}

let candidateFilesCache = new WeakMap()

function getCandidateFiles(context, tailwindConfig, root) {
  if (candidateFilesCache.has(context)) {
    return candidateFilesCache.get(context)
  }

  let candidateFiles = getPurgeContent(tailwindConfig, root)
    .filter((item) => typeof item === 'string')
    .map((purgePath) => normalizePath(path.resolve(purgePath)))

  return candidateFilesCache.set(context, candidateFiles).get(context)
}

// Get the config object based on a path
function getTailwindConfig(configOrPath) {
  let userConfigPath = resolveConfigPath(configOrPath)

  if (userConfigPath !== null) {
    let [prevConfig, prevModified = -Infinity, prevConfigHash] =
      configPathCache.get(userConfigPath) || []
    let modified = fs.statSync(userConfigPath).mtimeMs

    // It hasn't changed (based on timestamp)
    if (modified <= prevModified) {
      return [prevConfig, userConfigPath, prevConfigHash, [userConfigPath]]
    }

    // It has changed (based on timestamp), or first run
    delete require.cache[userConfigPath]
    let newConfig = resolveConfig(require(userConfigPath))
    let newHash = hash(newConfig)
    configPathCache.set(userConfigPath, [newConfig, modified, newHash])
    return [newConfig, userConfigPath, newHash, [userConfigPath]]
  }

  // It's a plain object, not a path
  let newConfig = resolveConfig(
    configOrPath.config === undefined ? configOrPath : configOrPath.config
  )

  return [newConfig, null, hash(newConfig), []]
}

function resolvedChangedContent(context, root, candidateFiles) {
  let changedContent = getPurgeContent(context.tailwindConfig, root)
    .filter((item) => typeof item.raw === 'string')
    .concat(
      (context.tailwindConfig.purge?.safelist ?? []).map((content) => {
        if (typeof content === 'string') {
          return { raw: content, extension: 'html' }
        }

        if (content instanceof RegExp) {
          throw new Error(
            "Values inside 'purge.safelist' can only be of type 'string', found 'regex'."
          )
        }

        throw new Error(
          `Values inside 'purge.safelist' can only be of type 'string', found '${typeof content}'.`
        )
      })
    )
    .map(({ raw, extension }) => ({ content: raw, extension }))

  for (let changedFile of resolveChangedFiles(context, candidateFiles)) {
    let content = fs.readFileSync(changedFile, 'utf8')
    let extension = path.extname(changedFile).slice(1)
    changedContent.push({ content, extension })
  }
  return changedContent
}

let scannedContentCache = new WeakMap()

function resolveChangedFiles(context, candidateFiles) {
  let changedFiles = new Set()

  // If we're not set up and watching files ourselves, we need to do
  // the work of grabbing all of the template files for candidate
  // detection.
  if (!scannedContentCache.has(context)) {
    let files = fastGlob.sync(candidateFiles)
    for (let file of files) {
      changedFiles.add(file)
    }
    scannedContentCache.set(context, true)
  }

  return changedFiles
}

// DISABLE_TOUCH = FALSE

// Retrieve an existing context from cache if possible (since contexts are unique per
// source path), or set up a new one (including setting up watchers and registering
// plugins) then return it
export default function setupWatchingContext(configOrPath) {
  return ({ tailwindDirectives, registerDependency }) => {
    return (root, result) => {
      let [tailwindConfig, userConfigPath, tailwindConfigHash, configDependencies] =
        getTailwindConfig(configOrPath)

      let contextDependencies = new Set(configDependencies)

      // If there are no @tailwind rules, we don't consider this CSS file or it's dependencies
      // to be dependencies of the context. Can reuse the context even if they change.
      // We may want to think about `@layer` being part of this trigger too, but it's tough
      // because it's impossible for a layer in one file to end up in the actual @tailwind rule
      // in another file since independent sources are effectively isolated.
      if (tailwindDirectives.size > 0) {
        // Add current css file as a context dependencies.
        contextDependencies.add(result.opts.from)

        // Add all css @import dependencies as context dependencies.
        for (let message of result.messages) {
          if (message.type === 'dependency') {
            contextDependencies.add(message.file)
          }
        }
      }

      let [context, isNewContext] = getContext(
        tailwindDirectives,
        root,
        result,
        tailwindConfig,
        userConfigPath,
        tailwindConfigHash,
        contextDependencies
      )

      let candidateFiles = getCandidateFiles(context, tailwindConfig, root)
      let contextConfigDependencies = getConfigDependencies(context)

      for (let file of configDependencies) {
        registerDependency({ type: 'dependency', file })
      }

      context.disposables.push((oldContext) => {
        let watcher = getWatcher(oldContext)
        if (watcher !== null) {
          watcher.close()
        }
      })

      let configPath = getConfigPath(context, configOrPath)

      if (configPath !== null) {
        for (let dependency of getModuleDependencies(configPath)) {
          if (dependency.file === configPath) {
            continue
          }

          contextConfigDependencies.add(dependency.file)
        }
      }

      if (isNewContext) {
        rebootWatcher(context, configPath, contextConfigDependencies, candidateFiles)
      }

      // Register our temp file as a dependency ‚Äî we write to this file
      // to trigger rebuilds.
      let touchFile = getTouchFile(context)
      if (touchFile) {
        registerDependency({ type: 'dependency', file: touchFile })
      }

      if (tailwindDirectives.size > 0) {
        for (let changedContent of resolvedChangedContent(context, root, candidateFiles)) {
          context.changedContent.push(changedContent)
        }
      }

      return context
    }
  }
}
