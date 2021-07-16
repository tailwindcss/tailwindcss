import _ from 'lodash'
import postcss from 'postcss'
import Node from 'postcss/lib/node'
import isFunction from 'lodash/isFunction'
import escapeClassName from '../util/escapeClassName'
import generateVariantFunction from '../util/generateVariantFunction'
import parseObjectStyles from '../util/parseObjectStyles'
import prefixSelector from '../util/prefixSelector'
import wrapWithVariants from '../util/wrapWithVariants'
import cloneNodes from '../util/cloneNodes'
import transformThemeValue from './transformThemeValue'
import nameClass from '../util/nameClass'

function parseStyles(styles) {
  if (!Array.isArray(styles)) {
    return parseStyles([styles])
  }

  return _.flatMap(styles, (style) => (style instanceof Node ? style : parseObjectStyles(style)))
}

function wrapWithLayer(rules, layer) {
  return postcss
    .atRule({
      name: 'layer',
      params: layer,
    })
    .append(cloneNodes(Array.isArray(rules) ? rules : [rules]))
}

function isKeyframeRule(rule) {
  return rule.parent && rule.parent.type === 'atrule' && /keyframes$/.test(rule.parent.name)
}

export default function (plugins, config) {
  const pluginBaseStyles = []
  const pluginComponents = []
  const pluginUtilities = []
  const pluginVariantGenerators = {}

  const applyConfiguredPrefix = (selector) => {
    return prefixSelector(config.prefix, selector)
  }

  function addUtilities(utilities, options) {
    const defaultOptions = {
      variants: [],
      respectPrefix: true,
      respectImportant: true,
    }

    options = Array.isArray(options)
      ? Object.assign({}, defaultOptions, { variants: options })
      : _.defaults(options, defaultOptions)

    const styles = postcss.root({ nodes: parseStyles(utilities) })

    styles.walkRules((rule) => {
      if (options.respectPrefix && !isKeyframeRule(rule)) {
        rule.selector = applyConfiguredPrefix(rule.selector)
      }

      if (options.respectImportant && config.important) {
        rule.__tailwind = {
          ...rule.__tailwind,
          important: config.important,
        }
      }
    })

    pluginUtilities.push(
      wrapWithLayer(wrapWithVariants(styles.nodes, options.variants), 'utilities')
    )
  }

  const getConfigValue = (path, defaultValue) => (path ? _.get(config, path, defaultValue) : config)

  plugins.forEach((plugin) => {
    if (plugin.__isOptionsFunction) {
      plugin = plugin()
    }

    const handler = isFunction(plugin) ? plugin : _.get(plugin, 'handler', () => {})

    handler({
      postcss,
      config: getConfigValue,
      theme: (path, defaultValue) => {
        const [pathRoot, ...subPaths] = _.toPath(path)
        const value = getConfigValue(['theme', pathRoot, ...subPaths], defaultValue)

        return transformThemeValue(pathRoot)(value)
      },
      corePlugins: (path) => {
        if (Array.isArray(config.corePlugins)) {
          return config.corePlugins.includes(path)
        }

        return getConfigValue(`corePlugins.${path}`, true)
      },
      variants: (path, defaultValue) => {
        if (Array.isArray(config.variants)) {
          return config.variants
        }

        return getConfigValue(`variants.${path}`, defaultValue)
      },
      e: escapeClassName,
      prefix: applyConfiguredPrefix,
      addUtilities,
      matchUtilities: (matches, { values, variants, respectPrefix, respectImportant }) => {
        let modifierValues = Object.entries(values || {})

        let result = Object.entries(matches).flatMap(([name, utilityFunction]) => {
          return modifierValues
            .map(([modifier, value]) => {
              let declarations = utilityFunction(value, {
                includeRules(rules, options) {
                  addUtilities(rules, options)
                },
              })

              if (!declarations) {
                return null
              }

              return {
                [nameClass(name, modifier)]: declarations,
              }
            })
            .filter(Boolean)
        })

        addUtilities(result, { variants, respectPrefix, respectImportant })
      },
      addComponents: (components, options) => {
        const defaultOptions = { variants: [], respectPrefix: true }

        options = Array.isArray(options)
          ? Object.assign({}, defaultOptions, { variants: options })
          : _.defaults(options, defaultOptions)

        const styles = postcss.root({ nodes: parseStyles(components) })

        styles.walkRules((rule) => {
          if (options.respectPrefix && !isKeyframeRule(rule)) {
            rule.selector = applyConfiguredPrefix(rule.selector)
          }
        })

        pluginComponents.push(
          wrapWithLayer(wrapWithVariants(styles.nodes, options.variants), 'components')
        )
      },
      addBase: (baseStyles) => {
        pluginBaseStyles.push(wrapWithLayer(parseStyles(baseStyles), 'base'))
      },
      addVariant: (name, generator, options = {}) => {
        pluginVariantGenerators[name] = generateVariantFunction(generator, options)
      },
    })
  })

  return {
    base: pluginBaseStyles,
    components: pluginComponents,
    utilities: pluginUtilities,
    variantGenerators: pluginVariantGenerators,
  }
}
