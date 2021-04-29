import mapObject from '../util/mapObject'
import flattenColorPalette from '../util/flattenColorPalette'
import nameClass from '../util/nameClass'
import toColorValue from '../util/toColorValue'

export default () => ({ addUtilities, theme, variants }) => {
  const colors = flattenColorPalette(theme('fill'))

  const utilities = mapObject(colors, ([modifier, value]) => [
    nameClass('fill', modifier),
    { fill: toColorValue(value) },
  ])

  addUtilities(utilities, variants('fill'))
}
