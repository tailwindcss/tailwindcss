// import mapObject from '../util/mapObject'
import nameClass from '../util/nameClass'

export default () => ({ addUtilities, theme, variants }) => {
  const generators = [
    ([modifier, value]) => ({
      [nameClass('rounded', modifier)]: { borderRadius: `${value}` },
    }),
    ([modifier, value]) => ({
      [nameClass('rounded-t', modifier)]: {
        borderTopLeftRadius: `${value}`,
        borderTopRightRadius: `${value}`,
      },
      [nameClass('rounded-r', modifier)]: {
        borderTopRightRadius: `${value}`,
        borderBottomRightRadius: `${value}`,
      },
      [nameClass('rounded-b', modifier)]: {
        borderBottomRightRadius: `${value}`,
        borderBottomLeftRadius: `${value}`,
      },
      [nameClass('rounded-l', modifier)]: {
        borderTopLeftRadius: `${value}`,
        borderBottomLeftRadius: `${value}`,
      },
    }),
    ([modifier, value]) => ({
      [nameClass('rounded-tl', modifier)]: { borderTopLeftRadius: `${value}` },
      [nameClass('rounded-tr', modifier)]: { borderTopRightRadius: `${value}` },
      [nameClass('rounded-br', modifier)]: { borderBottomRightRadius: `${value}` },
      [nameClass('rounded-bl', modifier)]: { borderBottomLeftRadius: `${value}` },
    }),
  ]

  const utilities = generators.flatMap((generator) =>
    Object.entries(theme('borderRadius')).flatMap(generator)
  )

  addUtilities(utilities, variants('borderRadius'))
}
