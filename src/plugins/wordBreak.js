export default function () {
  return function ({ addUtilities, variants }) {
    addUtilities(
      {
        '.break-normal': {
          'overflow-wrap': 'normal',
          'word-break': 'normal',
        },
        '.break-words': {
          'overflow-wrap': 'break-word',
        },
        '.break-keep-all': { 'word-break': 'keep-all'},
        '.break-all': { 'word-break': 'break-all' },
      },
      variants('wordBreak')
    )
  }
}
