import nameClass from '../util/nameClass'

export default () => ({ addUtilities, theme, variants }) => {
  const generators = [
    ([modifier, size]) => ({
      [nameClass('inset', modifier)]: {
        top: `${size}`,
        right: `${size}`,
        bottom: `${size}`,
        left: `${size}`,
      },
    }),
    ([modifier, size]) => ({
      [nameClass('inset-y', modifier)]: {
        top: `${size}`,
        bottom: `${size}`,
      },
      [nameClass('inset-x', modifier)]: {
        right: `${size}`,
        left: `${size}`,
      },
    }),
    ([modifier, size]) => ({
      [nameClass('top', modifier)]: { top: `${size}` },
      [nameClass('right', modifier)]: { right: `${size}` },
      [nameClass('bottom', modifier)]: { bottom: `${size}` },
      [nameClass('left', modifier)]: { left: `${size}` },
    }),
  ]

  const utilities = generators.flatMap((generator) =>
    Object.entries(theme('inset')).flatMap(generator)
  )

  addUtilities(utilities, variants('inset'))
}
