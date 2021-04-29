import flattenColorPalette from '../util/flattenColorPalette'
import _mapObject from '../util/mapObject'
import nameClass from '../util/nameClass'
import toColorValue from '../util/toColorValue'
import withAlphaVariable from '../util/withAlphaVariable'

export default () => ({ addUtilities, theme, variants, corePlugins }) => {
  const { DEFAULT, ...colors } = flattenColorPalette(theme('borderColor'))

  const getProperties = (value) =>
    corePlugins('borderOpacity')
      ? withAlphaVariable({
          color: value,
          property: 'border-color',
          variable: '--tw-border-opacity',
        })
      : { 'border-color': toColorValue(value) }

  const utilities = _mapObject(colors, ([modifier, value]) => [
    nameClass('border', modifier),
    getProperties(value),
  ])

  addUtilities(utilities, variants('borderColor'))
}
