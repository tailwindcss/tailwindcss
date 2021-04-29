import mapObject from '../util/mapObject'
import nameClass from '../util/nameClass'

export default () => ({ addUtilities, theme, variants }) => {
  const utilities = mapObject(theme('backgroundSize'), ([modifier, value]) => [
    nameClass('bg', modifier),
    {
      'background-size': value,
    },
  ])

  addUtilities(utilities, variants('backgroundSize'))
}
