export default function() {
  return function({ addUtilities }) {
    addUtilities({
      '.mask-clip-content': { 'mask-clip': 'content-box' },
      '.mask-clip-padding': { 'mask-clip': 'padding-box' },
      '.mask-clip-border': { 'mask-clip': 'border-box' },
      '.mask-clip-margin': { 'mask-clip': 'margin-box' },
      '.mask-clip-fill': { 'mask-clip': 'fill-box' },
      '.mask-clip-stroke': { 'mask-clip': 'stroke-box' },
      '.mask-clip-view': { 'mask-clip': 'view-box' },
      '.mask-clip-no': { 'mask-clip': 'no-box' },
    })
  }
}
