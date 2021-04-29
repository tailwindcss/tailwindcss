import nameClass from '../util/nameClass'

export default () => ({ addUtilities, theme, variants }) => {
  const generators = [
    ([modifier, size]) => ({
      [nameClass('p', modifier)]: { padding: `${size}` },
    }),
    ([modifier, size]) => ({
      [nameClass('py', modifier)]: { 'padding-top': `${size}`, 'padding-bottom': `${size}` },
      [nameClass('px', modifier)]: { 'padding-left': `${size}`, 'padding-right': `${size}` },
    }),
    ([modifier, size]) => ({
      [nameClass('pt', modifier)]: { 'padding-top': `${size}` },
      [nameClass('pr', modifier)]: { 'padding-right': `${size}` },
      [nameClass('pb', modifier)]: { 'padding-bottom': `${size}` },
      [nameClass('pl', modifier)]: { 'padding-left': `${size}` },
    }),
  ]

  const utilities = generators.flatMap((generator) =>
    Object.entries(theme('padding')).flatMap(generator)
  )

  addUtilities(utilities, variants('padding'))
}
