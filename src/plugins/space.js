import nameClass from '../util/nameClass'

export default function () {
  return function ({ addUtilities, theme, variants }) {
    const generators = [
      ([modifier, _size]) => {
        const size = _size === '0' ? '0px' : _size
        return {
          [`${nameClass('space-y', modifier)} > :not([hidden]) ~ :not([hidden])`]: {
            '--tw-space-y-reverse': '0',
            'margin-top': `calc(${size} * calc(1 - var(--tw-space-y-reverse)))`,
            'margin-bottom': `calc(${size} * var(--tw-space-y-reverse))`,
          },
          [`${nameClass('space-x', modifier)} > :not([hidden]) ~ :not([hidden])`]: {
            '--tw-space-x-reverse': '0',
            'margin-right': `calc(${size} * var(--tw-space-x-reverse))`,
            'margin-left': `calc(${size} * calc(1 - var(--tw-space-x-reverse)))`,
          },
        }
      },
    ]

    const spaceReverse = {
      '.space-y-reverse > :not([hidden]) ~ :not([hidden])': {
        '--tw-space-y-reverse': '1',
      },
      '.space-x-reverse > :not([hidden]) ~ :not([hidden])': {
        '--tw-space-x-reverse': '1',
      },
    }

    const utilities = generators.flatMap((generator) =>
      Object.entries(theme('space')).flatMap(generator)
    )

    addUtilities([...utilities, spaceReverse], variants('space'))
  }
}
