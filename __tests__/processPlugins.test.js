import _ from 'lodash'
import _postcss from 'postcss'
import tailwind from '../src/index'
import processPlugins from '../src/util/processPlugins'
import createPlugin from '../src/util/createPlugin'

function css(nodes) {
  return _postcss.root({ nodes }).toString()
}

function makeConfig(overrides) {
  return _.defaultsDeep(overrides, {
    prefix: '',
    important: false,
    separator: ':',
  })
}

test('plugins can create utilities with object syntax', () => {
  const { components, utilities } = processPlugins(
    [
      function({ addUtilities }) {
        addUtilities({
          '.object-fill': {
            'object-fit': 'fill',
          },
          '.object-contain': {
            'object-fit': 'contain',
          },
          '.object-cover': {
            'object-fit': 'cover',
          },
        })
      },
    ],
    makeConfig()
  )

  expect(components.length).toBe(0)
  expect(css(utilities)).toMatchCss(`
    @layer utilities {
      @variants {
        .object-fill {
          object-fit: fill
        }
        .object-contain {
          object-fit: contain
        }
        .object-cover {
          object-fit: cover
        }
      }
    }
  `)
})

test('plugins can create utilities with arrays of objects', () => {
  const { components, utilities } = processPlugins(
    [
      function({ addUtilities }) {
        addUtilities([
          {
            '.object-fill': {
              'object-fit': 'fill',
            },
          },
          {
            '.object-contain': {
              'object-fit': 'contain',
            },
          },
          {
            '.object-cover': {
              'object-fit': 'cover',
            },
          },
        ])
      },
    ],
    makeConfig()
  )

  expect(components.length).toBe(0)
  expect(css(utilities)).toMatchCss(`
    @layer utilities {
      @variants {
        .object-fill {
          object-fit: fill
        }
        .object-contain {
          object-fit: contain
        }
        .object-cover {
          object-fit: cover
        }
      }
    }
  `)
})

test('plugins can create utilities with raw PostCSS nodes', () => {
  const { components, utilities } = processPlugins(
    [
      function({ addUtilities, postcss }) {
        addUtilities([
          postcss.rule({ selector: '.object-fill' }).append([
            postcss.decl({
              prop: 'object-fit',
              value: 'fill',
            }),
          ]),
          postcss.rule({ selector: '.object-contain' }).append([
            postcss.decl({
              prop: 'object-fit',
              value: 'contain',
            }),
          ]),
          postcss.rule({ selector: '.object-cover' }).append([
            postcss.decl({
              prop: 'object-fit',
              value: 'cover',
            }),
          ]),
        ])
      },
    ],
    makeConfig()
  )

  expect(components.length).toBe(0)
  expect(css(utilities)).toMatchCss(`
    @layer utilities {
      @variants {
        .object-fill {
          object-fit: fill
        }
        .object-contain {
          object-fit: contain
        }
        .object-cover {
          object-fit: cover
        }
      }
    }
  `)
})

test('plugins can create utilities with mixed object styles and PostCSS nodes', () => {
  const { components, utilities } = processPlugins(
    [
      function({ addUtilities, postcss }) {
        addUtilities([
          {
            '.object-fill': {
              objectFit: 'fill',
            },
          },
          postcss.rule({ selector: '.object-contain' }).append([
            postcss.decl({
              prop: 'object-fit',
              value: 'contain',
            }),
          ]),
          postcss.rule({ selector: '.object-cover' }).append([
            postcss.decl({
              prop: 'object-fit',
              value: 'cover',
            }),
          ]),
        ])
      },
    ],
    makeConfig()
  )

  expect(components.length).toBe(0)
  expect(css(utilities)).toMatchCss(`
    @layer utilities {
      @variants {
        .object-fill {
          object-fit: fill
        }
        .object-contain {
          object-fit: contain
        }
        .object-cover {
          object-fit: cover
        }
      }
    }
  `)
})

test('plugins can create utilities with variants', () => {
  const { components, utilities } = processPlugins(
    [
      function({ addUtilities }) {
        addUtilities(
          {
            '.object-fill': {
              'object-fit': 'fill',
            },
            '.object-contain': {
              'object-fit': 'contain',
            },
            '.object-cover': {
              'object-fit': 'cover',
            },
          },
          ['responsive', 'hover', 'group-hover', 'focus']
        )
      },
    ],
    makeConfig()
  )

  expect(components.length).toBe(0)
  expect(css(utilities)).toMatchCss(`
    @layer utilities {
      @variants responsive, hover, group-hover, focus {
        .object-fill {
          object-fit: fill
        }
        .object-contain {
          object-fit: contain
        }
        .object-cover {
          object-fit: cover
        }
      }
    }
  `)
})

test('plugins can create components with object syntax', () => {
  const { components, utilities } = processPlugins(
    [
      function({ addComponents }) {
        addComponents({
          '.btn-blue': {
            backgroundColor: 'blue',
            color: 'white',
            padding: '.5rem 1rem',
            borderRadius: '.25rem',
          },
          '.btn-blue:hover': {
            backgroundColor: 'darkblue',
          },
        })
      },
    ],
    makeConfig()
  )

  expect(utilities.length).toBe(0)
  expect(css(components)).toMatchCss(`
    @layer components {
      @variants {
        .btn-blue {
          background-color: blue;
          color: white;
          padding: .5rem 1rem;
          border-radius: .25rem
        }
        .btn-blue:hover {
          background-color: darkblue
        }
      }
    }
  `)
})

test('plugins can add base styles with object syntax', () => {
  const { base } = processPlugins(
    [
      function({ addBase }) {
        addBase({
          img: {
            maxWidth: '100%',
          },
          button: {
            fontFamily: 'inherit',
          },
        })
      },
    ],
    makeConfig()
  )

  expect(css(base)).toMatchCss(`
    @layer base {
      img {
        max-width: 100%
      }
      button {
        font-family: inherit
      }
    }
  `)
})

test('plugins can add base styles with raw PostCSS nodes', () => {
  const { base } = processPlugins(
    [
      function({ addBase, postcss }) {
        addBase([
          postcss.rule({ selector: 'img' }).append([
            postcss.decl({
              prop: 'max-width',
              value: '100%',
            }),
          ]),
          postcss.rule({ selector: 'button' }).append([
            postcss.decl({
              prop: 'font-family',
              value: 'inherit',
            }),
          ]),
        ])
      },
    ],
    makeConfig()
  )

  expect(css(base)).toMatchCss(`
    @layer base {
      img {
        max-width: 100%
      }
      button {
        font-family: inherit
      }
    }
  `)
})

test('plugins can create components with raw PostCSS nodes', () => {
  const { components, utilities } = processPlugins(
    [
      function({ addComponents, postcss }) {
        addComponents([
          postcss.rule({ selector: '.btn-blue' }).append([
            postcss.decl({
              prop: 'background-color',
              value: 'blue',
            }),
            postcss.decl({
              prop: 'color',
              value: 'white',
            }),
            postcss.decl({
              prop: 'padding',
              value: '.5rem 1rem',
            }),
            postcss.decl({
              prop: 'border-radius',
              value: '.25rem',
            }),
          ]),
          postcss.rule({ selector: '.btn-blue:hover' }).append([
            postcss.decl({
              prop: 'background-color',
              value: 'darkblue',
            }),
          ]),
        ])
      },
    ],
    makeConfig()
  )

  expect(utilities.length).toBe(0)
  expect(css(components)).toMatchCss(`
    @layer components {
      @variants {
        .btn-blue {
          background-color: blue;
          color: white;
          padding: .5rem 1rem;
          border-radius: .25rem
        }
        .btn-blue:hover {
          background-color: darkblue
        }
      }
    }
  `)
})

test('plugins can create components with mixed object styles and raw PostCSS nodes', () => {
  const { components, utilities } = processPlugins(
    [
      function({ addComponents, postcss }) {
        addComponents([
          postcss.rule({ selector: '.btn-blue' }).append([
            postcss.decl({
              prop: 'background-color',
              value: 'blue',
            }),
            postcss.decl({
              prop: 'color',
              value: 'white',
            }),
            postcss.decl({
              prop: 'padding',
              value: '.5rem 1rem',
            }),
            postcss.decl({
              prop: 'border-radius',
              value: '.25rem',
            }),
          ]),
          {
            '.btn-blue:hover': {
              backgroundColor: 'darkblue',
            },
          },
        ])
      },
    ],
    makeConfig()
  )

  expect(utilities.length).toBe(0)
  expect(css(components)).toMatchCss(`
    @layer components {
      @variants {
        .btn-blue {
          background-color: blue;
          color: white;
          padding: .5rem 1rem;
          border-radius: .25rem
        }
        .btn-blue:hover {
          background-color: darkblue
        }
      }
    }
  `)
})

test('plugins can create components with media queries with object syntax', () => {
  const { components, utilities } = processPlugins(
    [
      function({ addComponents }) {
        addComponents({
          '.container': {
            width: '100%',
          },
          '@media (min-width: 100px)': {
            '.container': {
              maxWidth: '100px',
            },
          },
          '@media (min-width: 200px)': {
            '.container': {
              maxWidth: '200px',
            },
          },
          '@media (min-width: 300px)': {
            '.container': {
              maxWidth: '300px',
            },
          },
        })
      },
    ],
    makeConfig()
  )

  expect(utilities.length).toBe(0)
  expect(css(components)).toMatchCss(`
    @layer components {
      @variants {
        .container {
          width: 100%
        }
        @media (min-width: 100px) {
          .container {
            max-width: 100px
          }
        }
        @media (min-width: 200px) {
          .container {
            max-width: 200px
          }
        }
        @media (min-width: 300px) {
          .container {
            max-width: 300px
          }
        }
      }
    }
  `)
})

test('media queries can be defined multiple times using objects-in-array syntax', () => {
  const { components, utilities } = processPlugins(
    [
      function({ addComponents }) {
        addComponents([
          {
            '.container': {
              width: '100%',
            },
            '@media (min-width: 100px)': {
              '.container': {
                maxWidth: '100px',
              },
            },
          },
          {
            '.btn': {
              padding: '1rem .5rem',
              display: 'block',
            },
            '@media (min-width: 100px)': {
              '.btn': {
                display: 'inline-block',
              },
            },
          },
        ])
      },
    ],
    makeConfig()
  )

  expect(utilities.length).toBe(0)
  expect(css(components)).toMatchCss(`
    @layer components {
      @variants {
        .container {
          width: 100%
        }
        @media (min-width: 100px) {
          .container {
            max-width: 100px
          }
        }
        .btn {
          padding: 1rem .5rem;
          display: block
        }
        @media (min-width: 100px) {
          .btn {
            display: inline-block
          }
        }
      }
    }
  `)
})

test('plugins can create nested rules', () => {
  const { components, utilities } = processPlugins(
    [
      function({ addComponents }) {
        addComponents({
          '.btn-blue': {
            backgroundColor: 'blue',
            color: 'white',
            padding: '.5rem 1rem',
            borderRadius: '.25rem',
            '&:hover': {
              backgroundColor: 'darkblue',
            },
            '@media (min-width: 500px)': {
              '&:hover': {
                backgroundColor: 'orange',
              },
            },
            '> a': {
              color: 'red',
            },
            'h1 &': {
              color: 'purple',
            },
          },
        })
      },
    ],
    makeConfig()
  )

  expect(utilities.length).toBe(0)
  expect(css(components)).toMatchCss(`
    @layer components {
      @variants {
        .btn-blue {
          background-color: blue;
          color: white;
          padding: .5rem 1rem;
          border-radius: .25rem;
        }
        .btn-blue:hover {
          background-color: darkblue;
        }
        @media (min-width: 500px) {
          .btn-blue:hover {
            background-color: orange;
          }
        }
        .btn-blue > a {
          color: red;
        }
        h1 .btn-blue {
          color: purple;
        }
      }
    }
  `)
})

test('plugins can create rules with escaped selectors', () => {
  const { components, utilities } = processPlugins(
    [
      function({ e, addUtilities }) {
        addUtilities({
          [`.${e('top-1/4')}`]: {
            top: '25%',
          },
        })
      },
    ],
    makeConfig()
  )

  expect(components.length).toBe(0)
  expect(css(utilities)).toMatchCss(`
    @layer utilities {
      @variants {
        .top-1\\/4 {
          top: 25%
        }
      }
    }
  `)
})

test('plugins can access the current config', () => {
  const { components, utilities } = processPlugins(
    [
      function({ addComponents, config }) {
        const containerClasses = [
          {
            '.container': {
              width: '100%',
            },
          },
        ]

        _.forEach(config('screens'), breakpoint => {
          containerClasses.push({
            [`@media (min-width: ${breakpoint})`]: {
              '.container': { maxWidth: breakpoint },
            },
          })
        })
        addComponents(containerClasses)
      },
    ],
    makeConfig({
      screens: {
        sm: '576px',
        md: '768px',
        lg: '992px',
        xl: '1200px',
      },
    })
  )

  expect(utilities.length).toBe(0)
  expect(css(components)).toMatchCss(`
    @layer components {
      @variants {
        .container {
          width: 100%
        }
        @media (min-width: 576px) {
          .container {
            max-width: 576px
          }
        }
        @media (min-width: 768px) {
          .container {
            max-width: 768px
          }
        }
        @media (min-width: 992px) {
          .container {
            max-width: 992px
          }
        }
        @media (min-width: 1200px) {
          .container {
            max-width: 1200px
          }
        }
      }
    }
  `)
})

test('plugins can access the variants config directly', () => {
  const { components, utilities } = processPlugins(
    [
      function({ addUtilities, variants }) {
        addUtilities(
          {
            '.object-fill': {
              'object-fit': 'fill',
            },
            '.object-contain': {
              'object-fit': 'contain',
            },
            '.object-cover': {
              'object-fit': 'cover',
            },
          },
          variants('objectFit')
        )
      },
    ],
    makeConfig({
      variants: {
        objectFit: ['responsive', 'focus', 'hover'],
      },
    })
  )

  expect(components.length).toBe(0)
  expect(css(utilities)).toMatchCss(`
    @layer utilities {
      @variants responsive, focus, hover {
        .object-fill {
          object-fit: fill
        }
        .object-contain {
          object-fit: contain
        }
        .object-cover {
          object-fit: cover
        }
      }
    }
  `)
})

test('plugins apply all global variants when variants are configured globally', () => {
  const { components, utilities } = processPlugins(
    [
      function({ addUtilities, variants }) {
        addUtilities(
          {
            '.object-fill': {
              'object-fit': 'fill',
            },
          },
          variants('objectFit')
        )
        addUtilities(
          {
            '.rotate-90deg': {
              transform: 'rotate(90deg)',
            },
          },
          variants('rotate')
        )
      },
    ],
    makeConfig({
      variants: ['responsive', 'focus', 'hover'],
    })
  )

  expect(components.length).toBe(0)
  expect(css(utilities)).toMatchCss(`
    @layer utilities {
      @variants responsive, focus, hover {
        .object-fill {
          object-fit: fill
        }
      }
    }
    @layer utilities {
      @variants responsive, focus, hover {
        .rotate-90deg {
          transform: rotate(90deg)
        }
      }
    }
  `)
})

test('plugins can check if corePlugins are enabled', () => {
  const { components, utilities } = processPlugins(
    [
      function({ addUtilities, corePlugins }) {
        addUtilities({
          '.test': {
            'text-color': corePlugins('textColor') ? 'true' : 'false',
            opacity: corePlugins('opacity') ? 'true' : 'false',
          },
        })
      },
    ],
    makeConfig({
      corePlugins: { textColor: false },
    })
  )

  expect(components.length).toBe(0)
  expect(css(utilities)).toMatchCss(`
    @layer utilities {
      @variants {
        .test {
          text-color: false;
          opacity: true
        }
      }
    }
  `)
})

test('plugins can check if corePlugins are enabled when using array white-listing', () => {
  const { components, utilities } = processPlugins(
    [
      function({ addUtilities, corePlugins }) {
        addUtilities({
          '.test': {
            'text-color': corePlugins('textColor') ? 'true' : 'false',
            opacity: corePlugins('opacity') ? 'true' : 'false',
          },
        })
      },
    ],
    makeConfig({
      corePlugins: ['textColor'],
    })
  )

  expect(components.length).toBe(0)
  expect(css(utilities)).toMatchCss(`
    @layer utilities {
      @variants {
        .test {
          text-color: true;
          opacity: false
        }
      }
    }
  `)
})

test('plugins can provide fallbacks to keys missing from the config', () => {
  const { components, utilities } = processPlugins(
    [
      function({ addComponents, config }) {
        addComponents({
          '.btn': {
            borderRadius: config('borderRadius.default', '.25rem'),
          },
        })
      },
    ],
    makeConfig({
      borderRadius: {
        '1': '1px',
        '2': '2px',
        '4': '4px',
        '8': '8px',
      },
    })
  )

  expect(utilities.length).toBe(0)
  expect(css(components)).toMatchCss(`
    @layer components {
      @variants {
        .btn {
          border-radius: .25rem
        }
      }
    }
  `)
})

test('variants are optional when adding utilities', () => {
  const { utilities } = processPlugins(
    [
      function({ addUtilities }) {
        addUtilities({
          '.border-collapse': {
            'border-collapse': 'collapse',
          },
        })
      },
    ],
    makeConfig()
  )

  expect(css(utilities)).toMatchCss(`
    @layer utilities {
      @variants {
        .border-collapse {
          border-collapse: collapse
        }
      }
    }
  `)
})

test('plugins can add multiple sets of utilities and components', () => {
  const { components, utilities } = processPlugins(
    [
      function({ addUtilities, addComponents }) {
        addComponents({
          '.card': {
            padding: '1rem',
            borderRadius: '.25rem',
          },
        })

        addUtilities({
          '.skew-12deg': {
            transform: 'skewY(-12deg)',
          },
        })

        addComponents({
          '.btn': {
            padding: '1rem .5rem',
            display: 'inline-block',
          },
        })

        addUtilities({
          '.border-collapse': {
            borderCollapse: 'collapse',
          },
        })
      },
    ],
    makeConfig()
  )

  expect(css(utilities)).toMatchCss(`
    @layer utilities {
      @variants {
        .skew-12deg {
          transform: skewY(-12deg)
        }
      }
    }
    @layer utilities {
      @variants {
        .border-collapse {
          border-collapse: collapse
        }
      }
    }
  `)
  expect(css(components)).toMatchCss(`
    @layer components {
      @variants {
        .card {
          padding: 1rem;
          border-radius: .25rem
        }
      }
    }
    @layer components {
      @variants {
        .btn {
          padding: 1rem .5rem;
          display: inline-block
        }
      }
    }
  `)
})

test('plugins respect prefix and important options by default when adding utilities', () => {
  return _postcss([
    tailwind({
      prefix: 'tw-',
      important: true,
      corePlugins: [],
      plugins: [
        function({ addUtilities }) {
          addUtilities({
            '.rotate-90': {
              transform: 'rotate(90deg)',
            },
          })
        },
      ],
    }),
  ])
    .process(
      `
        @tailwind utilities;
      `,
      { from: undefined }
    )
    .then(result => {
      const expected = `
        .tw-rotate-90 {
          transform: rotate(90deg) !important
        }
      `

      expect(result.css).toMatchCss(expected)
    })
})

test('when important is a selector it is used to scope utilities instead of adding !important', () => {
  return _postcss([
    tailwind({
      prefix: 'tw-',
      important: '#app',
      corePlugins: [],
      plugins: [
        function({ addUtilities }) {
          addUtilities({
            '.rotate-90': {
              transform: 'rotate(90deg)',
            },
          })
        },
      ],
    }),
  ])
    .process(
      `
        @tailwind utilities;
      `,
      { from: undefined }
    )
    .then(result => {
      const expected = `
        #app .tw-rotate-90 {
          transform: rotate(90deg)
        }
      `

      expect(result.css).toMatchCss(expected)
    })
})

test('when important is a selector it scopes all selectors in a rule, even though defining utilities like this is stupid', () => {
  return _postcss([
    tailwind({
      important: '#app',
      corePlugins: [],
      plugins: [
        function({ addUtilities }) {
          addUtilities({
            '.rotate-90, .rotate-1\\/4': {
              transform: 'rotate(90deg)',
            },
          })
        },
      ],
    }),
  ])
    .process(
      `
        @tailwind utilities;
      `,
      { from: undefined }
    )
    .then(result => {
      const expected = `
        #app .rotate-90, #app .rotate-1\\/4 {
          transform: rotate(90deg)
        }
      `

      expect(result.css).toMatchCss(expected)
    })
})

test('important utilities are not made double important when important option is used', () => {
  return _postcss([
    tailwind({
      important: true,
      corePlugins: [],
      plugins: [
        function({ addUtilities }) {
          addUtilities({
            '.rotate-90': {
              transform: 'rotate(90deg) !important',
            },
          })
        },
      ],
    }),
  ])
    .process(
      `
        @tailwind utilities;
      `,
      { from: undefined }
    )
    .then(result => {
      const expected = `
        .rotate-90 {
          transform: rotate(90deg) !important
        }
      `

      expect(result.css).toMatchCss(expected)
    })
})

test("component declarations respect the 'prefix' option by default", () => {
  const { components } = processPlugins(
    [
      function({ addComponents }) {
        addComponents({
          '.btn-blue': {
            backgroundColor: 'blue',
          },
        })
      },
    ],
    makeConfig({
      prefix: 'tw-',
    })
  )

  expect(css(components)).toMatchCss(`
    @layer components {
      @variants {
        .tw-btn-blue {
          background-color: blue
        }
      }
    }
  `)
})

test('all selectors in a rule are prefixed', () => {
  const { utilities, components } = processPlugins(
    [
      function({ addUtilities, addComponents }) {
        addUtilities({
          '.rotate-90, .rotate-1\\/4': {
            transform: 'rotate(90deg)',
          },
        })
        addComponents({
          '.btn-blue, .btn-red': {
            padding: '10px',
          },
        })
      },
    ],
    makeConfig({
      prefix: 'tw-',
    })
  )

  expect(css(utilities)).toMatchCss(`
    @layer utilities {
      @variants {
        .tw-rotate-90, .tw-rotate-1\\/4 {
          transform: rotate(90deg)
        }
      }
    }
  `)

  expect(css(components)).toMatchCss(`
    @layer components {
      @variants {
        .tw-btn-blue, .tw-btn-red {
          padding: 10px
        }
      }
    }
  `)
})

test("component declarations can optionally ignore 'prefix' option", () => {
  const { components } = processPlugins(
    [
      function({ addComponents }) {
        addComponents(
          {
            '.btn-blue': {
              backgroundColor: 'blue',
            },
          },
          { respectPrefix: false }
        )
      },
    ],
    makeConfig({
      prefix: 'tw-',
    })
  )

  expect(css(components)).toMatchCss(`
    @layer components {
      @variants {
        .btn-blue {
          background-color: blue
        }
      }
    }
  `)
})

test('plugins can create components with variants', () => {
  const { components } = processPlugins(
    [
      function({ addComponents }) {
        addComponents(
          {
            '.btn-blue': {
              backgroundColor: 'blue',
            },
          },
          { variants: ['responsive'] }
        )
      },
    ],
    makeConfig()
  )

  expect(css(components)).toMatchCss(`
    @layer components {
      @variants responsive {
        .btn-blue {
          background-color: blue
        }
      }
    }
  `)
})

test('plugins can use the array shorthand to add variants to components', () => {
  const { components } = processPlugins(
    [
      function({ addComponents }) {
        addComponents(
          {
            '.btn-blue': {
              backgroundColor: 'blue',
            },
          },
          ['responsive', 'hover']
        )
      },
    ],
    makeConfig()
  )

  expect(css(components)).toMatchCss(`
    @layer components {
      @variants responsive, hover {
        .btn-blue {
          background-color: blue
        }
      }
    }
  `)
})

test('components that add variants manually do not add an extra variants wrapper', () => {
  const { components } = processPlugins(
    [
      function({ addComponents }) {
        addComponents({
          '@variants responsive': {
            '.btn-blue': {
              backgroundColor: 'blue',
            },
          },
        })
      },
    ],
    makeConfig()
  )

  expect(css(components)).toMatchCss(`
    @layer components {
      @variants responsive {
        .btn-blue {
          background-color: blue
        }
      }
    }
  `)
})

test("component declarations are not affected by the 'important' option", () => {
  const { components } = processPlugins(
    [
      function({ addComponents }) {
        addComponents({
          '.btn-blue': {
            backgroundColor: 'blue',
          },
        })
      },
    ],
    makeConfig({
      important: true,
    })
  )

  expect(css(components)).toMatchCss(`
    @layer components {
      @variants {
        .btn-blue {
          background-color: blue
        }
      }
    }
  `)
})

test("plugins can apply the user's chosen prefix to components manually", () => {
  const { components } = processPlugins(
    [
      function({ addComponents, prefix }) {
        addComponents(
          {
            [prefix('.btn-blue')]: {
              backgroundColor: 'blue',
            },
          },
          { respectPrefix: false }
        )
      },
    ],
    makeConfig({
      prefix: 'tw-',
    })
  )

  expect(css(components)).toMatchCss(`
    @layer components {
      @variants {
        .tw-btn-blue {
          background-color: blue
        }
      }
    }
  `)
})

test('prefix can optionally be ignored for utilities', () => {
  return _postcss([
    tailwind({
      prefix: 'tw-',
      corePlugins: [],
      plugins: [
        function({ addUtilities }) {
          addUtilities(
            {
              '.rotate-90': {
                transform: 'rotate(90deg)',
              },
            },
            {
              respectPrefix: false,
            }
          )
        },
      ],
    }),
  ])
    .process(
      `
        @tailwind utilities;
      `,
      { from: undefined }
    )
    .then(result => {
      const expected = `
        .rotate-90 {
          transform: rotate(90deg)
        }
      `

      expect(result.css).toMatchCss(expected)
    })
})

test('important can optionally be ignored for utilities', () => {
  return _postcss([
    tailwind({
      important: true,
      corePlugins: [],
      plugins: [
        function({ addUtilities }) {
          addUtilities(
            {
              '.rotate-90': {
                transform: 'rotate(90deg)',
              },
            },
            {
              respectImportant: false,
            }
          )
        },
      ],
    }),
  ])
    .process(
      `
        @tailwind utilities;
      `,
      { from: undefined }
    )
    .then(result => {
      const expected = `
        .rotate-90 {
          transform: rotate(90deg)
        }
      `

      expect(result.css).toMatchCss(expected)
    })
})

test('variants can still be specified when ignoring prefix and important options', () => {
  const { utilities } = processPlugins(
    [
      function({ addUtilities }) {
        addUtilities(
          {
            '.rotate-90': {
              transform: 'rotate(90deg)',
            },
          },
          {
            variants: ['responsive', 'hover', 'focus'],
            respectImportant: false,
            respectPrefix: false,
          }
        )
      },
    ],
    makeConfig({
      prefix: 'tw-',
      important: true,
    })
  )

  expect(css(utilities)).toMatchCss(`
    @layer utilities {
      @variants responsive, hover, focus {
        .rotate-90 {
          transform: rotate(90deg)
        }
      }
    }
  `)
})

test('prefix will prefix all classes in a selector', () => {
  const { components } = processPlugins(
    [
      function({ addComponents, prefix }) {
        addComponents(
          {
            [prefix('.btn-blue .w-1\\/4 > h1.text-xl + a .bar')]: {
              backgroundColor: 'blue',
            },
          },
          { respectPrefix: false }
        )
      },
    ],
    makeConfig({
      prefix: 'tw-',
    })
  )

  expect(css(components)).toMatchCss(`
    @layer components {
      @variants {
        .tw-btn-blue .tw-w-1\\/4 > h1.tw-text-xl + a .tw-bar {
          background-color: blue
        }
      }
    }
  `)
})

test('plugins can be provided as an object with a handler function', () => {
  const { components, utilities } = processPlugins(
    [
      {
        handler({ addUtilities }) {
          addUtilities({
            '.object-fill': {
              'object-fit': 'fill',
            },
            '.object-contain': {
              'object-fit': 'contain',
            },
            '.object-cover': {
              'object-fit': 'cover',
            },
          })
        },
      },
    ],
    makeConfig()
  )

  expect(components.length).toBe(0)
  expect(css(utilities)).toMatchCss(`
    @layer utilities {
      @variants {
        .object-fill {
          object-fit: fill
        }
        .object-contain {
          object-fit: contain
        }
        .object-cover {
          object-fit: cover
        }
      }
    }
  `)
})

test('plugins can provide a config but no handler', () => {
  const { components, utilities } = processPlugins(
    [
      {
        config: {
          prefix: 'tw-',
        },
      },
      {
        handler({ addUtilities }) {
          addUtilities({
            '.object-fill': {
              'object-fit': 'fill',
            },
            '.object-contain': {
              'object-fit': 'contain',
            },
            '.object-cover': {
              'object-fit': 'cover',
            },
          })
        },
      },
    ],
    makeConfig()
  )

  expect(components.length).toBe(0)
  expect(css(utilities)).toMatchCss(`
    @layer utilities {
      @variants {
        .object-fill {
          object-fit: fill
        }
        .object-contain {
          object-fit: contain
        }
        .object-cover {
          object-fit: cover
        }
      }
    }
  `)
})

test('plugins can be created using the `createPlugin` function', () => {
  const plugin = createPlugin(
    function({ addUtilities, theme, variants }) {
      const utilities = _.fromPairs(
        _.toPairs(theme('testPlugin')).map(([k, v]) => [`.test-${k}`, { testProperty: v }])
      )

      addUtilities(utilities, variants('testPlugin'))
    },
    {
      theme: {
        testPlugin: {
          sm: '1rem',
          md: '2rem',
          lg: '3rem',
        },
      },
      variants: {
        testPlugin: ['responsive', 'hover'],
      },
    }
  )

  return _postcss([
    tailwind({
      corePlugins: [],
      theme: {
        screens: {
          sm: '400px',
        },
      },
      plugins: [plugin],
    }),
  ])
    .process(
      `
        @tailwind base;
        @tailwind components;
        @tailwind utilities;
      `,
      { from: undefined }
    )
    .then(result => {
      const expected = `
        .test-sm {
          test-property: 1rem
        }
        .test-md {
          test-property: 2rem
        }
        .test-lg {
          test-property: 3rem
        }
        .hover\\:test-sm:hover {
          test-property: 1rem
        }
        .hover\\:test-md:hover {
          test-property: 2rem
        }
        .hover\\:test-lg:hover {
          test-property: 3rem
        }

        @media (min-width: 400px) {
          .sm\\:test-sm {
            test-property: 1rem
          }
          .sm\\:test-md {
            test-property: 2rem
          }
          .sm\\:test-lg {
            test-property: 3rem
          }
          .sm\\:hover\\:test-sm:hover {
            test-property: 1rem
          }
          .sm\\:hover\\:test-md:hover {
            test-property: 2rem
          }
          .sm\\:hover\\:test-lg:hover {
            test-property: 3rem
          }
        }
      `

      expect(result.css).toMatchCss(expected)
    })
})

test('plugins with extra options can be created using the `createPlugin.withOptions` function', () => {
  const plugin = createPlugin.withOptions(
    function({ className }) {
      return function({ addUtilities, theme, variants }) {
        const utilities = _.fromPairs(
          _.toPairs(theme('testPlugin')).map(([k, v]) => [
            `.${className}-${k}`,
            { testProperty: v },
          ])
        )

        addUtilities(utilities, variants('testPlugin'))
      }
    },
    function() {
      return {
        theme: {
          testPlugin: {
            sm: '1rem',
            md: '2rem',
            lg: '3rem',
          },
        },
        variants: {
          testPlugin: ['responsive', 'hover'],
        },
      }
    }
  )

  return _postcss([
    tailwind({
      corePlugins: [],
      theme: {
        screens: {
          sm: '400px',
        },
      },
      plugins: [plugin({ className: 'banana' })],
    }),
  ])
    .process(
      `
        @tailwind base;
        @tailwind components;
        @tailwind utilities;
      `,
      { from: undefined }
    )
    .then(result => {
      const expected = `
        .banana-sm {
          test-property: 1rem
        }
        .banana-md {
          test-property: 2rem
        }
        .banana-lg {
          test-property: 3rem
        }
        .hover\\:banana-sm:hover {
          test-property: 1rem
        }
        .hover\\:banana-md:hover {
          test-property: 2rem
        }
        .hover\\:banana-lg:hover {
          test-property: 3rem
        }

        @media (min-width: 400px) {
          .sm\\:banana-sm {
            test-property: 1rem
          }
          .sm\\:banana-md {
            test-property: 2rem
          }
          .sm\\:banana-lg {
            test-property: 3rem
          }
          .sm\\:hover\\:banana-sm:hover {
            test-property: 1rem
          }
          .sm\\:hover\\:banana-md:hover {
            test-property: 2rem
          }
          .sm\\:hover\\:banana-lg:hover {
            test-property: 3rem
          }
        }
      `

      expect(result.css).toMatchCss(expected)
    })
})

test('plugins created using `createPlugin.withOptions` do not need to be invoked if the user wants to use the default options', () => {
  const plugin = createPlugin.withOptions(
    function({ className } = { className: 'banana' }) {
      return function({ addUtilities, theme, variants }) {
        const utilities = _.fromPairs(
          _.toPairs(theme('testPlugin')).map(([k, v]) => [
            `.${className}-${k}`,
            { testProperty: v },
          ])
        )

        addUtilities(utilities, variants('testPlugin'))
      }
    },
    function() {
      return {
        theme: {
          testPlugin: {
            sm: '1rem',
            md: '2rem',
            lg: '3rem',
          },
        },
        variants: {
          testPlugin: ['responsive', 'hover'],
        },
      }
    }
  )

  return _postcss([
    tailwind({
      corePlugins: [],
      theme: {
        screens: {
          sm: '400px',
        },
      },
      plugins: [plugin],
    }),
  ])
    .process(
      `
        @tailwind base;
        @tailwind components;
        @tailwind utilities;
      `,
      { from: undefined }
    )
    .then(result => {
      const expected = `
        .banana-sm {
          test-property: 1rem
        }
        .banana-md {
          test-property: 2rem
        }
        .banana-lg {
          test-property: 3rem
        }
        .hover\\:banana-sm:hover {
          test-property: 1rem
        }
        .hover\\:banana-md:hover {
          test-property: 2rem
        }
        .hover\\:banana-lg:hover {
          test-property: 3rem
        }

        @media (min-width: 400px) {
          .sm\\:banana-sm {
            test-property: 1rem
          }
          .sm\\:banana-md {
            test-property: 2rem
          }
          .sm\\:banana-lg {
            test-property: 3rem
          }
          .sm\\:hover\\:banana-sm:hover {
            test-property: 1rem
          }
          .sm\\:hover\\:banana-md:hover {
            test-property: 2rem
          }
          .sm\\:hover\\:banana-lg:hover {
            test-property: 3rem
          }
        }
      `

      expect(result.css).toMatchCss(expected)
    })
})

test('the configFunction parameter is optional when using the `createPlugin.withOptions` function', () => {
  const plugin = createPlugin.withOptions(function({ className }) {
    return function({ addUtilities, theme, variants }) {
      const utilities = _.fromPairs(
        _.toPairs(theme('testPlugin')).map(([k, v]) => [`.${className}-${k}`, { testProperty: v }])
      )

      addUtilities(utilities, variants('testPlugin'))
    }
  })

  return _postcss([
    tailwind({
      corePlugins: [],
      theme: {
        screens: {
          sm: '400px',
        },
        testPlugin: {
          sm: '1px',
          md: '2px',
          lg: '3px',
        },
      },
      variants: {
        testPlugin: ['responsive', 'focus'],
      },
      plugins: [plugin({ className: 'banana' })],
    }),
  ])
    .process(
      `
        @tailwind base;
        @tailwind components;
        @tailwind utilities;
      `,
      { from: undefined }
    )
    .then(result => {
      const expected = `
        .banana-sm {
          test-property: 1px
        }
        .banana-md {
          test-property: 2px
        }
        .banana-lg {
          test-property: 3px
        }
        .focus\\:banana-sm:focus {
          test-property: 1px
        }
        .focus\\:banana-md:focus {
          test-property: 2px
        }
        .focus\\:banana-lg:focus {
          test-property: 3px
        }

        @media (min-width: 400px) {
          .sm\\:banana-sm {
            test-property: 1px
          }
          .sm\\:banana-md {
            test-property: 2px
          }
          .sm\\:banana-lg {
            test-property: 3px
          }
          .sm\\:focus\\:banana-sm:focus {
            test-property: 1px
          }
          .sm\\:focus\\:banana-md:focus {
            test-property: 2px
          }
          .sm\\:focus\\:banana-lg:focus {
            test-property: 3px
          }
        }
      `

      expect(result.css).toMatchCss(expected)
    })
})



test('a plugin can prepend utilities ', () => {
  const appendPlugin = createPlugin.withOptions(function() {
    return function({ addUtilities, theme, variants }) {
      addUtilities({
        '.text-indigo-100': {
          'color': '#EBF4FF',
        },
        '.bg-indigo-700': {
          'backgroundColor': '#4C51BF',
        }
      })
    }
  })

  const prependPlugin = createPlugin.withOptions(function() {
    return function({ addUtilities, theme, variants }) {
      addUtilities({
        '.button-indigo': {
          'color': '#EBF4FF',
          'backgroundColor': '#4C51BF',
        }
      }, {
        appendUtilities: false,
      })
    }
  })

  return _postcss([
    tailwind({
      corePlugins: [],
      theme: {},
      variants: {},
      plugins: [appendPlugin(), prependPlugin()],
    }),
  ])
    .process(
      `
        @tailwind base;
        @tailwind components;
        @tailwind utilities;
      `,
      { from: undefined }
    )
    .then(result => {
      const expected = `
        .button-indigo {
          color: #EBF4FF;
          background-color: #4C51BF
        }

        .text-indigo-100 {
          color: #EBF4FF
        }

        .bg-indigo-700 {
          background-color: #4C51BF
        }
      `

      expect(result.css).toMatchCss(expected)
    })
})
