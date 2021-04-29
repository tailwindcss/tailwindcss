import mapObject from '../util/mapObject'
import flattenColorPalette from '../util/flattenColorPalette'
import nameClass from '../util/nameClass'
import toColorValue from '../util/toColorValue'

export default () => ({ addUtilities, theme, variants }) => {
  const { DEFAULT, ...colors } = flattenColorPalette(theme('ringOffsetColor'))
  const utilities = mapObject(colors, ([modifier, value]) => [
    nameClass('ring-offset', modifier),
    {
      '--tw-ring-offset-color': toColorValue(value),
    },
  ])
  addUtilities(utilities, variants('ringOffsetColor'))
}
