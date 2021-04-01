export interface Config {
  /**
   * Enable dark-mode utilities for your project.
   * 
   * [Documentation](https://tailwindcss.com/docs/dark-mode)
   */
  dark?: 'media' | 'class'

  /**
   * Configure what PurgeCSS removes when building for production.
   * 
   * [Documentation](https://tailwindcss.com/docs/optimizing-for-production)
   */
  purge?: Purge | string[]

  /**
   * Customize the theme of your project.
   * 
   * [Documentation](https://tailwindcss.com/docs/theme)
   */
  theme?: ExtendableTheme

  /**
   * Configure which utility variants are enabled.
   * 
   * [Documentation](https://tailwindcss.com/docs/configuring-variants)
   */
  variants?: ExtendableVariants

  /** Import presets created by you or others.
   *
   * [Documentation](https://tailwindcss.com/docs/presets)
   */
  presets?: Config[]

  /** Use to disable core plugins. */
  corePlugins?: Record<CorePluginNames, boolean>
}

interface Theme {
  /** [Documentation](https://tailwindcss.com/docs/container) */
  container?: Container
  /** [Documentation](https://tailwindcss.com/docs/colors) */
  colors?: Colors
  /** [Documentation](https://tailwindcss.com/docs/breakpoints) */
  screens?: Screens
  /** [Documentation](https://tailwindcss.com/docs/customizing-spacing) */
  spacing?: Spacing

  /** [Documentation](https://tailwindcss.com/docs/object-position) */
  objectPosition?: Record<string, string>
  /** [Documentation](https://tailwindcss.com/docs/top-right-bottom-left) */
  inset?: Record<string, string>
  /** [Documentation](https://tailwindcss.com/docs/z-index) */
  zIndex?: Record<string, string>

  /** [Documentation](https://tailwindcss.com/docs/flex) */
  flex?: Record<string, string>
  /** [Documentation](https://tailwindcss.com/docs/flex-grow) */
  flexGrow?: ObjectWithDefault<string>
  /** [Documentation](https://tailwindcss.com/docs/flex-shrink) */
  flexShrink?: ObjectWithDefault<string>
  /** [Documentation](https://tailwindcss.com/docs/order) */
  order?: Record<string, string>

  /** [Documentation](https://tailwindcss.com/docs/grid-template-columns) */
  gridTemplateColumns?: Record<string, string>
  /** [Documentation](https://tailwindcss.com/docs/grid-column) */
  gridColumn?: Record<string, string>
  /** [Documentation](https://tailwindcss.com/docs/grid-column) */
  gridColumnStart?: Record<string, string>
  /** [Documentation](https://tailwindcss.com/docs/grid-column) */
  gridColumnEnd?: Record<string, string>
  /** [Documentation](https://tailwindcss.com/docs/grid-auto-columns) */
  gridAutoColumns?: Record<string, string>

  /** [Documentation](https://tailwindcss.com/docs/grid-template-rows) */
  gridTemplateRows?: Record<string, string>
  /** [Documentation](https://tailwindcss.com/docs/grid-row) */
  gridRow?: Record<string, string>
  /** [Documentation](https://tailwindcss.com/docs/grid-row) */
  gridRowStart?: Record<string, string>
  /** [Documentation](https://tailwindcss.com/docs/grid-row) */
  gridRowEnd?: Record<string, string>
  /** [Documentation](https://tailwindcss.com/docs/grid-auto-rows) */
  gridAutoRows?: Record<string, string>

  /** [Documentation](https://tailwindcss.com/docs/gap) */
  gap?: Record<string, string>
  
  /** [Documentation](https://tailwindcss.com/docs/padding) */
  padding?: Record<string, string>
  /** [Documentation](https://tailwindcss.com/docs/margin) */
  margin?: Record<string, string>
  /** [Documentation](https://tailwindcss.com/docs/space) */
  space?: Record<string, string>

  /** [Documentation](https://tailwindcss.com/docs/width) */
  width?: Record<string, string>
  /** [Documentation](https://tailwindcss.com/docs/min-width) */
  minWidth?: Record<string, string>
  /** [Documentation](https://tailwindcss.com/docs/max-width) */
  maxWidth?: Record<string, string>

  /** [Documentation](https://tailwindcss.com/docs/height) */
  height?: Record<string, string>
  /** [Documentation](https://tailwindcss.com/docs/min-height) */
  minHeight?: Record<string, string>
  /** [Documentation](https://tailwindcss.com/docs/max-height) */
  maxHeight?: Record<string, string>

  /** [Documentation](https://tailwindcss.com/docs/font-family) */
  fontFamily?: Record<string, string | string[]>
  /**
   * [Documentation](https://tailwindcss.com/docs/font-size)
   * 
   * @example
   * xs: '.75rem',
   * sm: ['14px', '20px'],
   * xl: ['32px', {
   *    letterSpacing: '-0.02em',
   *    lineHeight: '40px',
   * }],
   */
  fontSize?: FontSize
  /** [Documentation](https://tailwindcss.com/docs/font-weight) */
  fontWeight?: Record<string, string>
  /** [Documentation](https://tailwindcss.com/docs/letter-spacing) */
  letterSpacing?: Record<string, string>
  /** [Documentation](https://tailwindcss.com/docs/line-height) */
  lineHeight?: Record<string, string>

  /** [Documentation](https://tailwindcss.com/docs/list-style-type) */
  listStyleType?: Record<string, string>
  /** [Documentation](https://tailwindcss.com/docs/placeholder-color) */
  placeholderColor?: Colors
  /** [Documentation](https://tailwindcss.com/docs/placeholder-opacity) */
  placeholderOpacity?: Record<string, string>

  /** [Documentation](https://tailwindcss.com/docs/text-color) */
  textColor?: Colors
  /** [Documentation](https://tailwindcss.com/docs/text-opacity) */
  textOpacity?: Record<string, string>

  /** [Documentation](https://tailwindcss.com/docs/background-color) */
  backgroundColor?: Colors
  /** [Documentation](https://tailwindcss.com/docs/background-opacity) */
  backgroundOpacity?: Record<string, string>
  /** [Documentation](https://tailwindcss.com/docs/background-position) */
  backgroundPosition?: Record<string, string>
  /** [Documentation](https://tailwindcss.com/docs/background-size) */
  backgroundSize?: Record<string, string>
  /** [Documentation](https://tailwindcss.com/docs/background-image) */
  backgroundImage?: Record<string, string>
  /** [Documentation](https://tailwindcss.com/docs/gradient-color-stops) */
  gradientColorStops?: Record<string, string>
  
  /** [Documentation](https://tailwindcss.com/docs/border-radius) */
  borderRadius?: ObjectWithDefault<string>
  /** [Documentation](https://tailwindcss.com/docs/border-width) */
  borderWidth?: ObjectWithDefault<string>
  /** [Documentation](https://tailwindcss.com/docs/border-color) */
  borderColor?: Colors
  /** [Documentation](https://tailwindcss.com/docs/border-opacity) */
  borderOpacity?: Record<string, string>
  
  /** [Documentation](https://tailwindcss.com/docs/divide-width) */
  divideWidth?: ObjectWithDefault<string>
  /** [Documentation](https://tailwindcss.com/docs/divide-color) */
  divideColor?: Colors
  /** [Documentation](https://tailwindcss.com/docs/divide-opacity) */
  divideOpacity?: Record<string, string>
  
  /** [Documentation](https://tailwindcss.com/docs/ring-width) */
  ringWidth?: ObjectWithDefault<string>
  /** [Documentation](https://tailwindcss.com/docs/ring-color) */
  ringColor?: Colors
  /** [Documentation](https://tailwindcss.com/docs/ring-opacity) */
  ringOpacity?: Record<string, string>
  /** [Documentation](https://tailwindcss.com/docs/ring-offset-width) */
  ringOffsetWidth?: Record<string, string>
  /** [Documentation](https://tailwindcss.com/docs/ring-offset-color) */
  ringOffsetColor?: Colors
  
  /** [Documentation](https://tailwindcss.com/docs/box-shadow) */
  boxShadow?: ObjectWithDefault<string>
  /** [Documentation](https://tailwindcss.com/docs/opacity) */
  opacity?: Record<string, string>

  /** [Documentation](https://tailwindcss.com/docs/transition-property) */
  transitionProperty?: Record<string, string>
  /** [Documentation](https://tailwindcss.com/docs/transition-duration) */
  transitionDuration?: Record<string, string>
  /** [Documentation](https://tailwindcss.com/docs/transition-timing-function) */
  transitionTimingFunction?: Record<string, string>
  /** [Documentation](https://tailwindcss.com/docs/transition-delay) */
  transitionDelay?: Record<string, string>
  /** [Documentation](https://tailwindcss.com/docs/animation) */
  animation?: Record<string, string>
  /** [Documentation](https://tailwindcss.com/docs/animation) */
  keyframes?: Keyframes
  
  /** [Documentation](https://tailwindcss.com/docs/transform-origin) */
  transformOrigin?: Record<string, string>
  /** [Documentation](https://tailwindcss.com/docs/scale) */
  scale?: Record<string, string>
  /** [Documentation](https://tailwindcss.com/docs/rotate) */
  rotate?: Record<string, string>
  /** [Documentation](https://tailwindcss.com/docs/translate) */
  translate?: Record<string, string>
  /** [Documentation](https://tailwindcss.com/docs/skew) */
  skew?: Record<string, string>

  /** [Documentation](https://tailwindcss.com/docs/cursor) */
  cursor?: ObjectWithDefault<string>
  /** [Documentation](https://tailwindcss.com/docs/outline) */
  outline?: Record<string, string | string[]>

  /** [Documentation](https://tailwindcss.com/docs/fill) */
  fill?: Colors
  /** [Documentation](https://tailwindcss.com/docs/stroke) */
  stroke?: Colors
  /** [Documentation](https://tailwindcss.com/docs/stroke-width) */
  strokeWidth?: Record<string, string>
}
interface ExtendableTheme extends Theme {
  extend?: Theme
}

// PURGE
type LayerNames = 'components' | 'utilites' | 'base'
interface Purge {
  enabled?: boolean
  preserveHtmlElements?: boolean
  layers?: LayerNames[]
  /** **Usage of this mode is not recommended unless absolutely necessary.** */
  mode?: 'all'
  content?: string[]
  /** PurgeCSS user configuration. Read more in [their documentation](https://purgecss.com/configuration.html#configuration-file). */
  options?: Record<string, any>
}

// VARIANTS
interface Variants extends Partial<Record<CorePluginNames, CoreVariantNames[]>> {
  [key: string]: CoreVariantNames[]
}
interface ExtendableVariants extends Variants {
  extend: Variants
}

type ObjectWithDefault<T = string, Q = string> =
  | Record<'DEFAULT', T>
  | Record<string, T>
  | Record<Q, T>

// CONTAINER
interface Container {
  padding: string | ObjectWithDefault
  center: boolean
}

// COLORS
type Hex = `#${string}`
type Color = ObjectWithDefault<Hex>
type Colors =
  | Record<string, Hex>
  | Record<DefaultColorNames, Color>
  | Record<string, Color>

// SCREENS
type DefaultBreakpoints = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'print'
type CustomScreenOptions = 'max' | 'min' | 'raw'
type Screens =
  | Record<DefaultBreakpoints, string>
  | Record<DefaultBreakpoints, Record<CustomScreenOptions, string>>

// SPACING
type Spacing = Record<string, string>

// FONTS
interface FontSize {
  [key: string]: string | string[] | [string, {
    letterSpacing?: string
    lineHeight?: string
  }]
}

// KEYFRAMES
interface Keyframes {
  [key: string]: Record<string, Records<string, string>>
}

type DefaultColorNames =
  | 'gray'
  | 'red'
  | 'yellow'
  | 'blue'
  | 'indigo'
  | 'violet'
  | 'pink'
  | 'green'
  | 'black'
  | 'white'
  | 'transparent'
  | 'current'

type CorePluginNames =
  | 'preflight'
  | 'container'
  | 'accessibility'
  | 'alignContent'
  | 'alignItems'
  | 'alignSelf'
  | 'animation'
  | 'appearance'
  | 'backgroundAttachment'
  | 'backgroundClip'
  | 'backgroundColor'
  | 'backgroundImage'
  | 'backgroundOpacity'
  | 'backgroundPosition'
  | 'backgroundRepeat'
  | 'backgroundSize'
  | 'borderCollapse'
  | 'borderColor'
  | 'borderOpacity'
  | 'borderRadius'
  | 'borderStyle'
  | 'borderWidth'
  | 'boxShadow'
  | 'boxSizing'
  | 'clear'
  | 'cursor'
  | 'display'
  | 'divideColor'
  | 'divideOpacity'
  | 'divideStyle'
  | 'divideWidth'
  | 'fill'
  | 'flex'
  | 'flexDirection'
  | 'flexGrow'
  | 'flexShrink'
  | 'flexWrap'
  | 'float'
  | 'fontFamily'
  | 'fontSize'
  | 'fontSmoothing'
  | 'fontStyle'
  | 'fontVariantNumeric'
  | 'fontWeight'
  | 'gap'
  | 'gradientColorStops'
  | 'gridAutoColumns'
  | 'gridAutoFlow'
  | 'gridAutoRows'
  | 'gridColumn'
  | 'gridColumnEnd'
  | 'gridColumnStart'
  | 'gridRow'
  | 'gridRowEnd'
  | 'gridRowStart'
  | 'gridTemplateColumns'
  | 'gridTemplateRows'
  | 'height'
  | 'inset'
  | 'justifyContent'
  | 'justifyItems'
  | 'justifySelf'
  | 'letterSpacing'
  | 'lineHeight'
  | 'listStylePosition'
  | 'listStyleType'
  | 'margin'
  | 'maxHeight'
  | 'maxWidth'
  | 'minHeight'
  | 'minWidth'
  | 'objectFit'
  | 'objectPosition'
  | 'opacity'
  | 'order'
  | 'outline'
  | 'overflow'
  | 'overscrollBehavior'
  | 'padding'
  | 'placeContent'
  | 'placeholderColor'
  | 'placeholderOpacity'
  | 'placeItems'
  | 'placeSelf'
  | 'pointerEvents'
  | 'position'
  | 'resize'
  | 'ringColor'
  | 'ringOffsetColor'
  | 'ringOffsetWidth'
  | 'ringOpacity'
  | 'ringWidth'
  | 'rotate'
  | 'scale'
  | 'skew'
  | 'space'
  | 'stroke'
  | 'strokeWidth'
  | 'tableLayout'
  | 'textAlign'
  | 'textColor'
  | 'textDecoration'
  | 'textOpacity'
  | 'textOverflow'
  | 'textTransform'
  | 'transform'
  | 'transformOrigin'
  | 'transitionDelay'
  | 'transitionDuration'
  | 'transitionProperty'
  | 'transitionTimingFunction'
  | 'translate'
  | 'userSelect'
  | 'verticalAlign'
  | 'visibility'
  | 'whitespace'
  | 'width'
  | 'wordBreak'
  | 'zIndex'

type CoreVariantNames =
  | 'responsive'
  | 'dark'
  | 'motion-safe'
  | 'motion-reduce'
  | 'first'
  | 'last'
  | 'odd'
  | 'even'
  | 'visited'
  | 'checked'
  | 'group-hover'
  | 'group-focus'
  | 'focus-within'
  | 'hover'
  | 'focus'
  | 'focus-visible'
  | 'active'
  | 'disabled'
