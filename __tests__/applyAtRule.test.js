import postcss from 'postcss'
import resolveConfig from '../src/util/resolveConfig'
import defaultConfig from '../stubs/defaultConfig.stub.js'
import tailwind from '../src/index'

function run(input, config = {}) {
  return postcss([tailwind(config)]).process(input, { from: undefined })
}

test('it copies class declarations into itself', () => {
  const output = '.a { color: red; } .b { color: red; }'

  expect.assertions(2)

  return run('.a { color: red; } .b { @apply a; }').then((result) => {
    expect(result.css).toMatchCss(output)
    expect(result.warnings().length).toBe(0)
  })
})

test('apply values can contain tabs', () => {
  const input = `
    .a {
      @apply p-4\tm-4;
    }
  `

  const expected = `
    .a {
      margin: 1rem;
      padding: 1rem;
    }
  `

  expect.assertions(2)

  return run(input).then((result) => {
    expect(result.css).toMatchCss(expected)
    expect(result.warnings().length).toBe(0)
  })
})

test('apply values can contain newlines', () => {
  const input = `
    .a {
      @apply p-4 m-4
      flex flex-col;
    }
  `

  const expected = `
    .a {
      display: flex;
      flex-direction: column;
      margin: 1rem;
      padding: 1rem;
    }
  `

  expect.assertions(2)

  return run(input).then((result) => {
    expect(result.css).toMatchCss(expected)
    expect(result.warnings().length).toBe(0)
  })
})

test('selectors with invalid characters do not need to be manually escaped', () => {
  const input = `
    .a\\:1\\/2 { color: red; }
    .b { @apply a:1/2; }
  `

  const expected = `
    .a\\:1\\/2 { color: red; }
    .b { color: red; }
  `

  expect.assertions(2)

  return run(input).then((result) => {
    expect(result.css).toMatchCss(expected)
    expect(result.warnings().length).toBe(0)
  })
})

test('it removes important from applied classes by default', () => {
  const input = `
    .a { color: red !important; }
    .a:hover { color: blue !important; }
    .b { @apply a; }
  `

  const expected = `
    .a { color: red !important; }
    .a:hover { color: blue !important; }
    .b { color: red; }
    .b:hover { color: blue; }
  `

  expect.assertions(2)

  return run(input).then((result) => {
    expect(result.css).toMatchCss(expected)
    expect(result.warnings().length).toBe(0)
  })
})

test('applied rules can be made !important', () => {
  const input = `
    .a { color: red; }
    .b { @apply a !important; }
  `

  const expected = `
    .a { color: red; }
    .b { color: red !important; }
  `

  expect.assertions(2)

  return run(input).then((result) => {
    expect(result.css).toMatchCss(expected)
    expect(result.warnings().length).toBe(0)
  })
})

test('cssnext custom property sets are no longer supported', () => {
  const input = `
    .a {
      color: red;
    }
    .b {
      @apply a --custom-property-set;
    }
  `

  expect.assertions(1)

  return run(input).catch((e) => {
    expect(e).toMatchObject({ name: 'CssSyntaxError' })
  })
})

test('it fails if the class does not exist', () => {
  expect.assertions(1)

  return run('.b { @apply a; }').catch((e) => {
    expect(e).toMatchObject({ name: 'CssSyntaxError' })
  })
})

test('applying classes that are defined in a media query is supported', () => {
  const input = `
    @media (min-width: 300px) {
      .a { color: blue; }
    }

    .b {
      @apply a;
    }
  `

  const output = `
    @media (min-width: 300px) {
      .a { color: blue; }
    }
    @media (min-width: 300px) {
      .b { color: blue; }
    }
  `

  expect.assertions(2)

  return run(input).then((result) => {
    expect(result.css).toMatchCss(output)
    expect(result.warnings().length).toBe(0)
  })
})

test('applying classes that are used in a media query is supported', () => {
  const input = `
    .a {
      color: red;
    }

    @media (min-width: 300px) {
      .a { color: blue; }
    }

    .b {
      @apply a;
    }
  `

  const output = `
    .a {
      color: red;
    }

    @media (min-width: 300px) {
      .a { color: blue; }
    }

    .b {
      color: red;
    }

    @media (min-width: 300px) {
      .b { color: blue; }
    }
  `

  expect.assertions(2)

  return run(input).then((result) => {
    expect(result.css).toMatchCss(output)
    expect(result.warnings().length).toBe(0)
  })
})

test('it matches classes that include pseudo-selectors', () => {
  const input = `
    .a:hover {
      color: red;
    }

    .b {
      @apply a;
    }
  `

  const output = `
    .a:hover {
      color: red;
    }

    .b:hover {
      color: red;
    }
  `

  expect.assertions(2)

  return run(input).then((result) => {
    expect(result.css).toMatchCss(output)
    expect(result.warnings().length).toBe(0)
  })
})

test('it matches classes that have multiple rules', () => {
  const input = `
    .a {
      color: red;
    }

    .b {
      @apply a;
    }

    .a {
      color: blue;
    }
  `

  const output = `
    .a {
      color: red;
    }

    .b {
      color: red;
      color: blue;
    }

    .a {
      color: blue;
    }
  `

  expect.assertions(2)

  return run(input).then((result) => {
    expect(result.css).toMatchCss(output)
    expect(result.warnings().length).toBe(0)
  })
})

test('applying a class that appears multiple times in one selector', () => {
  const input = `
    .a + .a > .a {
      color: red;
    }

    .b {
      @apply a;
    }
  `

  const output = `
    .a + .a > .a {
      color: red;
    }
    .b + .a > .a {
      color: red;
    }
    .a + .b > .a {
      color: red;
    }
    .a + .a > .b {
      color: red;
    }
  `

  expect.assertions(2)

  return run(input).then((result) => {
    expect(result.css).toMatchCss(output)
    expect(result.warnings().length).toBe(0)
  })
})

test('you can apply utility classes that do not actually exist as long as they would exist if utilities were being generated', () => {
  const input = `
    .foo { @apply mt-4; }
  `

  const expected = `
    .foo { margin-top: 1rem; }
  `

  expect.assertions(2)

  return run(input).then((result) => {
    expect(result.css).toMatchCss(expected)
    expect(result.warnings().length).toBe(0)
  })
})

test('shadow lookup will be constructed when we have missing @tailwind atrules', () => {
  const input = `
    @tailwind base;

    .foo { @apply mt-4; }
  `

  expect.assertions(1)

  return run(input).then((result) => {
    expect(result.css).toContain(`.foo { margin-top: 1rem;\n}`)
  })
})

test('you can apply a class that is defined in multiple rules', () => {
  const input = `
    .foo {
      color: red;
    }
    .bar {
      @apply foo;
    }
    .foo {
      opacity: .5;
    }
  `
  const expected = `
    .foo {
      color: red;
    }
    .bar {
      color: red;
      opacity: .5;
    }
    .foo {
      opacity: .5;
    }
  `

  expect.assertions(2)

  return run(input).then((result) => {
    expect(result.css).toMatchCss(expected)
    expect(result.warnings().length).toBe(0)
  })
})

test('you can apply a class that is defined in a media query', () => {
  const input = `
    .foo {
      @apply sm:text-center;
    }
  `
  const expected = `
    @media (min-width: 640px) {
      .foo {
        text-align: center
      }
    }
  `

  expect.assertions(2)

  return run(input).then((result) => {
    expect(result.css).toMatchCss(expected)
    expect(result.warnings().length).toBe(0)
  })
})

test('you can apply pseudo-class variant utilities', () => {
  const input = `
    .foo {
      @apply hover:opacity-50;
    }
  `
  const expected = `
    .foo:hover {
      opacity: 0.5
    }
  `

  expect.assertions(2)

  return run(input).then((result) => {
    expect(result.css).toMatchCss(expected)
    expect(result.warnings().length).toBe(0)
  })
})

test('you can apply responsive pseudo-class variant utilities', () => {
  const input = `
    .foo {
      @apply sm:hover:opacity-50;
    }
  `
  const expected = `
    @media (min-width: 640px) {
      .foo:hover {
        opacity: 0.5
      }
    }
  `

  expect.assertions(2)

  return run(input).then((result) => {
    expect(result.css).toMatchCss(expected)
    expect(result.warnings().length).toBe(0)
  })
})

test('you can apply the container component', () => {
  const input = `
    .foo {
      @apply container;
    }
  `
  const expected = `
    .foo {
      width: 100%;
    }
    @media (min-width: 640px) {
      .foo {
        max-width: 640px;
      }
    }
    @media (min-width: 768px) {
      .foo {
        max-width: 768px;
      }
    }
    @media (min-width: 1024px) {
      .foo {
        max-width: 1024px;
      }
    }
    @media (min-width: 1280px) {
      .foo {
        max-width: 1280px;
      }
    }
    @media (min-width: 1536px) {
      .foo {
        max-width: 1536px;
      }
    }
  `

  expect.assertions(2)

  return run(input).then((result) => {
    expect(result.css).toMatchCss(expected)
    expect(result.warnings().length).toBe(0)
  })
})

test('classes are applied according to CSS source order, not apply order', () => {
  const input = `
    .foo {
      color: red;
    }
    .bar {
      color: blue;
    }
    .baz {
      @apply bar foo;
    }
  `
  const expected = `
    .foo {
      color: red;
    }
    .bar {
      color: blue;
    }
    .baz {
      color: red;
      color: blue;
    }
  `

  expect.assertions(2)

  return run(input).then((result) => {
    expect(result.css).toMatchCss(expected)
    expect(result.warnings().length).toBe(0)
  })
})

test('you can apply utilities with multi-class selectors like group-hover variants', () => {
  const input = `
    .foo {
      @apply group-hover:bar;
    }
    .bar {
      color: blue;
    }
    .group:hover .group-hover\\:bar {
      color: blue;
    }
  `
  const expected = `
    .group:hover .foo {
      color: blue;
    }
    .bar {
      color: blue;
    }
    .group:hover .group-hover\\:bar {
      color: blue;
    }
  `

  expect.assertions(2)

  return run(input).then((result) => {
    expect(result.css).toMatchCss(expected)
    expect(result.warnings().length).toBe(0)
  })
})

test('you can apply classes recursively', () => {
  const input = `
    .baz {
      color: blue;
    }
    .bar {
      @apply baz px-4;
    }
    .foo {
      @apply bar;
    }
  `
  const expected = `
    .baz {
      color: blue;
    }
    .bar {
      padding-left: 1rem;
      padding-right: 1rem;
      color: blue;
    }
    .foo {
      padding-left: 1rem;
      padding-right: 1rem;
      color: blue;
    }
  `

  expect.assertions(2)

  return run(input).then((result) => {
    expect(result.css).toMatchCss(expected)
    expect(result.warnings().length).toBe(0)
  })
})

test('you can apply complex classes recursively', () => {
  const input = `
    .button {
      @apply rounded-xl px-6 py-2 hover:text-white focus:border-opacity-100;
    }

    .button-yellow {
      @apply button bg-yellow-600 text-gray-200;
    }
  `

  const expected = `
    .button:focus {
      --tw-border-opacity: 1;
    }

    .button {
      border-radius: 0.75rem;
      padding-top: 0.5rem;
      padding-bottom: 0.5rem;
      padding-left: 1.5rem;
      padding-right: 1.5rem;
    }

    .button:hover {
      --tw-text-opacity: 1;
      color: rgba(255, 255, 255, var(--tw-text-opacity));
    }

    .button-yellow {
      --tw-bg-opacity: 1;
      background-color: rgba(217, 119, 6, var(--tw-bg-opacity));
      --tw-text-opacity: 1;
      color: rgba(229, 231, 235, var(--tw-text-opacity));
    }

    .button-yellow:focus {
      --tw-border-opacity: 1;
    }

    .button-yellow {
      border-radius: 0.75rem;
      padding-top: 0.5rem;
      padding-bottom: 0.5rem;
      padding-left: 1.5rem;
      padding-right: 1.5rem;
    }

    .button-yellow:hover {
      --tw-text-opacity: 1;
      color: rgba(255, 255, 255, var(--tw-text-opacity));
    }
  `

  expect.assertions(2)

  return run(input).then((result) => {
    expect(result.css).toMatchCss(expected)
    expect(result.warnings().length).toBe(0)
  })
})

test('you can apply classes recursively out of order', () => {
  const input = `
    .foo {
      @apply bar;
    }
    .bar {
      @apply baz;
    }
    .baz {
      color: blue;
    }
  `
  const expected = `
    .foo {
      color: blue;
    }
    .bar {
      color: blue;
    }
    .baz {
      color: blue;
    }
  `

  expect.assertions(2)

  return run(input).then((result) => {
    expect(result.css).toMatchCss(expected)
    expect(result.warnings().length).toBe(0)
  })
})

test('applied classes are always inserted before subsequent declarations in the same rule, even if it means moving those subsequent declarations to a new rule', () => {
  const input = `
    .foo {
      background: blue;
      @apply opacity-50 hover:opacity-100 text-right sm:align-middle;
      color: red;
    }
  `
  const expected = `
    .foo {
      background: blue;
      opacity: 0.5;
    }
    .foo:hover {
      opacity: 1;
    }
    .foo {
      text-align: right;
    }
    @media (min-width: 640px) {
      .foo {
        vertical-align: middle;
      }
    }
    .foo {
      color: red;
    }
  `

  expect.assertions(2)

  return run(input).then((result) => {
    expect(result.css).toMatchCss(expected)
    expect(result.warnings().length).toBe(0)
  })
})

test('adjacent rules are collapsed after being applied', () => {
  const input = `
    .foo {
      @apply hover:bg-white hover:opacity-50 absolute text-right sm:align-middle sm:text-center;
    }
  `
  const expected = `
    .foo:hover {
      --tw-bg-opacity: 1;
      background-color: rgba(255, 255, 255, var(--tw-bg-opacity));
      opacity: 0.5;
    }
    .foo {
      position: absolute;
      text-align: right;
    }
    @media (min-width: 640px) {
      .foo {
        text-align: center;
        vertical-align: middle;
      }
    }
  `

  expect.assertions(2)

  return run(input).then((result) => {
    expect(result.css).toMatchCss(expected)
    expect(result.warnings().length).toBe(0)
  })
})

test('applying a class applies all instances of that class, even complex selectors', () => {
  const input = `
    h1 > p:hover .banana:first-child * {
      @apply bar;
    }
    .bar {
      color: blue;
    }
    @media (print) {
      @supports (display: grid) {
        .baz .bar:hover {
          text-align: right;
          float: left;
        }
      }
    }
    `
  const expected = `
    h1 > p:hover .banana:first-child * {
      color: blue;
    }
    @media (print) {
      @supports (display: grid) {
        .baz h1 > p:hover .banana:first-child *:hover {
          text-align: right;
          float: left;
        }
      }
    }
    .bar {
      color: blue;
    }
    @media (print) {
      @supports (display: grid) {
        .baz .bar:hover {
          text-align: right;
          float: left;
        }
      }
    }
  `

  expect.assertions(2)

  return run(input).then((result) => {
    expect(result.css).toMatchCss(expected)
    expect(result.warnings().length).toBe(0)
  })
})

test('you can apply classes to rules within at-rules', () => {
  const input = `
    @supports (display: grid) {
      .baz .bar {
        @apply text-right float-left hover:opacity-50 md:float-right;
      }
    }
  `
  const expected = `
    @supports (display: grid) {
      .baz .bar {
        float: left;
      }
      .baz .bar:hover {
        opacity: 0.5;
      }
      .baz .bar {
        text-align: right;
      }
      @media (min-width: 768px) {
        .baz .bar {
          float: right;
        }
      }
    }
  `

  expect.assertions(2)

  return run(input).then((result) => {
    expect(result.css).toMatchCss(expected)
    expect(result.warnings().length).toBe(0)
  })
})

describe('using apply with the prefix option', () => {
  test('applying a class including the prefix', () => {
    const input = `
      .foo { @apply tw-mt-4; }
    `

    const expected = `
      .foo { margin-top: 1rem; }
    `

    const config = resolveConfig([
      {
        ...defaultConfig,
        prefix: 'tw-',
      },
    ])

    expect.assertions(2)

    return run(input, config).then((result) => {
      expect(result.css).toMatchCss(expected)
      expect(result.warnings().length).toBe(0)
    })
  })

  test('applying a class including the prefix when using a prefix function', () => {
    const input = `
      .foo { @apply tw-func-mt-4; }
    `

    const expected = `
      .foo { margin-top: 1rem; }
    `

    const config = resolveConfig([
      {
        ...defaultConfig,
        prefix: () => {
          return 'tw-func-'
        },
      },
    ])

    expect.assertions(2)

    return run(input, config).then((result) => {
      expect(result.css).toMatchCss(expected)
      expect(result.warnings().length).toBe(0)
    })
  })

  test('applying a class without the prefix fails', () => {
    const input = `
      .foo { @apply mt-4; }
    `

    const config = resolveConfig([
      {
        ...defaultConfig,
        prefix: 'tw-',
      },
    ])

    expect.assertions(1)

    return run(input, config).catch((e) => {
      expect(e).toMatchObject({ name: 'CssSyntaxError' })
    })
  })

  test('custom classes with no prefix can be applied', () => {
    const input = `
      .foo { @apply mt-4; }
      .mt-4 { color: red; }
    `

    const expected = `
      .foo { color: red; }
      .mt-4 { color: red; }
    `

    const config = resolveConfig([
      {
        ...defaultConfig,
        prefix: 'tw-',
      },
    ])

    expect.assertions(2)

    return run(input, config).then((result) => {
      expect(result.css).toMatchCss(expected)
      expect(result.warnings().length).toBe(0)
    })
  })

  test('built-in prefixed utilities can be extended and applied', () => {
    const input = `
      .foo { @apply tw-mt-4; }
      .tw-mt-4 { color: red; }
    `

    const expected = `
      .foo { margin-top: 1rem; color: red; }
      .tw-mt-4 { color: red; }
    `

    const config = resolveConfig([
      {
        ...defaultConfig,
        prefix: 'tw-',
      },
    ])

    expect.assertions(2)

    return run(input, config).then((result) => {
      expect(result.css).toMatchCss(expected)
      expect(result.warnings().length).toBe(0)
    })
  })

  test('a helpful error message is provided if it appears the user forgot to include their prefix', () => {
    const input = `
        .foo { @apply mt-4; }
      `

    const config = resolveConfig([
      {
        ...defaultConfig,
        prefix: 'tw-',
      },
    ])

    expect.assertions(1)

    return run(input, config).catch((e) => {
      expect(e).toMatchObject({
        name: 'CssSyntaxError',
        reason: 'The `mt-4` class does not exist, but `tw-mt-4` does. Did you forget the prefix?',
      })
    })
  })

  test('a "Did You Mean" suggestion is recommended if a similar class can be identified.', () => {
    const input = `
        .foo { @apply anti-aliased; }
      `

    const config = resolveConfig([
      {
        ...defaultConfig,
      },
    ])

    expect.assertions(1)

    return run(input, config).catch((e) => {
      expect(e).toMatchObject({
        name: 'CssSyntaxError',
        reason:
          "The `anti-aliased` class does not exist, but `antialiased` does. If you're sure that `anti-aliased` exists, make sure that any `@import` statements are being properly processed before Tailwind CSS sees your CSS, as `@apply` can only be used for classes in the same CSS tree.",
      })
    })
  })

  test('a "Did You Mean" suggestion is omitted if a similar class cannot be identified.', () => {
    const input = `
      .foo { @apply anteater; }
    `

    const config = resolveConfig([{ ...defaultConfig }])

    expect.assertions(1)

    return run(input, config).catch((e) => {
      expect(e).toMatchObject({
        name: 'CssSyntaxError',
        reason:
          "The `anteater` class does not exist. If you're sure that `anteater` exists, make sure that any `@import` statements are being properly processed before Tailwind CSS sees your CSS, as `@apply` can only be used for classes in the same CSS tree.",
      })
    })
  })

  test('you can apply classes with important and a prefix enabled', () => {
    const input = `
      .foo { @apply tw-mt-4; }
    `

    const expected = `
      .foo { margin-top: 1rem; }
    `

    const config = resolveConfig([
      {
        ...defaultConfig,
        prefix: 'tw-',
        important: true,
      },
    ])

    expect.assertions(2)

    return run(input, config).then((result) => {
      expect(result.css).toMatchCss(expected)
      expect(result.warnings().length).toBe(0)
    })
  })

  test('you can apply classes with an important selector and a prefix enabled', () => {
    const input = `
      .foo { @apply tw-mt-4; }
    `

    const expected = `
      .foo { margin-top: 1rem; }
    `

    const config = resolveConfig([
      {
        ...defaultConfig,
        prefix: 'tw-',
        important: '#app',
      },
    ])

    expect.assertions(2)

    return run(input, config).then((result) => {
      expect(result.css).toMatchCss(expected)
      expect(result.warnings().length).toBe(0)
    })
  })
})

test('you can apply utility classes when a selector is used for the important option', () => {
  const input = `
    .foo {
      @apply mt-8 mb-8;
    }
  `

  const expected = `
    .foo {
      margin-top: 2rem;
      margin-bottom: 2rem;
    }
  `

  const config = resolveConfig([
    {
      ...defaultConfig,
      important: '#app',
    },
  ])

  expect.assertions(2)

  return run(input, config).then((result) => {
    expect(result.css).toMatchCss(expected)
    expect(result.warnings().length).toBe(0)
  })
})

test('you can apply classes to a rule with multiple selectors', () => {
  const input = `
    @supports (display: grid) {
      .foo, h1 > .bar * {
        @apply float-left opacity-50 hover:opacity-100 md:float-right;
      }
    }
  `

  const expected = `
    @supports (display: grid) {
      .foo, h1 > .bar * {
        float: left;
        opacity: 0.5;
      }
      .foo:hover, h1 > .bar *:hover {
        opacity: 1;
      }
      @media (min-width: 768px) {
        .foo, h1 > .bar * {
          float: right;
        }
      }
    }
  `

  return run(input).then((result) => {
    expect(result.css).toMatchCss(expected)
    expect(result.warnings().length).toBe(0)
  })
})

test('you can apply classes to a rule with multiple selectors with important and a prefix enabled', () => {
  const input = `
    @supports (display: grid) {
      .foo, h1 > .bar * {
        @apply tw-float-left tw-opacity-50 hover:tw-opacity-100 md:tw-float-right;
      }
    }
  `

  const expected = `
    @supports (display: grid) {
      .foo, h1 > .bar * {
        float: left;
        opacity: 0.5;
      }

      .foo:hover, h1 > .bar *:hover {
        opacity: 1;
      }

      @media (min-width: 768px) {
        .foo, h1 > .bar * {
          float: right;
        }
      }
    }
  `

  const config = resolveConfig([
    {
      ...defaultConfig,
      prefix: 'tw-',
      important: true,
    },
  ])

  return run(input, config).then((result) => {
    expect(result.css).toMatchCss(expected)
    expect(result.warnings().length).toBe(0)
  })
})

test('you can apply classes to multiple selectors at the same time, removing important', () => {
  const input = `
    .multiple p,
    .multiple ul,
    .multiple ol {
      @apply mt-5;
    }

    .multiple h2,
    .multiple h3,
    .multiple h4 {
      @apply mt-8;
    }
  `

  const expected = `
    .multiple p,
    .multiple ul,
    .multiple ol {
      margin-top: 1.25rem;
    }

    .multiple h2,
    .multiple h3,
    .multiple h4 {
      margin-top: 2rem;
    }
  `

  const config = resolveConfig([{ ...defaultConfig, important: true }])

  return run(input, config).then((result) => {
    expect(result.css).toMatchCss(expected)
    expect(result.warnings().length).toBe(0)
  })
})

test('you can apply classes in a nested rule', () => {
  const input = `
    .selector {
      &:hover {
        @apply text-white;
      }
    }
    `

  const expected = `
    .selector {
      &:hover {
        --tw-text-opacity: 1;
        color: rgba(255, 255, 255, var(--tw-text-opacity));
      }
    }
  `

  return run(input).then((result) => {
    expect(result.css).toMatchCss(expected)
    expect(result.warnings().length).toBe(0)
  })
})

test('you can apply classes in a nested @atrule', () => {
  const input = `
    .selector {
      @media (min-width: 200px) {
        @apply overflow-hidden;
      }
    }
  `

  const expected = `
    .selector {
      @media (min-width: 200px) {
        overflow: hidden;
      }
    }
  `

  return run(input).then((result) => {
    expect(result.css).toMatchCss(expected)
    expect(result.warnings().length).toBe(0)
  })
})

test('you can apply classes in a custom nested @atrule', () => {
  const input = `
    .selector {
      @screen md {
        @apply w-2/6;
      }
    }
  `

  const expected = `
    .selector {
      @media (min-width: 768px) {
        width: 33.333333%;
      }
    }
  `

  return run(input).then((result) => {
    expect(result.css).toMatchCss(expected)
    expect(result.warnings().length).toBe(0)
  })
})

test('you can deeply apply classes in a custom nested @atrule', () => {
  const input = `
    .selector {
      .subselector {
        @screen md {
          @apply w-2/6;
        }
      }
    }
  `

  const expected = `
    .selector {
      .subselector {
        @media (min-width: 768px) {
          width: 33.333333%
        }
      }
    }
  `

  return run(input).then((result) => {
    expect(result.css).toMatchCss(expected)
    expect(result.warnings().length).toBe(0)
  })
})

test('declarations within a rule that uses @apply can be !important', () => {
  const input = `
    .foo {
      @apply text-center;
      float: left;
      display: block !important;
    }
  `

  const expected = `
    .foo {
      text-align: center;
      float: left;
      display: block !important;
    }
  `

  expect.assertions(2)

  return run(input).then((result) => {
    expect(result.css).toMatchCss(expected)
    expect(result.warnings().length).toBe(0)
  })
})

test('declarations within a rule that uses @apply with !important remain not !important', () => {
  const input = `
    .foo {
      @apply text-center !important;
      float: left;
      display: block !important;
    }
  `

  const expected = `
    .foo {
      text-align: center !important;
      float: left;
      display: block !important;
    }
  `

  expect.assertions(2)

  return run(input).then((result) => {
    expect(result.css).toMatchCss(expected)
    expect(result.warnings().length).toBe(0)
  })
})

test('lookup tree is correctly cached based on used tailwind atrules', async () => {
  const input1 = `
    @tailwind utilities;

    .foo { @apply mt-4; }
  `

  const input2 = `
    @tailwind components;

    .foo { @apply mt-4; }
  `

  let config = {
    corePlugins: [],
    plugins: [
      function ({ addUtilities, addComponents }) {
        addUtilities({ '.mt-4': { marginTop: '1rem' } }, [])
        addComponents({ '.container': { maxWidth: '500px' } }, [])
      },
    ],
  }

  let output1 = await run(input1, config)
  let output2 = await run(input2, config)

  expect(output1.css).toMatchCss(`
    .mt-4 { margin-top: 1rem; }
    .foo { margin-top: 1rem; }
  `)

  expect(output2.css).toMatchCss(`
    .container { max-width: 500px; }
    .foo { margin-top: 1rem; }
  `)
})

test('ensure @apply works with multiple definitions of the same class', async () => {
  const input = `
    .aspect-w-16 {
      position: relative;
      padding-bottom: calc(var(--tw-aspect-h) / var(--tw-aspect-w) * 100%);
    }

    .aspect-w-16 > * {
      position: absolute;
      height: 100%;
      width: 100%;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
    }

    .aspect-w-16 {
      --tw-aspect-w: 16;
    }

    .aspect-h-9 {
      --tw-aspect-h: 9;
    }

    .sixteen-by-nine {
      @apply aspect-w-16 aspect-h-9;
    }
  `

  const expected = `
    .aspect-w-16 {
      position: relative;
      padding-bottom: calc(var(--tw-aspect-h) / var(--tw-aspect-w) * 100%);
    }

    .aspect-w-16 > * {
      position: absolute;
      height: 100%;
      width: 100%;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
    }

    .aspect-w-16 {
      --tw-aspect-w: 16;
    }

    .aspect-h-9 {
      --tw-aspect-h: 9;
    }

    .sixteen-by-nine {
      position: relative;
      padding-bottom: calc(var(--tw-aspect-h) / var(--tw-aspect-w) * 100%);
    }

    .sixteen-by-nine > * {
      position: absolute;
      height: 100%;
      width: 100%;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
    }

    .sixteen-by-nine {
      --tw-aspect-w: 16;
      --tw-aspect-h: 9;
    }
  `

  expect.assertions(2)

  return run(input).then((result) => {
    expect(result.css).toMatchCss(expected)
    expect(result.warnings().length).toBe(0)
  })
})
