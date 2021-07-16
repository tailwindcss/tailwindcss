import transformThemeValue from './transformThemeValue'
import { asValue, asList, asColor, asAngle, asLength, asLookupValue } from '../util/pluginUtils'

let asMap = new Map([
  [asValue, 'any'],
  [asList, 'list'],
  [asColor, 'color'],
  [asAngle, 'angle'],
  [asLength, 'length'],
  [asLookupValue, 'lookup'],
])

export default function createUtilityPlugin(
  themeKey,
  utilityVariations = [[themeKey, [themeKey]]],
  { filterDefault = false, resolveArbitraryValue = asValue } = {}
) {
  let transformValue = transformThemeValue(themeKey)
  return function ({ matchUtilities, variants, theme }) {
    for (let utilityVariation of utilityVariations) {
      let group = Array.isArray(utilityVariation[0]) ? utilityVariation : [utilityVariation]

      matchUtilities(
        group.reduce((obj, [classPrefix, properties]) => {
          return Object.assign(obj, {
            [classPrefix]: (value) => {
              return properties.reduce((obj, name) => {
                if (Array.isArray(name)) {
                  return Object.assign(obj, { [name[0]]: name[1] })
                }
                return Object.assign(obj, { [name]: transformValue(value) })
              }, {})
            },
          })
        }, {}),
        {
          values: filterDefault
            ? Object.fromEntries(
                Object.entries(theme(themeKey) || {}).filter(([modifier]) => modifier !== 'DEFAULT')
              )
            : theme(themeKey),
          variants: variants(themeKey),
          type: asMap.get(resolveArbitraryValue) ?? 'any',
        }
      )
    }
  }
}
