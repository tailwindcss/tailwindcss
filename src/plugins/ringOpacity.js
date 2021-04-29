import mapObject from '../util/mapObject'
import nameClass from '../util/nameClass'

export default () => ({ addUtilities, theme, variants }) => {
  const { DEFAULT, ...ringOpacityConfigs } = theme('ringOpacity')
  const utilities = mapObject(ringOpacityConfigs, ([modifier, value]) => [
    nameClass('ring-opacity', modifier),
    {
      '--tw-ring-opacity': value,
    },
  ])
  addUtilities(utilities, variants('ringOpacity'))
}
