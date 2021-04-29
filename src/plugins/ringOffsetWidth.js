import mapObject from '../util/mapObject'
import nameClass from '../util/nameClass'

export default () => ({ addUtilities, theme, variants }) => {
  const { DEFAULT, ...ringOffsetWidthConfig } = theme('ringOffsetWidth')
  const utilities = mapObject(ringOffsetWidthConfig, ([modifier, value]) => [
    nameClass('ring-offset', modifier),
    {
      '--tw-ring-offset-width': value,
    },
  ])
  addUtilities(utilities, variants('ringOffsetWidth'))
}
