import nameClass from '../util/nameClass'
import mapObject from '../util/mapObject'

export default () => ({ addUtilities, theme, variants }) => {
  const utilities = mapObject(theme('flex'), ([modifier, value]) => [
    nameClass('flex', modifier),
    {
      flex: value,
    },
  ])

  addUtilities(utilities, variants('flex'))
}
