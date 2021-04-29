import nameClass from '../util/nameClass'
import parseAnimationValue from '../util/parseAnimationValue'
import mapObject from '../util/mapObject'

export default () => ({ addUtilities, theme, variants, prefix }) => {
  const prefixName = (name) => prefix(`.${name}`).slice(1)
  const keyframesConfig = theme('keyframes')
  const keyframesStyles = mapObject(keyframesConfig, ([key, value]) => [
    `@keyframes ${prefixName(key)}`,
    value,
  ])

  addUtilities(keyframesStyles, { respectImportant: false })

  const animationConfig = theme('animation')
  const utilities = mapObject(animationConfig, ([suffix, animation]) => {
    const { name } = parseAnimationValue(animation)
    return [
      nameClass('animate', suffix),
      name === undefined || keyframesConfig[name] === undefined
        ? { animation }
        : { animation: animation.replace(name, prefixName(name)) },
    ]
  })

  addUtilities(utilities, variants('animation'))
}
