export default function transformThemeValue(themeSection) {
  if (['fontSize', 'outline'].includes(themeSection)) {
    return (value) => (Array.isArray(value) ? value[0] : value)
  }

  if (
    [
      'fontFamily',
      'boxShadow',
      'transitionProperty',
      'transitionDuration',
      'transitionDelay',
      'transitionTimingFunction',
      'backgroundImage',
      'backgroundSize',
      'cursor',
      'animation',
    ].includes(themeSection)
  ) {
    return (value) => (Array.isArray(value) ? value.join(', ') : value)
  }

  if (
    [
      'backgroundColor',
      'borderColor',
      'caretColor',
      'colors',
      'divideColor',
      'fill',
      'gradientColorStops',
      'placeholderColor',
      'ringColor',
      'ringOffsetColor',
      'stroke',
      'textColor',
    ].includes(themeSection)
  ) {
    return (value) => (typeof value === 'function' ? value({}) : value)
  }

  return (value) => value
}
