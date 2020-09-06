import _ from 'lodash'
import postcss from 'postcss'
import browserslist from 'browserslist'
import Node from 'postcss/lib/node'
import isFunction from 'lodash/isFunction'
import escapeClassName from '../util/escapeClassName'
import generateVariantFunction from '../util/generateVariantFunction'
import parseObjectStyles from '../util/parseObjectStyles'
import prefixSelector from '../util/prefixSelector'
import wrapWithVariants from '../util/wrapWithVariants'
import cloneNodes from '../util/cloneNodes'

function parseStyles(styles) {
  if (!Array.isArray(styles)) {
    return parseStyles([styles])
  }

  return _.flatMap(styles, style => (style instanceof Node ? style : parseObjectStyles(style)))
}

function wrapWithLayer(rules, layer) {
  return postcss
    .atRule({
      name: 'layer',
      params: layer,
    })
    .append(cloneNodes(Array.isArray(rules) ? rules : [rules]))
}

export default function(plugins, config) {
  const pluginBaseStyles = []
  const pluginComponents = []
  const pluginUtilities = []
  const pluginVariantGenerators = {}

  const applyConfiguredPrefix = selector => {
    return prefixSelector(config.prefix, selector)
  }

  const getConfigValue = (path, defaultValue) => (path ? _.get(config, path, defaultValue) : config)
  const browserslistTarget = browserslist().includes('ie 11') ? 'ie11' : 'relaxed'

  plugins.forEach(plugin => {
    if (plugin.__isOptionsFunction) {
      plugin = plugin()
    }

    const handler = isFunction(plugin) ? plugin : _.get(plugin, 'handler', () => {})

    handler({
      postcss,
      config: getConfigValue,
      theme: (path, defaultValue) => getConfigValue(`theme.${path}`, defaultValue),
      corePlugins: path => {
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
      target: path => {
        if (_.isString(config.target)) {
          return config.target === 'browserslist' ? browserslistTarget : config.target
        }

        const [defaultTarget, targetOverrides] = getConfigValue('target')

        const target = _.get(targetOverrides, path, defaultTarget)

        return target === 'browserslist' ? browserslistTarget : target
      },
      e: escapeClassName,
      prefix: applyConfiguredPrefix,
      addUtilities: (utilities, options) => {
        const defaultOptions = {
          variants: [],
          respectPrefix: true,
          respectImportant: true,
          appendUtilities: true,
        }

        options = Array.isArray(options)
          ? Object.assign({}, defaultOptions, { variants: options })
          : _.defaults(options, defaultOptions)

        const styles = postcss.root({ nodes: parseStyles(utilities) })

        styles.walkRules(rule => {
          if (options.respectPrefix) {
            rule.selector = applyConfiguredPrefix(rule.selector)
          }

          if (options.respectImportant && config.important) {
            rule.__tailwind = {
              ...rule.__tailwind,
              important: config.important,
            }
          }
        })

        const addedUtilities = wrapWithLayer(
          wrapWithVariants(styles.nodes, options.variants),
          'utilities'
        )

        if (config.appendUtilities) {
          pluginUtilities.push(addedUtilities)
        } else {
          pluginUtilities.unshift(addedUtilities)
        }
      },
      addComponents: (components, options) => {
        const defaultOptions = { variants: [], respectPrefix: true }

        options = Array.isArray(options)
          ? Object.assign({}, defaultOptions, { variants: options })
          : _.defaults(options, defaultOptions)

        const styles = postcss.root({ nodes: parseStyles(components) })

        styles.walkRules(rule => {
          if (options.respectPrefix) {
            rule.selector = applyConfiguredPrefix(rule.selector)
          }
        })

        pluginComponents.push(
          wrapWithLayer(wrapWithVariants(styles.nodes, options.variants), 'components')
        )
      },
      addBase: baseStyles => {
        pluginBaseStyles.push(wrapWithLayer(parseStyles(baseStyles), 'base'))
      },
      addVariant: (name, generator) => {
        pluginVariantGenerators[name] = generateVariantFunction(generator)
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
