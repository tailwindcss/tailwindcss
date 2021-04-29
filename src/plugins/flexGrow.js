import mapObject from '../util/mapObject'
import nameClass from '../util/nameClass'

export default () => ({ addUtilities, theme, variants }) => {
  const flexGrowOptions = mapObject(theme('flexGrow'), ([modifier, value]) => [
    nameClass('flex-grow', modifier),
    {
      'flex-grow': value,
    },
  ])
  addUtilities(flexGrowOptions, variants('flexGrow'))
}
