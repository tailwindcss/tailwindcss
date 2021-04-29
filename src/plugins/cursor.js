import mapObject from '../util/mapObject'
import nameClass from '../util/nameClass'

export default () => ({ addUtilities, theme, variants }) => {
  const utilities = mapObject(theme('cursor'), ([modifier, value]) => [
    nameClass('cursor', modifier),
    {
      cursor: value,
    },
  ])

  addUtilities(utilities, variants('cursor'))
}
