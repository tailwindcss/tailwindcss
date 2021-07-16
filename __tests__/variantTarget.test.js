import postcss from 'postcss'
import variantsAtRulesPlugin from '../src/lib/substituteVariantsAtRules'
import responsiveAtRulesPlugin from '../src/lib/substituteResponsiveAtRules'
import unwrapVariantTargets from '../src/lib/unwrapVariantTargets'
import processPlugins from '../src/util/processPlugins'
import resolveConfig from '../src/util/resolveConfig'
import config from '../stubs/defaultConfig.stub.js'

function run(input, opts = config) {
  const resolved = resolveConfig([opts])
  return postcss([
    variantsAtRulesPlugin(resolved, processPlugins(resolved.plugins, resolved)),
    responsiveAtRulesPlugin(resolved),
    unwrapVariantTargets(),
  ]).process(input, {
    from: undefined,
  })
}

test('it targets the last class when selectors are wrapped in dark variants and the `darkMode` is set to media', () => {
  const input = `
    @variants dark {
      .banana .peel { color: yellow; }
    }
  `

  const output = `
    .banana .peel { color: yellow; }
    @media (prefers-color-scheme: dark) {
      .banana .dark\\:peel { color: yellow; }
    }
  `

  return run(input, { darkMode: 'media' }).then((result) => {
    expect(result.css).toMatchCss(output)
    expect(result.warnings().length).toBe(0)
  })
})

test('it targets the last class when selectors are wrapped in dark variants and the `darkMode` is set to class', () => {
  const input = `
    @variants dark {
      .banana .peel { color: yellow; }
    }
  `

  const output = `
    .banana .peel { color: yellow; }
    .dark .banana .dark\\:peel { color: yellow; }
  `

  return run(input, { darkMode: 'class' }).then((result) => {
    expect(result.css).toMatchCss(output)
    expect(result.warnings().length).toBe(0)
  })
})

test('it targets the last class when selectors are wrapped in motion-safe variants', () => {
  const input = `
    @variants motion-safe {
      .banana .peel { color: yellow; }
    }
  `

  const output = `
    .banana .peel { color: yellow; }
    @media (prefers-reduced-motion: no-preference) {
      .banana .motion-safe\\:peel { color: yellow; }
    }
  `

  return run(input).then((result) => {
    expect(result.css).toMatchCss(output)
    expect(result.warnings().length).toBe(0)
  })
})

test('it targets the last class when selectors are wrapped in motion-reduce variants', () => {
  const input = `
    @variants motion-reduce {
      .banana .peel { color: yellow; }
    }
  `

  const output = `
    .banana .peel { color: yellow; }
    @media (prefers-reduced-motion: reduce) {
      .banana .motion-reduce\\:peel { color: yellow; }
    }
  `

  return run(input).then((result) => {
    expect(result.css).toMatchCss(output)
    expect(result.warnings().length).toBe(0)
  })
})

test('it targets the last class when selectors are wrapped in hover variants', () => {
  const input = `
    @variants hover {
      .banana .peel { color: yellow; }
    }
  `

  const output = `
    .banana .peel { color: yellow; }
    .banana .hover\\:peel:hover { color: yellow; }
  `

  return run(input).then((result) => {
    expect(result.css).toMatchCss(output)
    expect(result.warnings().length).toBe(0)
  })
})

test('it targets the last class when selectors are wrapped in focus variants', () => {
  const input = `
    @variants focus {
      .banana .peel { color: yellow; }
    }
  `

  const output = `
    .banana .peel { color: yellow; }
    .banana .focus\\:peel:focus { color: yellow; }
  `

  return run(input).then((result) => {
    expect(result.css).toMatchCss(output)
    expect(result.warnings().length).toBe(0)
  })
})

test('it targets the last class when selectors are wrapped in focus-within variants', () => {
  const input = `
    @variants focus-within {
      .banana .peel { color: yellow; }
    }
  `

  const output = `
    .banana .peel { color: yellow; }
    .banana .focus-within\\:peel:focus-within { color: yellow; }
  `

  return run(input).then((result) => {
    expect(result.css).toMatchCss(output)
    expect(result.warnings().length).toBe(0)
  })
})

test('it targets the last class when selectors are wrapped in focus-visible variants', () => {
  const input = `
    @variants focus-visible {
      .banana .peel { color: yellow; }
    }
  `

  const output = `
    .banana .peel { color: yellow; }
    .banana .focus-visible\\:peel:focus-visible { color: yellow; }
  `

  return run(input).then((result) => {
    expect(result.css).toMatchCss(output)
    expect(result.warnings().length).toBe(0)
  })
})

test('it targets the last class when selectors are wrapped in active variants', () => {
  const input = `
    @variants active {
      .banana .peel { color: yellow; }
    }
  `

  const output = `
    .banana .peel { color: yellow; }
    .banana .active\\:peel:active { color: yellow; }
  `

  return run(input).then((result) => {
    expect(result.css).toMatchCss(output)
    expect(result.warnings().length).toBe(0)
  })
})

test('it targets the last class when selectors are wrapped in visited variants', () => {
  const input = `
    @variants visited {
      .banana .peel { color: yellow; }
    }
  `

  const output = `
    .banana .peel { color: yellow; }
    .banana .visited\\:peel:visited { color: yellow; }
  `

  return run(input).then((result) => {
    expect(result.css).toMatchCss(output)
    expect(result.warnings().length).toBe(0)
  })
})

test('it targets the last class when selectors are wrapped in disabled variants', () => {
  const input = `
    @variants disabled {
      .banana .peel { color: yellow; }
    }
  `

  const output = `
    .banana .peel { color: yellow; }
    .banana .disabled\\:peel:disabled { color: yellow; }
  `

  return run(input).then((result) => {
    expect(result.css).toMatchCss(output)
    expect(result.warnings().length).toBe(0)
  })
})

test('it targets the last class when selectors are wrapped in checked variants', () => {
  const input = `
    @variants checked {
      .banana .peel { color: yellow; }
    }
  `

  const output = `
    .banana .peel { color: yellow; }
    .banana .checked\\:peel:checked { color: yellow; }
  `

  return run(input).then((result) => {
    expect(result.css).toMatchCss(output)
    expect(result.warnings().length).toBe(0)
  })
})

test('it targets the last class when selectors are wrapped in first variants', () => {
  const input = `
    @variants first {
      .banana .peel { color: yellow; }
    }
  `

  const output = `
    .banana .peel { color: yellow; }
    .banana .first\\:peel:first-child { color: yellow; }
  `

  return run(input).then((result) => {
    expect(result.css).toMatchCss(output)
    expect(result.warnings().length).toBe(0)
  })
})

test('it targets the last class when selectors are wrapped in last variants', () => {
  const input = `
    @variants last {
      .banana .peel { color: yellow; }
    }
  `

  const output = `
    .banana .peel { color: yellow; }
    .banana .last\\:peel:last-child { color: yellow; }
  `

  return run(input).then((result) => {
    expect(result.css).toMatchCss(output)
    expect(result.warnings().length).toBe(0)
  })
})

test('it targets the last class when selectors are wrapped in odd variants', () => {
  const input = `
    @variants odd {
      .banana .peel { color: yellow; }
    }
  `

  const output = `
    .banana .peel { color: yellow; }
    .banana .odd\\:peel:nth-child(odd) { color: yellow; }
  `

  return run(input).then((result) => {
    expect(result.css).toMatchCss(output)
    expect(result.warnings().length).toBe(0)
  })
})

test('it targets the last class when selectors are wrapped in even variants', () => {
  const input = `
    @variants even {
      .banana .peel { color: yellow; }
    }
  `

  const output = `
    .banana .peel { color: yellow; }
    .banana .even\\:peel:nth-child(even) { color: yellow; }
  `

  return run(input).then((result) => {
    expect(result.css).toMatchCss(output)
    expect(result.warnings().length).toBe(0)
  })
})

test('it targets the last class when selectors are wrapped in responsive variants', () => {
  const input = `
    @responsive {
      .banana .peel { color: yellow; }
    }

    @tailwind screens;
  `

  const output = `
    .banana .peel { color: yellow; }
    @media (min-width: 500px) {
      .banana .sm\\:peel { color: yellow; }
    }
    @media (min-width: 750px) {
      .banana .md\\:peel { color: yellow; }
    }
    @media (min-width: 1000px) {
      .banana .lg\\:peel { color: yellow; }
    }
  `

  return run(input, {
    theme: {
      screens: {
        sm: '500px',
        md: '750px',
        lg: '1000px',
      },
    },
    separator: ':',
  }).then((result) => {
    expect(result.css).toMatchCss(output)
    expect(result.warnings().length).toBe(0)
  })
})
test('it uses the given target when selectors are wrapped in dark variants and the `darkMode` is set to media', () => {
  const input = `
    @variants dark {
      [.banana] .peel { color: yellow; }
    }
  `

  const output = `
    .banana .peel { color: yellow; }
    @media (prefers-color-scheme: dark) {
      .dark\\:banana .peel { color: yellow; }
    }
  `

  return run(input, { darkMode: 'media' }).then((result) => {
    expect(result.css).toMatchCss(output)
    expect(result.warnings().length).toBe(0)
  })
})

test('it uses the given target when selectors are wrapped in dark variants and the `darkMode` is set to class', () => {
  const input = `
    @variants dark {
      [.banana] .peel { color: yellow; }
    }
  `

  const output = `
    .banana .peel { color: yellow; }
    .dark .dark\\:banana .peel { color: yellow; }
  `

  return run(input, { darkMode: 'class' }).then((result) => {
    expect(result.css).toMatchCss(output)
    expect(result.warnings().length).toBe(0)
  })
})

test('it uses the given target when selectors are wrapped in motion-safe variants', () => {
  const input = `
    @variants motion-safe {
      [.banana] .peel { color: yellow; }
    }
  `

  const output = `
    .banana .peel { color: yellow; }
    @media (prefers-reduced-motion: no-preference) {
      .motion-safe\\:banana .peel { color: yellow; }
    }
  `

  return run(input).then((result) => {
    expect(result.css).toMatchCss(output)
    expect(result.warnings().length).toBe(0)
  })
})

test('it uses the given target when selectors are wrapped in motion-reduce variants', () => {
  const input = `
    @variants motion-reduce {
      [.banana] .peel { color: yellow; }
    }
  `

  const output = `
    .banana .peel { color: yellow; }
    @media (prefers-reduced-motion: reduce) {
      .motion-reduce\\:banana .peel { color: yellow; }
    }
  `

  return run(input).then((result) => {
    expect(result.css).toMatchCss(output)
    expect(result.warnings().length).toBe(0)
  })
})

test('it uses the given target when selectors are wrapped in hover variants', () => {
  const input = `
    @variants hover {
      [.banana] .peel { color: yellow; }
    }
  `

  const output = `
    .banana .peel { color: yellow; }
    .hover\\:banana:hover .peel { color: yellow; }
  `

  return run(input).then((result) => {
    expect(result.css).toMatchCss(output)
    expect(result.warnings().length).toBe(0)
  })
})

test('it uses the given target when selectors are wrapped in focus variants', () => {
  const input = `
    @variants focus {
      [.banana] .peel { color: yellow; }
    }
  `

  const output = `
    .banana .peel { color: yellow; }
    .focus\\:banana:focus .peel { color: yellow; }
  `

  return run(input).then((result) => {
    expect(result.css).toMatchCss(output)
    expect(result.warnings().length).toBe(0)
  })
})

test('it uses the given target when selectors are wrapped in focus-within variants', () => {
  const input = `
    @variants focus-within {
      [.banana] .peel { color: yellow; }
    }
  `

  const output = `
    .banana .peel { color: yellow; }
    .focus-within\\:banana:focus-within .peel { color: yellow; }
  `

  return run(input).then((result) => {
    expect(result.css).toMatchCss(output)
    expect(result.warnings().length).toBe(0)
  })
})

test('it uses the given target when selectors are wrapped in focus-visible variants', () => {
  const input = `
    @variants focus-visible {
      [.banana] .peel { color: yellow; }
    }
  `

  const output = `
    .banana .peel { color: yellow; }
    .focus-visible\\:banana:focus-visible .peel { color: yellow; }
  `

  return run(input).then((result) => {
    expect(result.css).toMatchCss(output)
    expect(result.warnings().length).toBe(0)
  })
})

test('it uses the given target when selectors are wrapped in active variants', () => {
  const input = `
    @variants active {
      [.banana] .peel { color: yellow; }
    }
  `

  const output = `
    .banana .peel { color: yellow; }
    .active\\:banana:active .peel { color: yellow; }
  `

  return run(input).then((result) => {
    expect(result.css).toMatchCss(output)
    expect(result.warnings().length).toBe(0)
  })
})

test('it uses the given target when selectors are wrapped in visited variants', () => {
  const input = `
    @variants visited {
      [.banana] .peel { color: yellow; }
    }
  `

  const output = `
    .banana .peel { color: yellow; }
    .visited\\:banana:visited .peel { color: yellow; }
  `

  return run(input).then((result) => {
    expect(result.css).toMatchCss(output)
    expect(result.warnings().length).toBe(0)
  })
})

test('it uses the given target when selectors are wrapped in disabled variants', () => {
  const input = `
    @variants disabled {
      [.banana] .peel { color: yellow; }
    }
  `

  const output = `
    .banana .peel { color: yellow; }
    .disabled\\:banana:disabled .peel { color: yellow; }
  `

  return run(input).then((result) => {
    expect(result.css).toMatchCss(output)
    expect(result.warnings().length).toBe(0)
  })
})

test('it uses the given target when selectors are wrapped in checked variants', () => {
  const input = `
    @variants checked {
      [.banana] .peel { color: yellow; }
    }
  `

  const output = `
    .banana .peel { color: yellow; }
    .checked\\:banana:checked .peel { color: yellow; }
  `

  return run(input).then((result) => {
    expect(result.css).toMatchCss(output)
    expect(result.warnings().length).toBe(0)
  })
})

test('it uses the given target when selectors are wrapped in first variants', () => {
  const input = `
    @variants first {
      [.banana] .peel { color: yellow; }
    }
  `

  const output = `
    .banana .peel { color: yellow; }
    .first\\:banana:first-child .peel { color: yellow; }
  `

  return run(input).then((result) => {
    expect(result.css).toMatchCss(output)
    expect(result.warnings().length).toBe(0)
  })
})

test('it uses the given target when selectors are wrapped in last variants', () => {
  const input = `
    @variants last {
      [.banana] .peel { color: yellow; }
    }
  `

  const output = `
    .banana .peel { color: yellow; }
    .last\\:banana:last-child .peel { color: yellow; }
  `

  return run(input).then((result) => {
    expect(result.css).toMatchCss(output)
    expect(result.warnings().length).toBe(0)
  })
})

test('it uses the given target when selectors are wrapped in odd variants', () => {
  const input = `
    @variants odd {
      [.banana] .peel { color: yellow; }
    }
  `

  const output = `
    .banana .peel { color: yellow; }
    .odd\\:banana:nth-child(odd) .peel { color: yellow; }
  `

  return run(input).then((result) => {
    expect(result.css).toMatchCss(output)
    expect(result.warnings().length).toBe(0)
  })
})

test('it uses the given target when selectors are wrapped in even variants', () => {
  const input = `
    @variants even {
      [.banana] .peel { color: yellow; }
    }
  `

  const output = `
    .banana .peel { color: yellow; }
    .even\\:banana:nth-child(even) .peel { color: yellow; }
  `

  return run(input).then((result) => {
    expect(result.css).toMatchCss(output)
    expect(result.warnings().length).toBe(0)
  })
})

test('it uses the given target when selectors are wrapped in responsive variants', () => {
  const input = `
    @variants responsive {
      [.banana] .peel { color: yellow; }
    }

    @tailwind screens;
  `

  const output = `
    .banana .peel { color: yellow; }
    @media (min-width: 500px) {
      .sm\\:banana .peel { color: yellow; }
    }
    @media (min-width: 750px) {
      .md\\:banana .peel { color: yellow; }
    }
    @media (min-width: 1000px) {
      .lg\\:banana .peel { color: yellow; }
    }
  `

  return run(input, {
    theme: {
      screens: {
        sm: '500px',
        md: '750px',
        lg: '1000px',
      },
    },
    separator: ':',
  }).then((result) => {
    expect(result.css).toMatchCss(output)
    expect(result.warnings().length).toBe(0)
  })
})

test('it uses the correct target even when multiple variants get stacked', () => {
  const input = `
    @variants motion-reduce, hover, group-hover {
      [.banana] .peel { color: yellow; }
    }
  `

  const output = `
    .banana .peel { color: yellow; }
    .hover\\:banana:hover .peel { color: yellow; }
    .group:hover .group-hover\\:banana .peel { color: yellow; }
    @media (prefers-reduced-motion: reduce) {
      .motion-reduce\\:banana .peel { color: yellow; }
      .motion-reduce\\:hover\\:banana:hover .peel { color: yellow; }
      .group:hover .motion-reduce\\:group-hover\\:banana .peel { color: yellow; }
    }
  `

  return run(input).then((result) => {
    expect(result.css).toMatchCss(output)
    expect(result.warnings().length).toBe(0)
  })
})
