import mapObject from '../util/mapObject'
import flattenColorPalette from '../util/flattenColorPalette'
import withAlphaVariable from '../util/withAlphaVariable'
import toColorValue from '../util/toColorValue'
import nameClass from '../util/nameClass'

export default () => ({ addUtilities, theme, variants, corePlugins }) => {
  const colors = flattenColorPalette(theme('backgroundColor'))

  const getProperties = (value) =>
    corePlugins('backgroundOpacity')
      ? withAlphaVariable({
          color: value,
          property: 'background-color',
          variable: '--tw-bg-opacity',
        })
      : { 'background-color': toColorValue(value) }

  const utilities = mapObject(colors, ([modifier, value]) => [
    nameClass('bg', modifier),
    getProperties(value),
  ])

  addUtilities(utilities, variants('backgroundColor'))
}
