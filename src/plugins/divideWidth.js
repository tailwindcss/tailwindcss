import nameClass from '../util/nameClass'

export default () => ({ addUtilities, theme, variants }) => {
  const generators = [
    ([modifier, _size]) => {
      const size = _size === '0' ? '0px' : _size
      return {
        [`${nameClass('divide-y', modifier)} > :not([hidden]) ~ :not([hidden])`]: {
          '--tw-divide-y-reverse': '0',
          'border-top-width': `calc(${size} * calc(1 - var(--tw-divide-y-reverse)))`,
          'border-bottom-width': `calc(${size} * var(--tw-divide-y-reverse))`,
        },
        [`${nameClass('divide-x', modifier)} > :not([hidden]) ~ :not([hidden])`]: {
          '--tw-divide-x-reverse': '0',
          'border-right-width': `calc(${size} * var(--tw-divide-x-reverse))`,
          'border-left-width': `calc(${size} * calc(1 - var(--tw-divide-x-reverse)))`,
        },
      }
    },
  ]

  const divideReverse = {
    '.divide-y-reverse > :not([hidden]) ~ :not([hidden])': {
      '--tw-divide-y-reverse': '1',
    },
    '.divide-x-reverse > :not([hidden]) ~ :not([hidden])': {
      '--tw-divide-x-reverse': '1',
    },
  }

  const utilities = generators.flatMap((generator) =>
    Object.entries(theme('divideWidth')).flatMap(generator)
  )

  addUtilities([...utilities, divideReverse], variants('divideWidth'))
}
