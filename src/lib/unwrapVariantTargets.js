import postcss from 'postcss'
import selectorParser from 'postcss-selector-parser'

export default function () {
  return function (css) {
    css.walkRules((rule) => {
      if (rule.type != 'rule') {
        return
      }

      const container = postcss.rule(rule.clone())

      container.selectors = container.selectors.map((selector) =>
        selectorParser((selectors) => {
          selectors.first.walkAttributes((attributeNode) => {
            if (attributeNode.attribute.startsWith('.')) {
              const className = attributeNode.attribute.slice(1)
              const classNode = selectorParser.className()
              classNode.value = className
              attributeNode.replaceWith(classNode)
            }
          })
        }).processSync(selector)
      )

      rule.replaceWith(container)
    })
  }
}
