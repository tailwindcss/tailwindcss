import postcss from 'postcss'
import * as corePlugins from '../plugins'
import buildMediaQuery from '../util/buildMediaQuery'
import prefixSelector from '../util/prefixSelector'
import {
  applyPseudoToMarker,
  updateLastClasses,
  updateAllClasses,
  transformAllSelectors,
  transformAllClasses,
  transformLastClasses,
} from '../util/pluginUtils'

export default {
  pseudoElementVariants: function ({ config, addVariant }) {
    addVariant(
      'first-letter',
      transformAllSelectors((selector) => {
        return updateAllClasses(selector, (className, { withPseudo }) => {
          return withPseudo(`first-letter${config('separator')}${className}`, '::first-letter')
        })
      })
    )

    addVariant(
      'first-line',
      transformAllSelectors((selector) => {
        return updateAllClasses(selector, (className, { withPseudo }) => {
          return withPseudo(`first-line${config('separator')}${className}`, '::first-line')
        })
      })
    )

    addVariant('marker', [
      transformAllSelectors((selector) => {
        let variantSelector = updateAllClasses(selector, (className) => {
          return `marker${config('separator')}${className}`
        })

        return `${variantSelector} *::marker`
      }),
      transformAllSelectors((selector) => {
        return updateAllClasses(selector, (className, { withPseudo }) => {
          return withPseudo(`marker${config('separator')}${className}`, '::marker')
        })
      }),
    ])

    addVariant('selection', [
      transformAllSelectors((selector) => {
        let variantSelector = updateAllClasses(selector, (className) => {
          return `selection${config('separator')}${className}`
        })

        return `${variantSelector} *::selection`
      }),
      transformAllSelectors((selector) => {
        return updateAllClasses(selector, (className, { withPseudo }) => {
          return withPseudo(`selection${config('separator')}${className}`, '::selection')
        })
      }),
    ])

    addVariant('file-selector-button', [
      transformAllSelectors((selector) => {
        return updateAllClasses(selector, (className, { withPseudo }) => {
          return withPseudo(
            `file-selector-button${config('separator')}${className}`,
            '::-webkit-file-upload-button'
          )
        })
      }),
      transformAllSelectors((selector) => {
        return updateAllClasses(selector, (className, { withPseudo }) => {
          return withPseudo(
            `file-selector-button${config('separator')}${className}`,
            '::file-selector-button'
          )
        })
      }),
    ])

    addVariant(
      'before',
      transformAllSelectors(
        (selector) => {
          return updateAllClasses(selector, (className, { withPseudo }) => {
            return withPseudo(`before${config('separator')}${className}`, '::before')
          })
        },
        {
          withRule: (rule) => {
            let foundContent = false
            rule.walkDecls('content', () => {
              foundContent = true
            })
            if (!foundContent) {
              rule.prepend(postcss.decl({ prop: 'content', value: '""' }))
            }
          },
        }
      )
    )

    addVariant(
      'after',
      transformAllSelectors(
        (selector) => {
          return updateAllClasses(selector, (className, { withPseudo }) => {
            return withPseudo(`after${config('separator')}${className}`, '::after')
          })
        },
        {
          withRule: (rule) => {
            let foundContent = false
            rule.walkDecls('content', () => {
              foundContent = true
            })
            if (!foundContent) {
              rule.prepend(postcss.decl({ prop: 'content', value: '""' }))
            }
          },
        }
      )
    )
  },
  pseudoClassVariants: function ({ config, addVariant }) {
    let pseudoVariants = [
      // Positional
      ['first', 'first-child'],
      ['last', 'last-child'],
      ['only', 'only-child'],
      ['odd', 'nth-child(odd)'],
      ['even', 'nth-child(even)'],
      'first-of-type',
      'last-of-type',
      'only-of-type',

      // State
      'visited',
      'target',

      // Forms
      'default',
      'checked',
      'indeterminate',
      'placeholder-shown',
      'autofill',
      'required',
      'valid',
      'invalid',
      'in-range',
      'out-of-range',
      'read-only',

      // Content
      'empty',

      // Interactive
      'focus-within',
      'hover',
      'focus',
      'focus-visible',
      'active',
      'disabled',
    ]

    for (let variant of pseudoVariants) {
      let [variantName, state] = Array.isArray(variant) ? variant : [variant, variant]

      addVariant(
        variantName,
        transformAllClasses((className, { withPseudo }) => {
          return withPseudo(`${variantName}${config('separator')}${className}`, `:${state}`)
        })
      )
    }

    let groupMarker = prefixSelector(config('prefix'), '.group')
    for (let variant of pseudoVariants) {
      let [variantName, state] = Array.isArray(variant) ? variant : [variant, variant]
      let groupVariantName = `group-${variantName}`

      addVariant(
        groupVariantName,
        transformAllSelectors((selector) => {
          let variantSelector = updateAllClasses(selector, (className) => {
            if (`.${className}` === groupMarker) return className
            return `${groupVariantName}${config('separator')}${className}`
          })

          if (variantSelector === selector) {
            return null
          }

          return applyPseudoToMarker(
            variantSelector,
            groupMarker,
            state,
            (marker, selector) => `${marker} ${selector}`
          )
        })
      )
    }

    let peerMarker = prefixSelector(config('prefix'), '.peer')
    for (let variant of pseudoVariants) {
      let [variantName, state] = Array.isArray(variant) ? variant : [variant, variant]
      let peerVariantName = `peer-${variantName}`

      addVariant(
        peerVariantName,
        transformAllSelectors((selector) => {
          let variantSelector = updateAllClasses(selector, (className) => {
            if (`.${className}` === peerMarker) return className
            return `${peerVariantName}${config('separator')}${className}`
          })

          if (variantSelector === selector) {
            return null
          }

          return applyPseudoToMarker(variantSelector, peerMarker, state, (marker, selector) =>
            selector.trim().startsWith('~') ? `${marker}${selector}` : `${marker} ~ ${selector}`
          )
        })
      )
    }
  },
  directionVariants: function ({ config, addVariant }) {
    addVariant(
      'ltr',
      transformAllSelectors(
        (selector) =>
          `[dir="ltr"] ${updateAllClasses(
            selector,
            (className) => `ltr${config('separator')}${className}`
          )}`
      )
    )

    addVariant(
      'rtl',
      transformAllSelectors(
        (selector) =>
          `[dir="rtl"] ${updateAllClasses(
            selector,
            (className) => `rtl${config('separator')}${className}`
          )}`
      )
    )
  },
  reducedMotionVariants: function ({ config, addVariant }) {
    addVariant(
      'motion-safe',
      transformLastClasses(
        (className) => {
          return `motion-safe${config('separator')}${className}`
        },
        {
          wrap: () =>
            postcss.atRule({
              name: 'media',
              params: '(prefers-reduced-motion: no-preference)',
            }),
        }
      )
    )

    addVariant(
      'motion-reduce',
      transformLastClasses(
        (className) => {
          return `motion-reduce${config('separator')}${className}`
        },
        {
          wrap: () =>
            postcss.atRule({
              name: 'media',
              params: '(prefers-reduced-motion: reduce)',
            }),
        }
      )
    )
  },
  darkVariants: function ({ config, addVariant }) {
    if (config('darkMode') === 'class') {
      addVariant(
        'dark',
        transformAllSelectors((selector) => {
          let variantSelector = updateLastClasses(selector, (className) => {
            return `dark${config('separator')}${className}`
          })

          if (variantSelector === selector) {
            return null
          }

          let darkSelector = prefixSelector(config('prefix'), `.dark`)

          return `${darkSelector} ${variantSelector}`
        })
      )
    } else if (config('darkMode') === 'media') {
      addVariant(
        'dark',
        transformLastClasses(
          (className) => {
            return `dark${config('separator')}${className}`
          },
          {
            wrap: () =>
              postcss.atRule({
                name: 'media',
                params: '(prefers-color-scheme: dark)',
              }),
          }
        )
      )
    }
  },
  screenVariants: function ({ config, theme, addVariant }) {
    for (let screen in theme('screens')) {
      let size = theme('screens')[screen]
      let query = buildMediaQuery(size)

      addVariant(
        screen,
        transformLastClasses(
          (className) => {
            return `${screen}${config('separator')}${className}`
          },
          { wrap: () => postcss.atRule({ name: 'media', params: query }) }
        )
      )
    }
  },

  ...Object.fromEntries(
    Object.entries(corePlugins).map(([pluginName, plugin]) => {
      return [pluginName, plugin()]
    })
  ),
}
