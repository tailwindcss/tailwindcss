import nameClass from '../util/nameClass'

export default () => ({ addUtilities, theme, variants }) => {
  const generators = [
    ([modifier, value]) => ({
      [nameClass('border', modifier)]: { borderWidth: `${value}` },
    }),
    ([modifier, value]) => ({
      [nameClass('border-t', modifier)]: { borderTopWidth: `${value}` },
      [nameClass('border-r', modifier)]: { borderRightWidth: `${value}` },
      [nameClass('border-b', modifier)]: { borderBottomWidth: `${value}` },
      [nameClass('border-l', modifier)]: { borderLeftWidth: `${value}` },
    }),
  ]

  const utilities = generators.flatMap((generator) =>
    Object.entries(theme('borderWidth')).flatMap(generator)
  )

  addUtilities(utilities, variants('borderWidth'))
}
