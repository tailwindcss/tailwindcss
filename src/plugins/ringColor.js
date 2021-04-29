import mapObject from '../util/mapObject'
import flattenColorPalette from '../util/flattenColorPalette'
import nameClass from '../util/nameClass'
import withAlphaVariable from '../util/withAlphaVariable'

export default () => ({ addUtilities, theme, variants }) => {
  const { DEFAULT, ...colors } = flattenColorPalette(theme('ringColor'))

  const getProperties = (value) =>
    withAlphaVariable({
      color: value,
      property: '--tw-ring-color',
      variable: '--tw-ring-opacity',
    })

  const utilities = mapObject(colors, ([modifier, value]) => [
    nameClass('ring', modifier),
    getProperties(value),
  ])

  addUtilities(utilities, variants('ringColor'))
}
