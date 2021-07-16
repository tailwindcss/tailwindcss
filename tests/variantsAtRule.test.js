import postcss from 'postcss'
import plugin from '../src/lib/substituteVariantsAtRules'
import processPlugins from '../src/util/processPlugins'
import resolveConfig from '../src/util/resolveConfig'
import config from '../stubs/defaultConfig.stub.js'

function run(input, opts = config) {
  const resolved = resolveConfig([opts])
  return postcss([plugin(resolved, processPlugins(resolved.plugins, resolved))]).process(input, {
    from: undefined,
  })
}

test('it can generate hover variants', () => {
  const input = `
    @variants hover {
      .banana { color: yellow; }
      .chocolate { color: brown; }
    }
  `

  const output = `
    .banana { color: yellow; }
    .chocolate { color: brown; }
    .hover\\:banana:hover { color: yellow; }
    .hover\\:chocolate:hover { color: brown; }
  `

  return run(input).then((result) => {
    expect(result.css).toMatchCss(output)
    expect(result.warnings().length).toBe(0)
  })
})

test('it can generate disabled variants', () => {
  const input = `
    @variants disabled {
      .banana { color: yellow; }
      .chocolate { color: brown; }
    }
  `

  const output = `
    .banana { color: yellow; }
    .chocolate { color: brown; }
    .disabled\\:banana:disabled { color: yellow; }
    .disabled\\:chocolate:disabled { color: brown; }
  `

  return run(input).then((result) => {
    expect(result.css).toMatchCss(output)
    expect(result.warnings().length).toBe(0)
  })
})

test('it can generate checked variants', () => {
  const input = `
    @variants checked {
      .banana { color: yellow; }
      .chocolate { color: brown; }
    }
  `

  const output = `
    .banana { color: yellow; }
    .chocolate { color: brown; }
    .checked\\:banana:checked { color: yellow; }
    .checked\\:chocolate:checked { color: brown; }
  `

  return run(input).then((result) => {
    expect(result.css).toMatchCss(output)
    expect(result.warnings().length).toBe(0)
  })
})

test('it can generate active variants', () => {
  const input = `
    @variants active {
      .banana { color: yellow; }
      .chocolate { color: brown; }
    }
  `

  const output = `
    .banana { color: yellow; }
    .chocolate { color: brown; }
    .active\\:banana:active { color: yellow; }
    .active\\:chocolate:active { color: brown; }
  `

  return run(input).then((result) => {
    expect(result.css).toMatchCss(output)
    expect(result.warnings().length).toBe(0)
  })
})

test('it can generate visited variants', () => {
  const input = `
    @variants visited {
      .banana { color: yellow; }
      .chocolate { color: brown; }
    }
  `

  const output = `
    .banana { color: yellow; }
    .chocolate { color: brown; }
    .visited\\:banana:visited { color: yellow; }
    .visited\\:chocolate:visited { color: brown; }
  `

  return run(input).then((result) => {
    expect(result.css).toMatchCss(output)
    expect(result.warnings().length).toBe(0)
  })
})

test('it can generate focus variants', () => {
  const input = `
    @variants focus {
      .banana { color: yellow; }
      .chocolate { color: brown; }
    }
  `

  const output = `
    .banana { color: yellow; }
    .chocolate { color: brown; }
    .focus\\:banana:focus { color: yellow; }
    .focus\\:chocolate:focus { color: brown; }
  `

  return run(input).then((result) => {
    expect(result.css).toMatchCss(output)
    expect(result.warnings().length).toBe(0)
  })
})

test('it can generate focus-within variants', () => {
  const input = `
    @variants focus-within {
      .banana { color: yellow; }
      .chocolate { color: brown; }
    }
  `

  const output = `
    .banana { color: yellow; }
    .chocolate { color: brown; }
    .focus-within\\:banana:focus-within { color: yellow; }
    .focus-within\\:chocolate:focus-within { color: brown; }
  `

  return run(input).then((result) => {
    expect(result.css).toMatchCss(output)
    expect(result.warnings().length).toBe(0)
  })
})

test('it can generate focus-visible variants', () => {
  const input = `
    @variants focus-visible {
      .banana { color: yellow; }
      .chocolate { color: brown; }
    }
  `

  const output = `
    .banana { color: yellow; }
    .chocolate { color: brown; }
    .focus-visible\\:banana:focus-visible { color: yellow; }
    .focus-visible\\:chocolate:focus-visible { color: brown; }
  `

  return run(input).then((result) => {
    expect(result.css).toMatchCss(output)
    expect(result.warnings().length).toBe(0)
  })
})

test('it can generate motion-reduce variants', () => {
  const input = `
    @variants motion-reduce {
      .banana { color: yellow; }
      .chocolate { color: brown; }
    }
  `

  const output = `
    .banana { color: yellow; }
    .chocolate { color: brown; }
    @media (prefers-reduced-motion: reduce) {
      .motion-reduce\\:banana { color: yellow; }
      .motion-reduce\\:chocolate { color: brown; }
    }
  `

  return run(input).then((result) => {
    expect(result.css).toMatchCss(output)
    expect(result.warnings().length).toBe(0)
  })
})

test('it can generate motion-safe variants', () => {
  const input = `
    @variants motion-safe {
      .banana { color: yellow; }
      .chocolate { color: brown; }
    }
  `

  const output = `
    .banana { color: yellow; }
    .chocolate { color: brown; }
    @media (prefers-reduced-motion: no-preference) {
      .motion-safe\\:banana { color: yellow; }
      .motion-safe\\:chocolate { color: brown; }
    }
  `

  return run(input).then((result) => {
    expect(result.css).toMatchCss(output)
    expect(result.warnings().length).toBe(0)
  })
})

test('it can generate motion-safe and motion-reduce variants', () => {
  const input = `
    @variants motion-safe, motion-reduce {
      .banana { color: yellow; }
      .chocolate { color: brown; }
    }
  `

  const output = `
    .banana { color: yellow; }
    .chocolate { color: brown; }
    @media (prefers-reduced-motion: no-preference) {
      .motion-safe\\:banana { color: yellow; }
      .motion-safe\\:chocolate { color: brown; }
    }
    @media (prefers-reduced-motion: reduce) {
      .motion-reduce\\:banana { color: yellow; }
      .motion-reduce\\:chocolate { color: brown; }
    }
  `

  return run(input).then((result) => {
    expect(result.css).toMatchCss(output)
    expect(result.warnings().length).toBe(0)
  })
})

test('motion-reduce variants stack with basic variants', () => {
  const input = `
    @variants motion-reduce, hover, group-hover {
      .banana { color: yellow; }
      .chocolate { color: brown; }
    }
  `

  const output = `
    .banana { color: yellow; }
    .chocolate { color: brown; }
    .hover\\:banana:hover { color: yellow; }
    .hover\\:chocolate:hover { color: brown; }
    .group:hover .group-hover\\:banana { color: yellow; }
    .group:hover .group-hover\\:chocolate { color: brown; }
    @media (prefers-reduced-motion: reduce) {
      .motion-reduce\\:banana { color: yellow; }
      .motion-reduce\\:chocolate { color: brown; }
      .motion-reduce\\:hover\\:banana:hover { color: yellow; }
      .motion-reduce\\:hover\\:chocolate:hover { color: brown; }
      .group:hover .motion-reduce\\:group-hover\\:banana { color: yellow; }
      .group:hover .motion-reduce\\:group-hover\\:chocolate { color: brown; }
    }
  `

  return run(input).then((result) => {
    expect(result.css).toMatchCss(output)
    expect(result.warnings().length).toBe(0)
  })
})

test('motion-safe variants stack with basic variants', () => {
  const input = `
    @variants motion-safe, hover, group-hover {
      .banana { color: yellow; }
      .chocolate { color: brown; }
    }
  `

  const output = `
    .banana { color: yellow; }
    .chocolate { color: brown; }
    .hover\\:banana:hover { color: yellow; }
    .hover\\:chocolate:hover { color: brown; }
    .group:hover .group-hover\\:banana { color: yellow; }
    .group:hover .group-hover\\:chocolate { color: brown; }
    @media (prefers-reduced-motion: no-preference) {
      .motion-safe\\:banana { color: yellow; }
      .motion-safe\\:chocolate { color: brown; }
      .motion-safe\\:hover\\:banana:hover { color: yellow; }
      .motion-safe\\:hover\\:chocolate:hover { color: brown; }
      .group:hover .motion-safe\\:group-hover\\:banana { color: yellow; }
      .group:hover .motion-safe\\:group-hover\\:chocolate { color: brown; }
    }
  `

  return run(input).then((result) => {
    expect(result.css).toMatchCss(output)
    expect(result.warnings().length).toBe(0)
  })
})

test('motion-safe and motion-reduce variants stack with basic variants', () => {
  const input = `
    @variants motion-reduce, motion-safe, hover {
      .banana { color: yellow; }
      .chocolate { color: brown; }
    }
  `

  const output = `
    .banana { color: yellow; }
    .chocolate { color: brown; }
    .hover\\:banana:hover { color: yellow; }
    .hover\\:chocolate:hover { color: brown; }
    @media (prefers-reduced-motion: reduce) {
      .motion-reduce\\:banana { color: yellow; }
      .motion-reduce\\:chocolate { color: brown; }
      .motion-reduce\\:hover\\:banana:hover { color: yellow; }
      .motion-reduce\\:hover\\:chocolate:hover { color: brown; }
    }
    @media (prefers-reduced-motion: no-preference) {
      .motion-safe\\:banana { color: yellow; }
      .motion-safe\\:chocolate { color: brown; }
      .motion-safe\\:hover\\:banana:hover { color: yellow; }
      .motion-safe\\:hover\\:chocolate:hover { color: brown; }
    }
  `

  return run(input).then((result) => {
    expect(result.css).toMatchCss(output)
    expect(result.warnings().length).toBe(0)
  })
})

test('it can generate first-child variants', () => {
  const input = `
    @variants first {
      .banana { color: yellow; }
      .chocolate { color: brown; }
    }
  `

  const output = `
    .banana { color: yellow; }
    .chocolate { color: brown; }
    .first\\:banana:first-child { color: yellow; }
    .first\\:chocolate:first-child { color: brown; }
  `

  return run(input).then((result) => {
    expect(result.css).toMatchCss(output)
    expect(result.warnings().length).toBe(0)
  })
})

test('it can generate odd variants', () => {
  const input = `
    @variants odd {
      .banana { color: yellow; }
      .chocolate { color: brown; }
    }
  `

  const output = `
    .banana { color: yellow; }
    .chocolate { color: brown; }
    .odd\\:banana:nth-child(odd) { color: yellow; }
    .odd\\:chocolate:nth-child(odd) { color: brown; }
  `

  return run(input).then((result) => {
    expect(result.css).toMatchCss(output)
    expect(result.warnings().length).toBe(0)
  })
})

test('it can generate last-child variants', () => {
  const input = `
    @variants last {
      .banana { color: yellow; }
      .chocolate { color: brown; }
    }
  `

  const output = `
    .banana { color: yellow; }
    .chocolate { color: brown; }
    .last\\:banana:last-child { color: yellow; }
    .last\\:chocolate:last-child { color: brown; }
  `

  return run(input).then((result) => {
    expect(result.css).toMatchCss(output)
    expect(result.warnings().length).toBe(0)
  })
})

test('it can generate even variants', () => {
  const input = `
    @variants even {
      .banana { color: yellow; }
      .chocolate { color: brown; }
    }
  `

  const output = `
    .banana { color: yellow; }
    .chocolate { color: brown; }
    .even\\:banana:nth-child(even) { color: yellow; }
    .even\\:chocolate:nth-child(even) { color: brown; }
  `

  return run(input).then((result) => {
    expect(result.css).toMatchCss(output)
    expect(result.warnings().length).toBe(0)
  })
})

test('it can generate empty variants', () => {
  const input = `
    @variants empty {
      .banana { color: yellow; }
      .chocolate { color: brown; }
    }
  `

  const output = `
    .banana { color: yellow; }
    .chocolate { color: brown; }
    .empty\\:banana:empty { color: yellow; }
    .empty\\:chocolate:empty { color: brown; }
  `

  return run(input).then((result) => {
    expect(result.css).toMatchCss(output)
    expect(result.warnings().length).toBe(0)
  })
})

test('it can generate group-hover variants', () => {
  const input = `
    @variants group-hover {
      .banana { color: yellow; }
      .chocolate { color: brown; }
    }
  `

  const output = `
    .banana { color: yellow; }
    .chocolate { color: brown; }
    .group:hover .group-hover\\:banana { color: yellow; }
    .group:hover .group-hover\\:chocolate { color: brown; }
  `

  return run(input).then((result) => {
    expect(result.css).toMatchCss(output)
    expect(result.warnings().length).toBe(0)
  })
})

test('group-hover variants respect any configured prefix', () => {
  const input = `
    @variants group-hover {
      .tw-banana { color: yellow; }
      .tw-chocolate { color: brown; }
    }
  `

  const output = `
    .tw-banana { color: yellow; }
    .tw-chocolate { color: brown; }
    .tw-group:hover .group-hover\\:tw-banana { color: yellow; }
    .tw-group:hover .group-hover\\:tw-chocolate { color: brown; }
  `

  return run(input, {
    ...config,
    prefix: 'tw-',
  }).then((result) => {
    expect(result.css).toMatchCss(output)
    expect(result.warnings().length).toBe(0)
  })
})

test('it can generate group-focus variants', () => {
  const input = `
    @variants group-focus {
      .banana { color: yellow; }
      .chocolate { color: brown; }
    }
  `

  const output = `
    .banana { color: yellow; }
    .chocolate { color: brown; }
    .group:focus .group-focus\\:banana { color: yellow; }
    .group:focus .group-focus\\:chocolate { color: brown; }
  `

  return run(input).then((result) => {
    expect(result.css).toMatchCss(output)
    expect(result.warnings().length).toBe(0)
  })
})

test('group-focus variants respect any configured prefix', () => {
  const input = `
    @variants group-focus {
      .tw-banana { color: yellow; }
      .tw-chocolate { color: brown; }
    }
  `

  const output = `
    .tw-banana { color: yellow; }
    .tw-chocolate { color: brown; }
    .tw-group:focus .group-focus\\:tw-banana { color: yellow; }
    .tw-group:focus .group-focus\\:tw-chocolate { color: brown; }
  `

  return run(input, {
    ...config,
    prefix: 'tw-',
  }).then((result) => {
    expect(result.css).toMatchCss(output)
    expect(result.warnings().length).toBe(0)
  })
})

test('it can generate hover, active and focus variants', () => {
  const input = `
    @variants group-hover, hover, focus, active {
      .banana { color: yellow; }
      .chocolate { color: brown; }
    }
  `

  const output = `
    .banana { color: yellow; }
    .chocolate { color: brown; }
    .group:hover .group-hover\\:banana { color: yellow; }
    .group:hover .group-hover\\:chocolate { color: brown; }
    .hover\\:banana:hover { color: yellow; }
    .hover\\:chocolate:hover { color: brown; }
    .focus\\:banana:focus { color: yellow; }
    .focus\\:chocolate:focus { color: brown; }
    .active\\:banana:active { color: yellow; }
    .active\\:chocolate:active { color: brown; }
  `

  return run(input).then((result) => {
    expect(result.css).toMatchCss(output)
    expect(result.warnings().length).toBe(0)
  })
})

test('it can generate read-only variants', () => {
  const input = `
    @variants read-only {
      .banana { color: yellow; }
      .chocolate { color: brown; }
    }
  `

  const output = `
    .banana { color: yellow; }
    .chocolate { color: brown; }
    .read-only\\:banana:read-only { color: yellow; }
    .read-only\\:chocolate:read-only { color: brown; }
  `

  return run(input).then((result) => {
    expect(result.css).toMatchCss(output)
    expect(result.warnings().length).toBe(0)
  })
})

test('it can generate open variants', () => {
  const input = `
    @variants open {
      .banana { color: yellow; }
      .chocolate { color: brown; }
    }
  `

  const output = `
    .banana { color: yellow; }
    .chocolate { color: brown; }
    .open\\:banana[open] { color: yellow; }
    .open\\:chocolate[open] { color: brown; }
  `

  return run(input).then((result) => {
    expect(result.css).toMatchCss(output)
    expect(result.warnings().length).toBe(0)
  })
})

test('it can generate hover, active and focus variants for multiple classes in one rule', () => {
  const input = `
    @variants hover, focus, active {
      .banana, .lemon { color: yellow; }
      .chocolate, .coconut { color: brown; }
    }
  `

  const output = `
    .banana, .lemon { color: yellow; }
    .chocolate, .coconut { color: brown; }
    .hover\\:banana:hover, .hover\\:lemon:hover { color: yellow; }
    .hover\\:chocolate:hover, .hover\\:coconut:hover { color: brown; }
    .focus\\:banana:focus, .focus\\:lemon:focus { color: yellow; }
    .focus\\:chocolate:focus, .focus\\:coconut:focus { color: brown; }
    .active\\:banana:active, .active\\:lemon:active { color: yellow; }
    .active\\:chocolate:active, .active\\:coconut:active { color: brown; }
  `

  return run(input).then((result) => {
    expect(result.css).toMatchCss(output)
    expect(result.warnings().length).toBe(0)
  })
})

test('it wraps the output in a responsive at-rule if responsive is included as a variant', () => {
  const input = `
    @variants responsive, hover, focus {
      .banana { color: yellow; }
      .chocolate { color: brown; }
    }
  `

  const output = `
    @responsive {
      .banana { color: yellow; }
      .chocolate { color: brown; }
      .hover\\:banana:hover { color: yellow; }
      .hover\\:chocolate:hover { color: brown; }
      .focus\\:banana:focus { color: yellow; }
      .focus\\:chocolate:focus { color: brown; }
    }
  `

  return run(input).then((result) => {
    expect(result.css).toMatchCss(output)
    expect(result.warnings().length).toBe(0)
  })
})

test('variants are generated in the order specified', () => {
  const input = `
    @variants focus, active, hover {
      .banana { color: yellow; }
      .chocolate { color: brown; }
    }
  `

  const output = `
    .banana { color: yellow; }
    .chocolate { color: brown; }
    .focus\\:banana:focus { color: yellow; }
    .focus\\:chocolate:focus { color: brown; }
    .active\\:banana:active { color: yellow; }
    .active\\:chocolate:active { color: brown; }
    .hover\\:banana:hover { color: yellow; }
    .hover\\:chocolate:hover { color: brown; }
  `

  return run(input, {
    ...config,
  }).then((result) => {
    expect(result.css).toMatchCss(output)
    expect(result.warnings().length).toBe(0)
  })
})

test('the built-in variant pseudo-selectors are appended before any pseudo-elements', () => {
  const input = `
    @variants hover, focus-within, focus-visible, focus, active, group-hover, read-only {
      .placeholder-yellow::placeholder { color: yellow; }
    }
  `

  const output = `
    .placeholder-yellow::placeholder { color: yellow; }
    .hover\\:placeholder-yellow:hover::placeholder { color: yellow; }
    .focus-within\\:placeholder-yellow:focus-within::placeholder { color: yellow; }
    .focus-visible\\:placeholder-yellow:focus-visible::placeholder { color: yellow; }
    .focus\\:placeholder-yellow:focus::placeholder { color: yellow; }
    .active\\:placeholder-yellow:active::placeholder { color: yellow; }
    .group:hover .group-hover\\:placeholder-yellow::placeholder { color: yellow; }
    .read-only\\:placeholder-yellow:read-only::placeholder { color: yellow; }
  `

  return run(input).then((result) => {
    expect(result.css).toMatchCss(output)
    expect(result.warnings().length).toBe(0)
  })
})

test('the default variant can be generated in a specified position', () => {
  const input = `
    @variants focus, active, DEFAULT, hover {
      .banana { color: yellow; }
      .chocolate { color: brown; }
    }
  `

  const output = `
    .focus\\:banana:focus { color: yellow; }
    .focus\\:chocolate:focus { color: brown; }
    .active\\:banana:active { color: yellow; }
    .active\\:chocolate:active { color: brown; }
    .banana { color: yellow; }
    .chocolate { color: brown; }
    .hover\\:banana:hover { color: yellow; }
    .hover\\:chocolate:hover { color: brown; }
  `

  return run(input, {
    ...config,
  }).then((result) => {
    expect(result.css).toMatchCss(output)
    expect(result.warnings().length).toBe(0)
  })
})

test('nested rules are not modified', () => {
  const input = `
    @variants focus, active, hover {
      .banana {
        color: yellow;
        .chocolate { color: brown; }
      }
    }
  `

  const output = `
    .banana {
      color: yellow;
      .chocolate { color: brown; }
    }
    .focus\\:banana:focus {
      color: yellow;
      .chocolate { color: brown; }
    }
    .active\\:banana:active {
      color: yellow;
      .chocolate { color: brown; }
    }
    .hover\\:banana:hover {
      color: yellow;
      .chocolate { color: brown; }
    }
  `

  return run(input, {
    ...config,
  }).then((result) => {
    expect(result.css).toMatchCss(output)
    expect(result.warnings().length).toBe(0)
  })
})

test('plugin variants can modify rules using the raw PostCSS API', () => {
  const input = `
    @variants important {
      .banana { color: yellow; }
      .chocolate { color: brown; }
    }
  `

  const output = `
    .banana { color: yellow; }
    .chocolate { color: brown; }
    .\\!banana { color: yellow !important; }
    .\\!chocolate { color: brown !important; }
  `

  return run(input, {
    ...config,
    plugins: [
      ...config.plugins,
      function ({ addVariant }) {
        addVariant('important', ({ container }) => {
          container.walkRules((rule) => {
            rule.selector = `.\\!${rule.selector.slice(1)}`
            rule.walkDecls((decl) => {
              decl.important = true
            })
          })
        })
      },
    ],
  }).then((result) => {
    expect(result.css).toMatchCss(output)
    expect(result.warnings().length).toBe(0)
  })
})

test('plugin variants can modify selectors with a simplified API', () => {
  const input = `
    @variants first-child {
      .banana { color: yellow; }
      .chocolate { color: brown; }
    }
  `

  const output = `
    .banana { color: yellow; }
    .chocolate { color: brown; }
    .first-child\\:banana:first-child { color: yellow; }
    .first-child\\:chocolate:first-child { color: brown; }
  `

  return run(input, {
    ...config,
    plugins: [
      ...config.plugins,
      function ({ addVariant, e }) {
        addVariant('first-child', ({ modifySelectors, separator }) => {
          modifySelectors(({ className }) => {
            return `.${e(`first-child${separator}${className}`)}:first-child`
          })
        })
      },
    ],
  }).then((result) => {
    expect(result.css).toMatchCss(output)
    expect(result.warnings().length).toBe(0)
  })
})

test('plugin variants that use modify selectors need to manually escape the class name they are modifying', () => {
  const input = `
    @variants first-child {
      .banana-1\\/2 { color: yellow; }
      .chocolate-1\\.5 { color: brown; }
    }
  `

  const output = `
    .banana-1\\/2 { color: yellow; }
    .chocolate-1\\.5 { color: brown; }
    .first-child\\:banana-1\\/2:first-child { color: yellow; }
    .first-child\\:chocolate-1\\.5:first-child { color: brown; }
  `

  return run(input, {
    ...config,
    plugins: [
      ...config.plugins,
      function ({ addVariant, e }) {
        addVariant('first-child', ({ modifySelectors, separator }) => {
          modifySelectors(({ className }) => {
            return `.${e(`first-child${separator}${className}`)}:first-child`
          })
        })
      },
    ],
  }).then((result) => {
    expect(result.css).toMatchCss(output)
    expect(result.warnings().length).toBe(0)
  })
})

test('plugin variants can wrap rules in another at-rule using the raw PostCSS API', () => {
  const input = `
    @variants supports-grid {
      .banana { color: yellow; }
      .chocolate { color: brown; }
    }
  `

  const output = `
    .banana { color: yellow; }
    .chocolate { color: brown; }
    @supports (display: grid) {
      .supports-grid\\:banana { color: yellow; }
      .supports-grid\\:chocolate { color: brown; }
    }
  `

  return run(input, {
    ...config,
    plugins: [
      ...config.plugins,
      function ({ addVariant, e }) {
        addVariant('supports-grid', ({ container, separator }) => {
          const supportsRule = postcss.atRule({
            name: 'supports',
            params: '(display: grid)',
          })
          supportsRule.nodes = container.nodes
          container.nodes = [supportsRule]
          supportsRule.walkRules((rule) => {
            rule.selector = `.${e(`supports-grid${separator}${rule.selector.slice(1)}`)}`
          })
        })
      },
    ],
  }).then((result) => {
    expect(result.css).toMatchCss(output)
    expect(result.warnings().length).toBe(0)
  })
})
