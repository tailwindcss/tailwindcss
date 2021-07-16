import fs from 'fs'
import url from 'url'
import postcss from 'postcss'
import dlv from 'dlv'
import selectorParser from 'postcss-selector-parser'

import transformThemeValue from '../../util/transformThemeValue'
import parseObjectStyles from '../../util/parseObjectStyles'
import prefixSelector from '../../util/prefixSelector'
import isPlainObject from '../../util/isPlainObject'
import escapeClassName from '../../util/escapeClassName'
import nameClass from '../../util/nameClass'
import { coerceValue } from '../../util/pluginUtils'
import bigSign from '../../util/bigSign'
import corePlugins from '../corePlugins'
import * as sharedState from './sharedState'
import { env } from './sharedState'

function toPath(value) {
  if (Array.isArray(value)) {
    return value
  }

  let inBrackets = false
  let parts = []
  let chunk = ''

  for (let i = 0; i < value.length; i++) {
    let char = value[i]
    if (char === '[') {
      inBrackets = true
      parts.push(chunk)
      chunk = ''
      continue
    }
    if (char === ']' && inBrackets) {
      inBrackets = false
      parts.push(chunk)
      chunk = ''
      continue
    }
    if (char === '.' && !inBrackets && chunk.length > 0) {
      parts.push(chunk)
      chunk = ''
      continue
    }
    chunk = chunk + char
  }

  if (chunk.length > 0) {
    parts.push(chunk)
  }

  return parts
}

function insertInto(list, value, { before = [] } = {}) {
  before = [].concat(before)

  if (before.length <= 0) {
    list.push(value)
    return
  }

  let idx = list.length - 1
  for (let other of before) {
    let iidx = list.indexOf(other)
    if (iidx === -1) continue
    idx = Math.min(idx, iidx)
  }

  list.splice(idx, 0, value)
}

function parseStyles(styles) {
  if (!Array.isArray(styles)) {
    return parseStyles([styles])
  }

  return styles.flatMap((style) => {
    let isNode = !Array.isArray(style) && !isPlainObject(style)
    return isNode ? style : parseObjectStyles(style)
  })
}

function getClasses(selector) {
  let parser = selectorParser((selectors) => {
    let allClasses = []
    selectors.walkClasses((classNode) => {
      allClasses.push(classNode.value)
    })
    return allClasses
  })
  return parser.transformSync(selector)
}

function extractCandidates(node) {
  let classes = node.type === 'rule' ? getClasses(node.selector) : []

  if (node.type === 'atrule') {
    node.walkRules((rule) => {
      classes = [...classes, ...getClasses(rule.selector)]
    })
  }

  return classes
}

function withIdentifiers(styles) {
  return parseStyles(styles).flatMap((node) => {
    let nodeMap = new Map()
    let candidates = extractCandidates(node)

    // If this isn't "on-demandable", assign it a universal candidate.
    if (candidates.length === 0) {
      return [['*', node]]
    }

    return candidates.map((c) => {
      if (!nodeMap.has(node)) {
        nodeMap.set(node, node)
      }
      return [c, nodeMap.get(node)]
    })
  })
}

function buildPluginApi(tailwindConfig, context, { variantList, variantMap, offsets }) {
  function getConfigValue(path, defaultValue) {
    return path ? dlv(tailwindConfig, path, defaultValue) : tailwindConfig
  }

  function applyConfiguredPrefix(selector) {
    return prefixSelector(tailwindConfig.prefix, selector)
  }

  function prefixIdentifier(identifier, options) {
    if (identifier === '*') {
      return '*'
    }

    if (!options.respectPrefix) {
      return identifier
    }

    if (typeof context.tailwindConfig.prefix === 'function') {
      return prefixSelector(context.tailwindConfig.prefix, `.${identifier}`).substr(1)
    }

    return context.tailwindConfig.prefix + identifier
  }

  return {
    addVariant(variantName, variantFunctions, options = {}) {
      variantFunctions = [].concat(variantFunctions)

      insertInto(variantList, variantName, options)
      variantMap.set(variantName, variantFunctions)
    },
    postcss,
    prefix: applyConfiguredPrefix,
    e: escapeClassName,
    config: getConfigValue,
    theme(path, defaultValue) {
      const [pathRoot, ...subPaths] = toPath(path)
      const value = getConfigValue(['theme', pathRoot, ...subPaths], defaultValue)
      return transformThemeValue(pathRoot)(value)
    },
    corePlugins: (path) => {
      if (Array.isArray(tailwindConfig.corePlugins)) {
        return tailwindConfig.corePlugins.includes(path)
      }

      return getConfigValue(['corePlugins', path], true)
    },
    variants: (path, defaultValue) => {
      if (Array.isArray(tailwindConfig.variants)) {
        return tailwindConfig.variants
      }

      return getConfigValue(['variants', path], defaultValue)
    },
    addBase(base) {
      for (let [identifier, rule] of withIdentifiers(base)) {
        let prefixedIdentifier = prefixIdentifier(identifier, {})
        let offset = offsets.base++

        if (!context.candidateRuleMap.has(prefixedIdentifier)) {
          context.candidateRuleMap.set(prefixedIdentifier, [])
        }

        context.candidateRuleMap
          .get(prefixedIdentifier)
          .push([{ sort: offset, layer: 'base' }, rule])
      }
    },
    addComponents(components, options) {
      let defaultOptions = {
        variants: [],
        respectPrefix: true,
        respectImportant: false,
        respectVariants: true,
      }

      options = Object.assign(
        {},
        defaultOptions,
        Array.isArray(options) ? { variants: options } : options
      )

      for (let [identifier, rule] of withIdentifiers(components)) {
        let prefixedIdentifier = prefixIdentifier(identifier, options)
        let offset = offsets.components++

        if (!context.candidateRuleMap.has(prefixedIdentifier)) {
          context.candidateRuleMap.set(prefixedIdentifier, [])
        }

        context.candidateRuleMap
          .get(prefixedIdentifier)
          .push([{ sort: offset, layer: 'components', options }, rule])
      }
    },
    addUtilities(utilities, options) {
      let defaultOptions = {
        variants: [],
        respectPrefix: true,
        respectImportant: true,
        respectVariants: true,
      }

      options = Object.assign(
        {},
        defaultOptions,
        Array.isArray(options) ? { variants: options } : options
      )

      for (let [identifier, rule] of withIdentifiers(utilities)) {
        let prefixedIdentifier = prefixIdentifier(identifier, options)
        let offset = offsets.utilities++

        if (!context.candidateRuleMap.has(prefixedIdentifier)) {
          context.candidateRuleMap.set(prefixedIdentifier, [])
        }

        context.candidateRuleMap
          .get(prefixedIdentifier)
          .push([{ sort: offset, layer: 'utilities', options }, rule])
      }
    },
    matchUtilities: function (utilities, options) {
      let defaultOptions = {
        variants: [],
        respectPrefix: true,
        respectImportant: true,
        respectVariants: true,
      }

      options = { ...defaultOptions, ...options }

      let offset = offsets.utilities++

      for (let identifier in utilities) {
        let prefixedIdentifier = prefixIdentifier(identifier, options)
        let rule = utilities[identifier]

        function wrapped(modifier) {
          let { type = 'any' } = options
          type = [].concat(type)
          let [value, coercedType] = coerceValue(type, modifier, options.values, tailwindConfig)

          if (!type.includes(coercedType) || value === undefined) {
            return []
          }

          let includedRules = []
          let ruleSets = []
            .concat(
              rule(value, {
                includeRules(rules) {
                  includedRules.push(...rules)
                },
              })
            )
            .filter(Boolean)
            .map((declaration) => ({
              [nameClass(identifier, modifier)]: declaration,
            }))

          return [...includedRules, ...ruleSets]
        }

        let withOffsets = [{ sort: offset, layer: 'utilities', options }, wrapped]

        if (!context.candidateRuleMap.has(prefixedIdentifier)) {
          context.candidateRuleMap.set(prefixedIdentifier, [])
        }

        context.candidateRuleMap.get(prefixedIdentifier).push(withOffsets)
      }
    },
  }
}

let fileModifiedMapCache = new WeakMap()
export function getFileModifiedMap(context) {
  if (!fileModifiedMapCache.has(context)) {
    fileModifiedMapCache.set(context, new Map())
  }
  return fileModifiedMapCache.get(context)
}

export function trackModified(files, fileModifiedMap) {
  let changed = false

  for (let file of files) {
    if (!file) continue

    let parsed = url.parse(file)
    let pathname = parsed.href.replace(parsed.hash, '').replace(parsed.search, '')
    let newModified = fs.statSync(decodeURIComponent(pathname)).mtimeMs

    if (!fileModifiedMap.has(file) || newModified > fileModifiedMap.get(file)) {
      changed = true
    }

    fileModifiedMap.set(file, newModified)
  }

  return changed
}

function extractVariantAtRules(node) {
  node.walkAtRules((atRule) => {
    if (['responsive', 'variants'].includes(atRule.name)) {
      extractVariantAtRules(atRule)
      atRule.before(atRule.nodes)
      atRule.remove()
    }
  })
}

function collectLayerPlugins(root) {
  let layerPlugins = []

  root.each((node) => {
    if (node.type === 'atrule' && ['responsive', 'variants'].includes(node.name)) {
      node.name = 'layer'
      node.params = 'utilities'
    }
  })

  // Walk @layer rules and treat them like plugins
  root.walkAtRules('layer', (layerRule) => {
    extractVariantAtRules(layerRule)

    if (layerRule.params === 'base') {
      for (let node of layerRule.nodes) {
        layerPlugins.push(function ({ addBase }) {
          addBase(node, { respectPrefix: false })
        })
      }
      layerRule.remove()
    } else if (layerRule.params === 'components') {
      for (let node of layerRule.nodes) {
        layerPlugins.push(function ({ addComponents }) {
          addComponents(node, { respectPrefix: false })
        })
      }
      layerRule.remove()
    } else if (layerRule.params === 'utilities') {
      for (let node of layerRule.nodes) {
        layerPlugins.push(function ({ addUtilities }) {
          addUtilities(node, { respectPrefix: false })
        })
      }
      layerRule.remove()
    }
  })

  return layerPlugins
}

function resolvePlugins(context, tailwindDirectives, root) {
  let corePluginList = Object.entries(corePlugins)
    .map(([name, plugin]) => {
      if (!context.tailwindConfig.corePlugins.includes(name)) {
        return null
      }

      return plugin
    })
    .filter(Boolean)

  let userPlugins = context.tailwindConfig.plugins.map((plugin) => {
    if (plugin.__isOptionsFunction) {
      plugin = plugin()
    }

    return typeof plugin === 'function' ? plugin : plugin.handler
  })

  let layerPlugins = collectLayerPlugins(root, tailwindDirectives)

  // TODO: This is a workaround for backwards compatibility, since custom variants
  // were historically sorted before screen/stackable variants.
  let beforeVariants = [corePlugins['pseudoElementVariants'], corePlugins['pseudoClassVariants']]
  let afterVariants = [
    corePlugins['directionVariants'],
    corePlugins['reducedMotionVariants'],
    corePlugins['darkVariants'],
    corePlugins['screenVariants'],
  ]

  return [...corePluginList, ...beforeVariants, ...userPlugins, ...afterVariants, ...layerPlugins]
}

function registerPlugins(plugins, context) {
  let variantList = []
  let variantMap = new Map()
  let offsets = {
    base: 0n,
    components: 0n,
    utilities: 0n,
  }

  let pluginApi = buildPluginApi(context.tailwindConfig, context, {
    variantList,
    variantMap,
    offsets,
  })

  for (let plugin of plugins) {
    if (Array.isArray(plugin)) {
      for (let pluginItem of plugin) {
        pluginItem(pluginApi)
      }
    } else {
      plugin(pluginApi)
    }
  }

  let highestOffset = ((args) => args.reduce((m, e) => (e > m ? e : m)))([
    offsets.base,
    offsets.components,
    offsets.utilities,
  ])
  let reservedBits = BigInt(highestOffset.toString(2).length)

  context.layerOrder = {
    base: (1n << reservedBits) << 0n,
    components: (1n << reservedBits) << 1n,
    utilities: (1n << reservedBits) << 2n,
  }

  reservedBits += 3n

  let offset = 0
  context.variantOrder = new Map(
    variantList
      .map((variant, i) => {
        let variantFunctions = variantMap.get(variant).length
        let bits = (1n << BigInt(i + offset)) << reservedBits
        offset += variantFunctions - 1
        return [variant, bits]
      })
      .sort(([, a], [, z]) => bigSign(a - z))
  )

  context.minimumScreen = [...context.variantOrder.values()].shift()

  // Build variantMap
  for (let [variantName, variantFunctions] of variantMap.entries()) {
    let sort = context.variantOrder.get(variantName)
    context.variantMap.set(
      variantName,
      variantFunctions.map((variantFunction, idx) => [sort << BigInt(idx), variantFunction])
    )
  }
}

export function createContext(
  tailwindConfig,
  changedContent = [],
  tailwindDirectives = new Set(),
  root = postcss.root()
) {
  let context = {
    disposables: [],
    ruleCache: new Set(),
    classCache: new Map(),
    applyClassCache: new Map(),
    notClassCache: new Set(),
    postCssNodeCache: new Map(),
    candidateRuleMap: new Map(),
    tailwindConfig,
    changedContent: changedContent,
    variantMap: new Map(),
    stylesheetCache: null,
  }

  let resolvedPlugins = resolvePlugins(context, tailwindDirectives, root)
  registerPlugins(resolvedPlugins, context)

  return context
}

let contextMap = sharedState.contextMap
let configContextMap = sharedState.configContextMap
let contextSourcesMap = sharedState.contextSourcesMap

export function getContext(
  tailwindDirectives,
  root,
  result,
  tailwindConfig,
  userConfigPath,
  tailwindConfigHash,
  contextDependencies
) {
  let sourcePath = result.opts.from
  let isConfigFile = userConfigPath !== null

  env.DEBUG && console.log('Source path:', sourcePath)

  let existingContext

  if (isConfigFile && contextMap.has(sourcePath)) {
    existingContext = contextMap.get(sourcePath)
  } else if (configContextMap.has(tailwindConfigHash)) {
    let context = configContextMap.get(tailwindConfigHash)
    contextSourcesMap.get(context).add(sourcePath)
    contextMap.set(sourcePath, context)

    existingContext = context
  }

  // If there's already a context in the cache and we don't need to
  // reset the context, return the cached context.
  if (existingContext) {
    let contextDependenciesChanged = trackModified(
      [...contextDependencies],
      getFileModifiedMap(existingContext)
    )
    if (!contextDependenciesChanged) {
      return [existingContext, false]
    }
  }

  // If this source is in the context map, get the old context.
  // Remove this source from the context sources for the old context,
  // and clean up that context if no one else is using it. This can be
  // called by many processes in rapid succession, so we check for presence
  // first because the first process to run this code will wipe it out first.
  if (contextMap.has(sourcePath)) {
    let oldContext = contextMap.get(sourcePath)
    if (contextSourcesMap.has(oldContext)) {
      contextSourcesMap.get(oldContext).delete(sourcePath)
      if (contextSourcesMap.get(oldContext).size === 0) {
        contextSourcesMap.delete(oldContext)
        for (let [tailwindConfigHash, context] of configContextMap) {
          if (context === oldContext) {
            configContextMap.delete(tailwindConfigHash)
          }
        }
        for (let disposable of oldContext.disposables.splice(0)) {
          disposable(oldContext)
        }
      }
    }
  }

  env.DEBUG && console.log('Setting up new context...')

  let context = createContext(tailwindConfig, [], tailwindDirectives, root)

  // ---

  // Update all context tracking state

  configContextMap.set(tailwindConfigHash, context)
  contextMap.set(sourcePath, context)

  if (!contextSourcesMap.has(context)) {
    contextSourcesMap.set(context, new Set())
  }

  contextSourcesMap.get(context).add(sourcePath)

  return [context, true]
}
