import nameClass from '../util/nameClass'

export default () => ({ addUtilities, theme, variants }) => {
  const generators = [
    ([modifier, size]) => ({
      [nameClass('m', modifier)]: { margin: size },
    }),
    ([modifier, size]) => ({
      [nameClass('my', modifier)]: {
        'margin-top': size,
        'margin-bottom': size,
      },
      [nameClass('mx', modifier)]: {
        'margin-left': size,
        'margin-right': size,
      },
    }),
    ([modifier, size]) => ({
      [nameClass('mt', modifier)]: { 'margin-top': size },
      [nameClass('mr', modifier)]: { 'margin-right': size },
      [nameClass('mb', modifier)]: { 'margin-bottom': size },
      [nameClass('ml', modifier)]: { 'margin-left': size },
    }),
  ]

  const utilities = generators.flatMap((generator) =>
    Object.entries(theme('margin')).flatMap(generator)
  )

  addUtilities(utilities, variants('margin'))
}
