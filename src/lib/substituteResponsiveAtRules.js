import _ from 'lodash'
import postcss from 'postcss'
import cloneNodes from '../util/cloneNodes'
import buildMediaQuery from '../util/buildMediaQuery'
import buildSelectorVariant from '../util/buildSelectorVariant'

function isLayer(node) {
  if (Array.isArray(node)) {
    return node.length === 1 && isLayer(node[0])
  }
  return node.type === 'atrule' && node.name === 'layer'
}

function layerNodes(nodes) {
  return isLayer(nodes) ? nodes[0].nodes : nodes
}

export default function (config) {
  return function (css) {
    // Wrap any `responsive` rules with a copy of their parent `layer` to
    // ensure the layer isn't lost when copying to the `screens` location.
    css.walkAtRules('layer', (layerAtRule) => {
      const layer = layerAtRule.params
      layerAtRule.walkAtRules('responsive', (responsiveAtRule) => {
        const nestedlayerAtRule = postcss.atRule({
          name: 'layer',
          params: layer,
        })
        nestedlayerAtRule.prepend(responsiveAtRule.nodes)
        responsiveAtRule.removeAll()
        responsiveAtRule.prepend(nestedlayerAtRule)
      })
    })

    const {
      theme: { screens },
      separator,
    } = config
    const responsiveRules = postcss.root()
    const finalRules = []

    css.walkAtRules('responsive', (atRule) => {
      const nodes = atRule.nodes
      responsiveRules.append(...cloneNodes(nodes))

      // If the parent is already a `layer` (this is true for anything coming from
      // a plugin, including core plugins) we don't want to create a double nested
      // layer, so only insert the layer children. If there is no parent layer,
      // preserve the layer information when inserting the nodes.
      if (isLayer(atRule.parent)) {
        atRule.before(layerNodes(nodes))
      } else {
        atRule.before(nodes)
      }
      atRule.remove()
    })

    _.keys(screens).forEach((screen) => {
      const mediaQuery = postcss.atRule({
        name: 'media',
        params: buildMediaQuery(screens[screen]),
      })

      mediaQuery.append(
        _.tap(responsiveRules.clone(), (clonedRoot) => {
          clonedRoot.walkRules((rule) => {
            rule.selectors = _.map(rule.selectors, (selector) =>
              buildSelectorVariant({
                selector,
                variant: screen,
                separator,
                onError: (message) => {
                  throw rule.error(message)
                },
              })
            )
          })
        })
      )

      finalRules.push(mediaQuery)
    })

    const hasScreenRules = finalRules.some((i) => i.nodes.length !== 0)

    css.walkAtRules('tailwind', (atRule) => {
      if (atRule.params !== 'screens') {
        return
      }

      if (hasScreenRules) {
        atRule.before(finalRules)
      }

      atRule.remove()
    })
  }
}
