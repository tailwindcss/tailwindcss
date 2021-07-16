import parser from 'postcss-selector-parser'
import { useMemo } from './useMemo'

const buildSelectorVariant = useMemo(
  ({ selector, variant = '', separator = '', modifyTarget = () => {}, onError = () => {} }) => {
    return parser((selectors) => {
      const selector = selectors.first

      const defaultTarget = selector.filter(({ type }) => type === 'class').pop()
      const explicitTargets = []

      selector.walkAttributes((attributeNode) => {
        if (attributeNode.attribute.startsWith('.')) {
          explicitTargets.push(attributeNode)
        }
      })

      if (defaultTarget === undefined && !explicitTargets.length) {
        onError('Variant cannot be generated because selector contains no classes.')
        return
      }

      if (explicitTargets.length) {
        explicitTargets.forEach((target) => {
          // Build a class node from the attribute
          const className = target.attribute.slice(1)
          const classNode = parser.className({ value: className })

          // Replace the attribute with the new class node. This will ensure interoperability
          // between this `modifyTarget` call and the default `modifyTarget` call
          target.replaceWith(classNode)
          classNode.value = `${variant}${separator}${classNode.value}`
          modifyTarget(classNode)

          // Then, wrap the class name in a variant target again
          target.attribute = `.${classNode.value}`
          classNode.replaceWith(target)
        })
      } else {
        defaultTarget.value = `${variant}${separator}${defaultTarget.value}`
        modifyTarget(defaultTarget)
      }
    }).processSync(selector)
  },
  ({ selector, variant, separator }) => [selector, variant, separator].join('||')
)

export default buildSelectorVariant
