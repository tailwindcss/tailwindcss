import mapObject from '../util/mapObject'
import nameClass from '../util/nameClass'

export default () => ({ addUtilities, theme, variants }) => {
  addUtilities(
    {
      '*': {
        '--tw-shadow': '0 0 #0000',
      },
    },
    { respectImportant: false }
  )

  const utilities = mapObject(theme('boxShadow'), ([modifier, value]) => [
    nameClass('shadow', modifier),
    {
      '--tw-shadow': value === 'none' ? '0 0 #0000' : value,
      'box-shadow': [
        `var(--tw-ring-offset-shadow, 0 0 #0000)`,
        `var(--tw-ring-shadow, 0 0 #0000)`,
        `var(--tw-shadow)`,
      ].join(', '),
    },
  ])

  addUtilities(utilities, variants('boxShadow'))
}
