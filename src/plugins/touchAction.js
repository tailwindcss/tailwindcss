export default function () {
  return function ({ addUtilities, variants }) {
    addUtilities(
      {
        '.touch-auto': { 'touch-action': 'auto' },
        '.touch-none': { 'touch-action': 'none' },
        '.touch-pan-x': { 'touch-action': 'pan-x' },
        '.touch-pan-left': { 'touch-action': 'pan-left' },
        '.touch-pan-right': { 'touch-action': 'pan-right' },
        '.touch-pan-y': { 'touch-action': 'pan-y' },
        '.touch-pan-up': { 'touch-action': 'pan-up' },
        '.touch-pan-down': { 'touch-action': 'pan-down' },
        '.touch-pinch-zoom': { 'touch-action': 'pinch-zoom' },
        '.touch-manipulation': { 'touch-action': 'manipulation' },
      },
      variants('touchAction')
    )
  }
}
