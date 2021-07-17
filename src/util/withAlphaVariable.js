import createColor from 'color'
import _ from 'lodash'

function hasAlpha(color) {
  return (
    (color.startsWith('hsl(') && color.includes('/')) ||
    color.startsWith('rgba(') ||
    color.startsWith('hsla(') ||
    (color.startsWith('#') && color.length === 9) ||
    (color.startsWith('#') && color.length === 5)
  )
}

export function toRgba(color) {
  const [r, g, b, a] = createColor(color).rgb().array()

  return [r, g, b, a === undefined && hasAlpha(color) ? 1 : a]
}

export function toHsla(color) {
  const [h, s, l, a] = createColor(color).hsl().array()

  return [h, `${s}%`, `${l}%`, a === undefined && hasAlpha(color) ? 1 : a]
}

export function withAlphaValue(color, alphaValue, defaultValue) {
  if (_.isFunction(color)) {
    return color({ opacityValue: alphaValue })
  }

  try {
    const isHSL = color.startsWith('hsl')
    const [i, j, k] = isHSL ? toHsla(color) : toRgba(color)
    return `${isHSL ? 'hsla' : 'rgba'}(${i}, ${j}, ${k}, ${alphaValue})`
  } catch {
    return defaultValue
  }
}

export default function withAlphaVariable({ color, property, variable }) {
  if (_.isFunction(color)) {
    return {
      [variable]: '1',
      [property]: color({ opacityVariable: variable, opacityValue: `var(${variable})` }),
    }
  }

  try {
    const isHSL = color.startsWith('hsl')

    const [i, j, k, a] = isHSL ? toHsla(color) : toRgba(color)

    if (a !== undefined) {
      return {
        [property]: color,
      }
    }

    return {
      [variable]: '1',
      [property]: `${isHSL ? 'hsla' : 'rgba'}(${i}, ${j}, ${k}, var(${variable}))`,
    }
  } catch (error) {
    return {
      [property]: color,
    }
  }
}
