import * as sharedState from './sharedState'
import { generateRules } from './generateRules'
import bigSign from '../../util/bigSign'
import cloneNodes from '../../util/cloneNodes'

let env = sharedState.env
let contentMatchCache = sharedState.contentMatchCache

const BROAD_MATCH_GLOBAL_REGEXP = /([^<>"'`\s]*\[[^<>\s]+\])|([^<>"'`\s]*[^<>"'`\s:])/g
const INNER_MATCH_GLOBAL_REGEXP = /[^<>"'`\s.(){}[\]#=%]*[^<>"'`\s.(){}[\]#=%:]/g

const builtInExtractors = {
  DEFAULT: (content) => {
    let broadMatches = content.match(BROAD_MATCH_GLOBAL_REGEXP) || []
    let innerMatches = content.match(INNER_MATCH_GLOBAL_REGEXP) || []

    return [...broadMatches, ...innerMatches]
  },
}

const builtInTransformers = {
  DEFAULT: (content) => content,
  svelte: (content) => content.replace(/(?:^|\s)class:/g, ' '),
}

function getExtractor(tailwindConfig, fileExtension) {
  let extractors = (tailwindConfig && tailwindConfig.purge && tailwindConfig.purge.extract) || {}
  const purgeOptions =
    (tailwindConfig && tailwindConfig.purge && tailwindConfig.purge.options) || {}

  if (typeof extractors === 'function') {
    extractors = {
      DEFAULT: extractors,
    }
  }
  if (purgeOptions.defaultExtractor) {
    extractors.DEFAULT = purgeOptions.defaultExtractor
  }
  for (let { extensions, extractor } of purgeOptions.extractors || []) {
    for (let extension of extensions) {
      extractors[extension] = extractor
    }
  }

  return (
    extractors[fileExtension] ||
    extractors.DEFAULT ||
    builtInExtractors[fileExtension] ||
    builtInExtractors.DEFAULT
  )
}

function getTransformer(tailwindConfig, fileExtension) {
  let transformers =
    (tailwindConfig && tailwindConfig.purge && tailwindConfig.purge.transform) || {}

  if (typeof transformers === 'function') {
    transformers = {
      DEFAULT: transformers,
    }
  }

  return (
    transformers[fileExtension] ||
    transformers.DEFAULT ||
    builtInTransformers[fileExtension] ||
    builtInTransformers.DEFAULT
  )
}

// Scans template contents for possible classes. This is a hot path on initial build but
// not too important for subsequent builds. The faster the better though — if we can speed
// up these regexes by 50% that could cut initial build time by like 20%.
function getClassCandidates(content, extractor, contentMatchCache, candidates, seen) {
  for (let line of content.split('\n')) {
    line = line.trim()

    if (seen.has(line)) {
      continue
    }
    seen.add(line)

    if (contentMatchCache.has(line)) {
      for (let match of contentMatchCache.get(line)) {
        candidates.add(match)
      }
    } else {
      let extractorMatches = extractor(line)
      let lineMatchesSet = new Set(extractorMatches)

      for (let match of lineMatchesSet) {
        candidates.add(match)
      }

      contentMatchCache.set(line, lineMatchesSet)
    }
  }
}

function buildStylesheet(rules, context) {
  let sortedRules = rules.sort(([a], [z]) => bigSign(a - z))

  let returnValue = {
    base: new Set(),
    components: new Set(),
    utilities: new Set(),
    variants: new Set(),
  }

  for (let [sort, rule] of sortedRules) {
    if (sort >= context.minimumScreen) {
      returnValue.variants.add(rule)
      continue
    }

    if (sort & context.layerOrder.base) {
      returnValue.base.add(rule)
      continue
    }

    if (sort & context.layerOrder.components) {
      returnValue.components.add(rule)
      continue
    }

    if (sort & context.layerOrder.utilities) {
      returnValue.utilities.add(rule)
      continue
    }
  }

  return returnValue
}

export default function expandTailwindAtRules(context) {
  return (root) => {
    let layerNodes = {
      base: null,
      components: null,
      utilities: null,
      variants: null,
    }

    // Make sure this file contains Tailwind directives. If not, we can save
    // a lot of work and bail early. Also we don't have to register our touch
    // file as a dependency since the output of this CSS does not depend on
    // the source of any templates. Think Vue <style> blocks for example.
    root.walkAtRules('tailwind', (rule) => {
      if (Object.keys(layerNodes).includes(rule.params)) {
        layerNodes[rule.params] = rule
      }
    })

    if (Object.values(layerNodes).every((n) => n === null)) {
      return root
    }

    // ---

    // Find potential rules in changed files
    let candidates = new Set(['*'])
    let seen = new Set()

    env.DEBUG && console.time('Reading changed files')

    for (let { content, extension } of context.changedContent) {
      let transformer = getTransformer(context.tailwindConfig, extension)
      let extractor = getExtractor(context.tailwindConfig, extension)
      getClassCandidates(transformer(content), extractor, contentMatchCache, candidates, seen)
    }

    console.log(candidates)

    // ---

    // Generate the actual CSS
    let classCacheCount = context.classCache.size

    env.DEBUG && console.time('Generate rules')
    let rules = generateRules(candidates, context)
    env.DEBUG && console.timeEnd('Generate rules')

    // We only ever add to the classCache, so if it didn't grow, there is nothing new.
    env.DEBUG && console.time('Build stylesheet')
    if (context.stylesheetCache === null || context.classCache.size !== classCacheCount) {
      for (let rule of rules) {
        context.ruleCache.add(rule)
      }

      context.stylesheetCache = buildStylesheet([...context.ruleCache], context)
    }
    env.DEBUG && console.timeEnd('Build stylesheet')

    let {
      base: baseNodes,
      components: componentNodes,
      utilities: utilityNodes,
      variants: screenNodes,
    } = context.stylesheetCache

    // ---

    // Replace any Tailwind directives with generated CSS

    if (layerNodes.base) {
      layerNodes.base.before(cloneNodes([...baseNodes], layerNodes.base.source))
      layerNodes.base.remove()
    }

    if (layerNodes.components) {
      layerNodes.components.before(cloneNodes([...componentNodes], layerNodes.components.source))
      layerNodes.components.remove()
    }

    if (layerNodes.utilities) {
      layerNodes.utilities.before(cloneNodes([...utilityNodes], layerNodes.utilities.source))
      layerNodes.utilities.remove()
    }

    if (layerNodes.variants) {
      layerNodes.variants.before(cloneNodes([...screenNodes], layerNodes.variants.source))
      layerNodes.variants.remove()
    } else {
      root.append(cloneNodes([...screenNodes], root.source))
    }

    // ---

    if (env.DEBUG) {
      console.log('Potential classes: ', candidates.size)
      console.log('Active contexts: ', sharedState.contextSourcesMap.size)
      console.log('Content match entries', contentMatchCache.size)
    }

    // Clear the cache for the changed files
    context.changedContent = []
  }
}
