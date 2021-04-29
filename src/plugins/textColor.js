import mapObject from '../util/mapObject'
import flattenColorPalette from '../util/flattenColorPalette'
import nameClass from '../util/nameClass'
import toColorValue from '../util/toColorValue'
import withAlphaVariable from '../util/withAlphaVariable'

export default () => ({ addUtilities, theme, variants, corePlugins }) => {
  const colors = flattenColorPalette(theme('textColor'))

  const getProperties = (value) =>
    corePlugins('textOpacity')
      ? withAlphaVariable({
          color: value,
          property: 'color',
          variable: '--tw-text-opacity',
        })
      : { color: toColorValue(value) }

  const utilities = mapObject(colors, ([modifier, value]) => [
    nameClass('text', modifier),
    getProperties(value),
  ])

  addUtilities(utilities, variants('textColor'))
}
