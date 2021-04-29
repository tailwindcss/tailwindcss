import mapObject from '../util/mapObject'
import flattenColorPalette from '../util/flattenColorPalette'
import nameClass from '../util/nameClass'
import toColorValue from '../util/toColorValue'
import withAlphaVariable from '../util/withAlphaVariable'

export default () => ({ addUtilities, theme, variants, corePlugins }) => {
  const { DEFAULT, ...colors } = flattenColorPalette(theme('divideColor'))

  const getProperties = (value) =>
    corePlugins('divideOpacity')
      ? withAlphaVariable({
          color: value,
          property: 'border-color',
          variable: '--tw-divide-opacity',
        })
      : { 'border-color': toColorValue(value) }

  const utilities = mapObject(colors, ([modifier, value]) => [
    `${nameClass('divide', modifier)} > :not([hidden]) ~ :not([hidden])`,
    getProperties(value),
  ])

  addUtilities(utilities, variants('divideColor'))
}
