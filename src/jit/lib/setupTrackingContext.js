import fs from 'fs'
import path from 'path'

import fastGlob from 'fast-glob'
import LRU from 'quick-lru'
import normalizePath from 'normalize-path'

import hash from '../../util/hashConfig'
import getModuleDependencies from '../../lib/getModuleDependencies'

import resolveConfig from '../../../resolveConfig'

import resolveConfigPath from '../../util/resolveConfigPath'

import { env } from './sharedState'

import { getContext, getFileModifiedMap, trackModified } from './setupContextUtils'
import parseDependency from '../../util/parseDependency'

let configPathCache = new LRU({ maxSize: 100 })

let candidateFilesCache = new WeakMap()

function getCandidateFiles(context, tailwindConfig) {
  if (candidateFilesCache.has(context)) {
    return candidateFilesCache.get(context)
  }

  let purgeContent = Array.isArray(tailwindConfig.purge)
    ? tailwindConfig.purge
    : tailwindConfig.purge.content

  let candidateFiles = purgeContent
    .filter((item) => typeof item === 'string')
    .map((purgePath) => normalizePath(path.resolve(purgePath)))

  return candidateFilesCache.set(context, candidateFiles).get(context)
}

// Get the config object based on a path
function getTailwindConfig(configOrPath) {
  let userConfigPath = resolveConfigPath(configOrPath)

  if (userConfigPath !== null) {
    let [prevConfig, prevConfigHash, prevDeps, prevModified] =
      configPathCache.get(userConfigPath) || []

    let newDeps = getModuleDependencies(userConfigPath).map((dep) => dep.file)

    let modified = false
    let newModified = new Map()
    for (let file of newDeps) {
      let time = fs.statSync(file).mtimeMs
      newModified.set(file, time)
      if (!prevModified || !prevModified.has(file) || time > prevModified.get(file)) {
        modified = true
      }
    }

    // It hasn't changed (based on timestamps)
    if (!modified) {
      return [prevConfig, userConfigPath, prevConfigHash, prevDeps]
    }

    // It has changed (based on timestamps), or first run
    for (let file of newDeps) {
      delete require.cache[file]
    }
    let newConfig = resolveConfig(require(userConfigPath))
    let newHash = hash(newConfig)
    configPathCache.set(userConfigPath, [newConfig, newHash, newDeps, newModified])
    return [newConfig, userConfigPath, newHash, newDeps]
  }

  // It's a plain object, not a path
  let newConfig = resolveConfig(
    configOrPath.config === undefined ? configOrPath : configOrPath.config
  )

  return [newConfig, null, hash(newConfig), []]
}

function resolvedChangedContent(context, candidateFiles, fileModifiedMap) {
  let changedContent = (
    Array.isArray(context.tailwindConfig.purge)
      ? context.tailwindConfig.purge
      : context.tailwindConfig.purge.content
  )
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

  for (let changedFile of resolveChangedFiles(candidateFiles, fileModifiedMap)) {
    let content = fs.readFileSync(changedFile, 'utf8')
    let extension = path.extname(changedFile).slice(1)
    changedContent.push({ content, extension })
  }
  return changedContent
}

function resolveChangedFiles(candidateFiles, fileModifiedMap) {
  let changedFiles = new Set()
  env.DEBUG && console.time('Finding changed files')
  let files = fastGlob.sync(candidateFiles)
  for (let file of files) {
    let prevModified = fileModifiedMap.has(file) ? fileModifiedMap.get(file) : -Infinity
    let modified = fs.statSync(file).mtimeMs

    if (modified > prevModified) {
      changedFiles.add(file)
      fileModifiedMap.set(file, modified)
    }
  }
  env.DEBUG && console.timeEnd('Finding changed files')
  return changedFiles
}

// DISABLE_TOUCH = TRUE

// Retrieve an existing context from cache if possible (since contexts are unique per
// source path), or set up a new one (including setting up watchers and registering
// plugins) then return it
export default function setupTrackingContext(configOrPath) {
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

      let [context] = getContext(
        tailwindDirectives,
        root,
        result,
        tailwindConfig,
        userConfigPath,
        tailwindConfigHash,
        contextDependencies
      )

      let candidateFiles = getCandidateFiles(context, tailwindConfig)
      let fileModifiedMap = getFileModifiedMap(context)

      // If there are no @tailwind rules, we don't consider this CSS file or it's dependencies
      // to be dependencies of the context. Can reuse the context even if they change.
      // We may want to think about `@layer` being part of this trigger too, but it's tough
      // because it's impossible for a layer in one file to end up in the actual @tailwind rule
      // in another file since independent sources are effectively isolated.
      if (tailwindDirectives.size > 0) {
        // Add template paths as postcss dependencies.
        for (let fileOrGlob of candidateFiles) {
          registerDependency(parseDependency(fileOrGlob))
        }

        for (let changedContent of resolvedChangedContent(
          context,
          candidateFiles,
          fileModifiedMap
        )) {
          context.changedContent.push(changedContent)
        }
      }

      for (let file of configDependencies) {
        registerDependency({ type: 'dependency', file })
      }

      trackModified([...contextDependencies], fileModifiedMap)

      return context
    }
  }
}
