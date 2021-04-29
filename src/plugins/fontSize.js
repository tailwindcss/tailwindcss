import mapObject from '../util/mapObject'
import nameClass from '../util/nameClass'

export default () => ({ addUtilities, theme, variants }) => {
  const utilities = mapObject(theme('fontSize'), ([modifier, value]) => {
    const [fontSize, options] = Array.isArray(value) ? value : [value]
    const { lineHeight, letterSpacing } =
      options instanceof Object ? options : { lineHeight: options }

    return [
      nameClass('text', modifier),
      {
        'font-size': fontSize,
        ...(lineHeight !== undefined && {
          'line-height': lineHeight,
        }),
        ...(letterSpacing !== undefined && {
          'letter-spacing': letterSpacing,
        }),
      },
    ]
  })

  addUtilities(utilities, variants('fontSize'))
}
