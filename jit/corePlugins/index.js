const postcss = require('postcss')
const buildMediaQuery = require('../../lib/util/buildMediaQuery').default
const prefixSelector = require('../../lib/util/prefixSelector').default
const {
  updateLastClasses,
  updateAllClasses,
  transformAllSelectors,
  transformAllClasses,
  transformLastClasses,
} = require('../pluginUtils')

module.exports = {
  pseudoClassVariants: function ({ config, addVariant }) {
    let pseudoVariants = [
      ['first', 'first-child'],
      ['last', 'last-child'],
      ['odd', 'nth-child(odd)'],
      ['even', 'nth-child(even)'],
      'visited',
      'checked',
      'focus-within',
      'hover',
      'focus',
      'focus-visible',
      'active',
      'disabled',
    ]

    for (let variant of pseudoVariants) {
      let [variantName, state] = Array.isArray(variant) ? variant : [variant, variant]

      addVariant(
        variantName,
        transformAllClasses((className, { withPseudo }) => {
          return withPseudo(`${variantName}${config('separator')}${className}`, state)
        })
      )
    }

    for (let variant of pseudoVariants) {
      let [variantName, state] = Array.isArray(variant) ? variant : [variant, variant]
      let groupVariantName = `group-${variantName}`

      addVariant(
        groupVariantName,
        transformAllSelectors((selector) => {
          let variantSelector = updateAllClasses(selector, (className) => {
            return `${groupVariantName}${config('separator')}${className}`
          })

          if (variantSelector === selector) {
            return null
          }

          let groupSelector = prefixSelector(
            config('prefix'),
            `.group${config('separator')}${state}`
          )

          return `${groupSelector} ${variantSelector}`
        })
      )
    }
  },
  directionVariants: function ({ config, addVariant }) {
    addVariant(
      'ltr',
      transformAllSelectors(
        (selector) =>
          `[dir="ltr"] ${updateAllClasses(
            selector,
            (className) => `ltr${config('separator')}${className}`
          )}`
      )
    )

    addVariant(
      'rtl',
      transformAllSelectors(
        (selector) =>
          `[dir="rtl"] ${updateAllClasses(
            selector,
            (className) => `rtl${config('separator')}${className}`
          )}`
      )
    )
  },
  reducedMotionVariants: function ({ config, addVariant }) {
    addVariant(
      'motion-safe',
      transformLastClasses(
        (className) => {
          return `motion-safe${config('separator')}${className}`
        },
        () =>
          postcss.atRule({
            name: 'media',
            params: '(prefers-reduced-motion: no-preference)',
          })
      )
    )

    addVariant(
      'motion-reduce',
      transformLastClasses(
        (className) => {
          return `motion-reduce${config('separator')}${className}`
        },
        () =>
          postcss.atRule({
            name: 'media',
            params: '(prefers-reduced-motion: reduce)',
          })
      )
    )
  },
  darkVariants: function ({ config, addVariant }) {
    if (config('darkMode') === 'class') {
      addVariant(
        'dark',
        transformAllSelectors((selector) => {
          let variantSelector = updateLastClasses(selector, (className) => {
            return `dark${config('separator')}${className}`
          })

          if (variantSelector === selector) {
            return null
          }

          let darkSelector = prefixSelector(config('prefix'), `.dark`)

          return `${darkSelector} ${variantSelector}`
        })
      )
    } else if (config('darkMode') === 'media') {
      addVariant(
        'dark',
        transformLastClasses(
          (className) => {
            return `dark${config('separator')}${className}`
          },
          () =>
            postcss.atRule({
              name: 'media',
              params: '(prefers-color-scheme: dark)',
            })
        )
      )
    }
  },
  screenVariants: function ({ config, theme, addVariant }) {
    for (let screen in theme('screens')) {
      let size = theme('screens')[screen]
      let query = buildMediaQuery(size)

      addVariant(
        screen,
        transformLastClasses(
          (className) => {
            return `${screen}${config('separator')}${className}`
          },
          () => postcss.atRule({ name: 'media', params: query })
        )
      )
    }
  },

  // Base
  preflight: require('../../lib/plugins/preflight').default(),

  // Components
  container: require('../../lib/plugins/container')(),

  // Utilitiles
  accessibility: require('../../lib/plugins/accessibility').default(),
  pointerEvents: require('../../lib/plugins/pointerEvents').default(),
  visibility: require('../../lib/plugins/visibility').default(),
  position: require('../../lib/plugins/position').default(),
  inset: require('../../lib/plugins/inset').default(),
  isolation: require('../../lib/plugins/isolation').default(),
  zIndex: require('../../lib/plugins/zIndex').default(),
  order: require('../../lib/plugins/order').default(),
  gridColumn: require('../../lib/plugins/gridColumn').default(),
  gridColumnStart: require('../../lib/plugins/gridColumnStart').default(),
  gridColumnEnd: require('../../lib/plugins/gridColumnEnd').default(),
  gridRow: require('../../lib/plugins/gridRow').default(),
  gridRowStart: require('../../lib/plugins/gridRowStart').default(),
  gridRowEnd: require('../../lib/plugins/gridRowEnd').default(),
  float: require('../../lib/plugins/float').default(),
  clear: require('../../lib/plugins/clear').default(),
  margin: require('../../lib/plugins/margin').default(),
  boxSizing: require('../../lib/plugins/boxSizing').default(),
  display: require('../../lib/plugins/display').default(),
  height: require('../../lib/plugins/height').default(),
  maxHeight: require('../../lib/plugins/maxHeight').default(),
  minHeight: require('../../lib/plugins/minHeight').default(),
  width: require('../../lib/plugins/width').default(),
  minWidth: require('../../lib/plugins/minWidth').default(),
  maxWidth: require('../../lib/plugins/maxWidth').default(),
  flex: require('../../lib/plugins/flex').default(),
  flexShrink: require('../../lib/plugins/flexShrink').default(),
  flexGrow: require('../../lib/plugins/flexGrow').default(),
  tableLayout: require('../../lib/plugins/tableLayout').default(),
  borderCollapse: require('../../lib/plugins/borderCollapse').default(),

  transform: require('../../lib/plugins/transform').default(),
  transformOrigin: require('../../lib/plugins/transformOrigin').default(),
  translate: require('../../lib/plugins/translate').default(),
  rotate: require('../../lib/plugins/rotate').default(),
  skew: require('../../lib/plugins/skew').default(),
  scale: require('../../lib/plugins/scale').default(),

  animation: require('../../lib/plugins/animation').default(),

  cursor: require('../../lib/plugins/cursor').default(),
  userSelect: require('../../lib/plugins/userSelect').default(),
  resize: require('../../lib/plugins/resize').default(),

  listStylePosition: require('../../lib/plugins/listStylePosition').default(),
  listStyleType: require('../../lib/plugins/listStyleType').default(),

  appearance: require('../../lib/plugins/appearance').default(),
  gridAutoColumns: require('../../lib/plugins/gridAutoColumns').default(),
  gridAutoFlow: require('../../lib/plugins/gridAutoFlow').default(),
  gridAutoRows: require('../../lib/plugins/gridAutoRows').default(),
  gridTemplateColumns: require('../../lib/plugins/gridTemplateColumns').default(),
  gridTemplateRows: require('../../lib/plugins/gridTemplateRows').default(),
  flexDirection: require('../../lib/plugins/flexDirection').default(),
  flexWrap: require('../../lib/plugins/flexWrap').default(),
  placeContent: require('../../lib/plugins/placeContent').default(),
  placeItems: require('../../lib/plugins/placeItems').default(),
  alignContent: require('../../lib/plugins/alignContent').default(),
  alignItems: require('../../lib/plugins/alignItems').default(),
  justifyContent: require('../../lib/plugins/justifyContent').default(),
  justifyItems: require('../../lib/plugins/justifyItems').default(),
  gap: require('../../lib/plugins/gap').default(),
  space: require('../../lib/plugins/space').default(),
  divideWidth: require('../../lib/plugins/divideWidth').default(),
  divideStyle: require('../../lib/plugins/divideStyle').default(),
  divideColor: require('../../lib/plugins/divideColor').default(),
  divideOpacity: require('../../lib/plugins/divideOpacity').default(),

  placeSelf: require('../../lib/plugins/placeSelf').default(),
  alignSelf: require('../../lib/plugins/alignSelf').default(),
  justifySelf: require('../../lib/plugins/justifySelf').default(),

  overflow: require('../../lib/plugins/overflow').default(),
  overscrollBehavior: require('../../lib/plugins/overscrollBehavior').default(),
  textOverflow: require('../../lib/plugins/textOverflow').default(),
  whitespace: require('../../lib/plugins/whitespace').default(),
  wordBreak: require('../../lib/plugins/wordBreak').default(),

  borderRadius: require('../../lib/plugins/borderRadius').default(),
  borderWidth: require('../../lib/plugins/borderWidth').default(),
  borderStyle: require('../../lib/plugins/borderStyle').default(),
  borderColor: require('../../lib/plugins/borderColor').default(),
  borderOpacity: require('../../lib/plugins/borderOpacity').default(),

  backgroundColor: require('../../lib/plugins/backgroundColor').default(),
  backgroundOpacity: require('../../lib/plugins/backgroundOpacity').default(),
  backgroundImage: require('../../lib/plugins/backgroundImage').default(),
  gradientColorStops: require('../../lib/plugins/gradientColorStops').default(),
  boxDecorationBreak: require('../../lib/plugins/boxDecorationBreak').default(),
  backgroundSize: require('../../lib/plugins/backgroundSize').default(),
  backgroundAttachment: require('../../lib/plugins/backgroundAttachment').default(),
  backgroundClip: require('../../lib/plugins/backgroundClip').default(),
  backgroundPosition: require('../../lib/plugins/backgroundPosition').default(),
  backgroundRepeat: require('../../lib/plugins/backgroundRepeat').default(),
  backgroundOrigin: require('../../lib/plugins/backgroundOrigin').default(),

  fill: require('../../lib/plugins/fill').default(),
  stroke: require('../../lib/plugins/stroke').default(),
  strokeWidth: require('../../lib/plugins/strokeWidth').default(),

  objectFit: require('../../lib/plugins/objectFit').default(),
  objectPosition: require('../../lib/plugins/objectPosition').default(),

  padding: require('../../lib/plugins/padding').default(),

  textAlign: require('../../lib/plugins/textAlign').default(),
  verticalAlign: require('../../lib/plugins/verticalAlign').default(),
  fontFamily: require('../../lib/plugins/fontFamily').default(),
  fontSize: require('../../lib/plugins/fontSize').default(),
  fontWeight: require('../../lib/plugins/fontWeight').default(),
  textTransform: require('../../lib/plugins/textTransform').default(),
  fontStyle: require('../../lib/plugins/fontStyle').default(),
  fontVariantNumeric: require('../../lib/plugins/fontVariantNumeric').default(),
  lineHeight: require('../../lib/plugins/lineHeight').default(),
  letterSpacing: require('../../lib/plugins/letterSpacing').default(),
  textColor: require('../../lib/plugins/textColor').default(),
  textOpacity: require('../../lib/plugins/textOpacity').default(),
  textDecoration: require('../../lib/plugins/textDecoration').default(),
  fontSmoothing: require('../../lib/plugins/fontSmoothing').default(),
  placeholderColor: require('../../lib/plugins/placeholderColor').default(),
  placeholderOpacity: require('../../lib/plugins/placeholderOpacity').default(),

  opacity: require('../../lib/plugins/opacity').default(),
  backgroundBlendMode: require('../../lib/plugins/backgroundBlendMode').default(),
  mixBlendMode: require('../../lib/plugins/mixBlendMode').default(),
  boxShadow: require('../../lib/plugins/boxShadow').default(),
  outline: require('../../lib/plugins/outline').default(),
  ringWidth: require('../../lib/plugins/ringWidth').default(),
  ringColor: require('../../lib/plugins/ringColor').default(),
  ringOpacity: require('../../lib/plugins/ringOpacity').default(),
  ringOffsetWidth: require('../../lib/plugins/ringOffsetWidth').default(),
  ringOffsetColor: require('../../lib/plugins/ringOffsetColor').default(),

  filter: require('../../lib/plugins/filter').default(),
  blur: require('../../lib/plugins/blur').default(),
  brightness: require('../../lib/plugins/brightness').default(),
  contrast: require('../../lib/plugins/contrast').default(),
  dropShadow: require('../../lib/plugins/dropShadow').default(),
  grayscale: require('../../lib/plugins/grayscale').default(),
  hueRotate: require('../../lib/plugins/hueRotate').default(),
  invert: require('../../lib/plugins/invert').default(),
  saturate: require('../../lib/plugins/saturate').default(),
  sepia: require('../../lib/plugins/sepia').default(),

  backdropFilter: require('../../lib/plugins/backdropFilter').default(),
  backdropBlur: require('../../lib/plugins/backdropBlur').default(),
  backdropBrightness: require('../../lib/plugins/backdropBrightness').default(),
  backdropContrast: require('../../lib/plugins/backdropContrast').default(),
  backdropGrayscale: require('../../lib/plugins/backdropGrayscale').default(),
  backdropHueRotate: require('../../lib/plugins/backdropHueRotate').default(),
  backdropInvert: require('../../lib/plugins/backdropInvert').default(),
  backdropOpacity: require('../../lib/plugins/backdropOpacity').default(),
  backdropSaturate: require('../../lib/plugins/backdropSaturate').default(),
  backdropSepia: require('../../lib/plugins/backdropSepia').default(),

  transitionProperty: require('../../lib/plugins/transitionProperty').default(),
  transitionDelay: require('../../lib/plugins/transitionDelay').default(),
  transitionDuration: require('../../lib/plugins/transitionDuration').default(),
  transitionTimingFunction: require('../../lib/plugins/transitionTimingFunction').default(),
}
