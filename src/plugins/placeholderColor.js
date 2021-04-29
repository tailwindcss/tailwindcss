import mapObject from '../util/mapObject'
import flattenColorPalette from '../util/flattenColorPalette'
import nameClass from '../util/nameClass'
import toColorValue from '../util/toColorValue'
import withAlphaVariable from '../util/withAlphaVariable'

export default () => ({ addUtilities, theme, variants, corePlugins }) => {
  const colors = flattenColorPalette(theme('placeholderColor'))

  const getProperties = (value) =>
    corePlugins('placeholderOpacity')
      ? withAlphaVariable({
          color: value,
          property: 'color',
          variable: '--tw-placeholder-opacity',
        })
      : { color: toColorValue(value) }

  const utilities = mapObject(colors, ([modifier, value]) => [
    `${nameClass('placeholder', modifier)}::placeholder`,
    getProperties(value),
  ])

  addUtilities(utilities, variants('placeholderColor'))
}
