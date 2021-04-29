import mapObject from '../util/mapObject'
import nameClass from '../util/nameClass'

export default () => ({ addUtilities, theme, variants }) => {
  const utilities = mapObject(theme('backgroundPosition'), ([modifier, value]) => [
    nameClass('bg', modifier),
    {
      'background-position': value,
    },
  ])

  addUtilities(utilities, variants('backgroundPosition'))
}
