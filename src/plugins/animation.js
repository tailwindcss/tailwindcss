import parseAnimationValue from '../util/parseAnimationValue'

export default function () {
  return function ({ matchUtilities, theme, variants, prefix }) {
    let prefixName = (name) => prefix(`.${name}`).slice(1)
    let keyframes = Object.fromEntries(
      Object.entries(theme('keyframes') || {}).map(([key, value]) => {
        return [
          key,
          [
            {
              [`@keyframes ${prefixName(key)}`]: value,
            },
            { respectVariants: false },
          ],
        ]
      })
    )

    matchUtilities(
      {
        animate: (value, { includeRules }) => {
          let { name: animationName } = parseAnimationValue(value)

          if (keyframes[animationName] !== undefined) {
            includeRules(keyframes[animationName], { respectImportant: false })
          }

          if (animationName === undefined || keyframes[animationName] === undefined) {
            return { animation: value }
          }

          return {
            animation: value.replace(animationName, prefixName(animationName)),
          }
        },
      },
      { values: theme('animation'), variants: variants('animation') }
    )
  }
}
