import mapObject from '../util/mapObject'
import nameClass from '../util/nameClass'

export default () => ({ addUtilities, theme, variants }) => {
  const utilities = mapObject(theme('divideOpacity'), ([modifier, value]) => [
    `${nameClass('divide-opacity', modifier)} > :not([hidden]) ~ :not([hidden])`,
    {
      '--tw-divide-opacity': value,
    },
  ])

  addUtilities(utilities, variants('divideOpacity'))
}
