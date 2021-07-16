export default function () {
  return function ({ addUtilities, variants }) {
    addUtilities(
      {
        '.border-solid': {
          'border-style': 'solid',
        },
        '.border-dashed': {
          'border-style': 'dashed',
        },
        '.border-dotted': {
          'border-style': 'dotted',
        },
        '.border-double': {
          'border-style': 'double',
        },
        '.border-none': {
          'border-style': 'none',
        },
        '.border-hidden': {
          'border-style': 'hidden',
        },
      },
      variants('borderStyle')
    )
  }
}
