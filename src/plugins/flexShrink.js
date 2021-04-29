import mapObject from '../util/mapObject'
import nameClass from '../util/nameClass'

export default () => ({ addUtilities, theme, variants }) => {
  const flexShrinkOptions = mapObject(theme('flexShrink'), ([modifier, value]) => [
    nameClass('flex-shrink', modifier),
    {
      'flex-shrink': value,
    },
  ])
  addUtilities(flexShrinkOptions, variants('flexShrink'))
}
