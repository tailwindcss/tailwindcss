import mapObject from '../util/mapObject'
import nameClass from '../util/nameClass'

export default () => ({ addUtilities, theme, variants }) => {
  const utilities = mapObject(theme('placeholderOpacity'), ([modifier, value]) => [
    `${nameClass('placeholder-opacity', modifier)}::placeholder`,
    { '--tw-placeholder-opacity': value },
  ])

  addUtilities(utilities, variants('placeholderOpacity'))
}
