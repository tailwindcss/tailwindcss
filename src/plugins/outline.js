import nameClass from '../util/nameClass'
import mapObject from '../util/mapObject'

export default () => ({ addUtilities, theme, variants }) => {
  const utilities = mapObject(theme('outline'), ([modifier, value]) => {
    const [outline, outlineOffset = '0'] = Array.isArray(value) ? value : [value]

    return [
      nameClass('outline', modifier),
      {
        outline,
        outlineOffset,
      },
    ]
  })

  addUtilities(utilities, variants('outline'))
}
