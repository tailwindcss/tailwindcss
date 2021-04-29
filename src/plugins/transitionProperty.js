import mapObject from '../util/mapObject'
import nameClass from '../util/nameClass'

export default () => ({ addUtilities, theme, variants }) => {
  const defaultTimingFunction = theme('transitionTimingFunction.DEFAULT')
  const defaultDuration = theme('transitionDuration.DEFAULT')

  const utilities = mapObject(theme('transitionProperty'), ([modifier, value]) => [
    nameClass('transition', modifier),
    {
      'transition-property': value,
      ...(value === 'none'
        ? {}
        : {
            'transition-timing-function': defaultTimingFunction,
            'transition-duration': defaultDuration,
          }),
    },
  ])

  addUtilities(utilities, variants('transitionProperty'))
}
