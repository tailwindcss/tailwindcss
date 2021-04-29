import mapObject from '../util/mapObject'
import nameClass from '../util/nameClass'

export default () => ({ addUtilities, theme, variants }) => {
  const utilities = mapObject(theme('backgroundImage'), ([modifier, value]) => [
    nameClass('bg', modifier),
    {
      'background-image': value,
    },
  ])

  addUtilities(utilities, variants('backgroundImage'))
}
