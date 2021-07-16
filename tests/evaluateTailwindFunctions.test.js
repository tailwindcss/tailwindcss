import postcss from 'postcss'
import plugin from '../src/lib/evaluateTailwindFunctions'

function run(input, opts = {}) {
  return postcss([plugin({ tailwindConfig: opts })]).process(input, { from: undefined })
}

test('it looks up values in the theme using dot notation', () => {
  const input = `
    .banana { color: theme('colors.yellow'); }
  `

  const output = `
    .banana { color: #f7cc50; }
  `

  return run(input, {
    theme: {
      colors: {
        yellow: '#f7cc50',
      },
    },
  }).then((result) => {
    expect(result.css).toEqual(output)
    expect(result.warnings().length).toBe(0)
  })
})

test('color can be a function', () => {
  const input = `
    .backgroundColor { color: theme('backgroundColor.fn') }
    .borderColor { color: theme('borderColor.fn') }
    .caretColor { color: theme('caretColor.fn') }
    .colors { color: theme('colors.fn') }
    .divideColor { color: theme('divideColor.fn') }
    .fill { color: theme('fill.fn') }
    .gradientColorStops { color: theme('gradientColorStops.fn') }
    .placeholderColor { color: theme('placeholderColor.fn') }
    .ringColor { color: theme('ringColor.fn') }
    .ringOffsetColor { color: theme('ringOffsetColor.fn') }
    .stroke { color: theme('stroke.fn') }
    .textColor { color: theme('textColor.fn') }
  `

  const output = `
    .backgroundColor { color: #f00 }
    .borderColor { color: #f00 }
    .caretColor { color: #f00 }
    .colors { color: #f00 }
    .divideColor { color: #f00 }
    .fill { color: #f00 }
    .gradientColorStops { color: #f00 }
    .placeholderColor { color: #f00 }
    .ringColor { color: #f00 }
    .ringOffsetColor { color: #f00 }
    .stroke { color: #f00 }
    .textColor { color: #f00 }
  `

  const fn = () => `#f00`

  return run(input, {
    theme: {
      backgroundColor: { fn },
      borderColor: { fn },
      caretColor: { fn },
      colors: { fn },
      divideColor: { fn },
      fill: { fn },
      gradientColorStops: { fn },
      placeholderColor: { fn },
      ringColor: { fn },
      ringOffsetColor: { fn },
      stroke: { fn },
      textColor: { fn },
    },
  }).then((result) => {
    expect(result.css).toEqual(output)
    expect(result.warnings().length).toBe(0)
  })
})

test('quotes are optional around the lookup path', () => {
  const input = `
    .banana { color: theme(colors.yellow); }
  `

  const output = `
    .banana { color: #f7cc50; }
  `

  return run(input, {
    theme: {
      colors: {
        yellow: '#f7cc50',
      },
    },
  }).then((result) => {
    expect(result.css).toEqual(output)
    expect(result.warnings().length).toBe(0)
  })
})

test('a default value can be provided', () => {
  const input = `
    .cookieMonster { color: theme('colors.blue', #0000ff); }
  `

  const output = `
    .cookieMonster { color: #0000ff; }
  `

  return run(input, {
    theme: {
      colors: {
        yellow: '#f7cc50',
      },
    },
  }).then((result) => {
    expect(result.css).toEqual(output)
    expect(result.warnings().length).toBe(0)
  })
})

test('the default value can use the theme function', () => {
  const input = `
    .cookieMonster { color: theme('colors.blue', theme('colors.yellow')); }
  `

  const output = `
    .cookieMonster { color: #f7cc50; }
  `

  return run(input, {
    theme: {
      colors: {
        yellow: '#f7cc50',
      },
    },
  }).then((result) => {
    expect(result.css).toEqual(output)
    expect(result.warnings().length).toBe(0)
  })
})

test('quotes are preserved around default values', () => {
  const input = `
    .heading { font-family: theme('fontFamily.sans', "Helvetica Neue"); }
  `

  const output = `
    .heading { font-family: "Helvetica Neue"; }
  `

  return run(input, {
    theme: {
      fontFamily: {
        serif: 'Constantia',
      },
    },
  }).then((result) => {
    expect(result.css).toEqual(output)
    expect(result.warnings().length).toBe(0)
  })
})

test('an unquoted list is valid as a default value', () => {
  const input = `
    .heading { font-family: theme('fontFamily.sans', Helvetica, Arial, sans-serif); }
  `

  const output = `
    .heading { font-family: Helvetica, Arial, sans-serif; }
  `

  return run(input, {
    theme: {
      fontFamily: {
        serif: 'Constantia',
      },
    },
  }).then((result) => {
    expect(result.css).toEqual(output)
    expect(result.warnings().length).toBe(0)
  })
})

test('a missing root theme value throws', () => {
  const input = `
    .heading { color: theme('colours.gray.100'); }
  `

  return expect(
    run(input, {
      theme: {
        colors: {
          yellow: '#f7cc50',
        },
      },
    })
  ).rejects.toThrowError(
    `'colours.gray.100' does not exist in your theme config. Your theme has the following top-level keys: 'colors'`
  )
})

test('a missing nested theme property throws', () => {
  const input = `
    .heading { color: theme('colors.red'); }
  `

  return expect(
    run(input, {
      theme: {
        colors: {
          blue: 'blue',
          yellow: '#f7cc50',
        },
      },
    })
  ).rejects.toThrowError(
    `'colors.red' does not exist in your theme config. 'colors' has the following valid keys: 'blue', 'yellow'`
  )
})

test('a missing nested theme property with a close alternative throws with a suggestion', () => {
  const input = `
    .heading { color: theme('colors.yellw'); }
  `

  return expect(
    run(input, {
      theme: {
        colors: {
          yellow: '#f7cc50',
        },
      },
    })
  ).rejects.toThrowError(
    `'colors.yellw' does not exist in your theme config. Did you mean 'colors.yellow'?`
  )
})

test('a path through a non-object throws', () => {
  const input = `
    .heading { color: theme('colors.yellow.100'); }
  `

  return expect(
    run(input, {
      theme: {
        colors: {
          yellow: '#f7cc50',
        },
      },
    })
  ).rejects.toThrowError(
    `'colors.yellow.100' does not exist in your theme config. 'colors.yellow' is not an object.`
  )
})

test('a path which exists but is not a string throws', () => {
  const input = `
    .heading { color: theme('colors.yellow'); }
  `

  return expect(
    run(input, {
      theme: {
        colors: {
          yellow: Symbol(),
        },
      },
    })
  ).rejects.toThrowError(`'colors.yellow' was found but does not resolve to a string.`)
})

test('a path which exists but is invalid throws', () => {
  const input = `
    .heading { color: theme('colors'); }
  `

  return expect(
    run(input, {
      theme: {
        colors: {},
      },
    })
  ).rejects.toThrowError(`'colors' was found but does not resolve to a string.`)
})

test('a path which is an object throws with a suggested key', () => {
  const input = `
    .heading { color: theme('colors'); }
  `

  return expect(
    run(input, {
      theme: {
        colors: {
          yellow: '#f7cc50',
        },
      },
    })
  ).rejects.toThrowError(
    `'colors' was found but does not resolve to a string. Did you mean something like 'colors.yellow'?`
  )
})

test('array values are joined by default', () => {
  const input = `
    .heading { font-family: theme('fontFamily.sans'); }
  `

  const output = `
    .heading { font-family: Inter, Helvetica, sans-serif; }
  `

  return run(input, {
    theme: {
      fontFamily: {
        sans: ['Inter', 'Helvetica', 'sans-serif'],
      },
    },
  }).then((result) => {
    expect(result.css).toEqual(output)
    expect(result.warnings().length).toBe(0)
  })
})

test('font sizes are retrieved without default line-heights or letter-spacing', () => {
  const input = `
    .heading-1 { font-size: theme('fontSize.lg'); }
    .heading-2 { font-size: theme('fontSize.xl'); }
  `

  const output = `
    .heading-1 { font-size: 20px; }
    .heading-2 { font-size: 24px; }
  `

  return run(input, {
    theme: {
      fontSize: {
        lg: ['20px', '28px'],
        xl: ['24px', { lineHeight: '32px', letterSpacing: '-0.01em' }],
      },
    },
  }).then((result) => {
    expect(result.css).toMatchCss(output)
    expect(result.warnings().length).toBe(0)
  })
})

test('outlines are retrieved without default outline-offset', () => {
  const input = `
    .element { outline: theme('outline.black'); }
  `

  const output = `
    .element { outline: 2px dotted black; }
  `

  return run(input, {
    theme: {
      outline: {
        black: ['2px dotted black', '4px'],
      },
    },
  }).then((result) => {
    expect(result.css).toMatchCss(output)
    expect(result.warnings().length).toBe(0)
  })
})

test('font-family values are joined when an array', () => {
  const input = `
    .element { font-family: theme('fontFamily.sans'); }
  `

  const output = `
    .element { font-family: Helvetica, Arial, sans-serif; }
  `

  return run(input, {
    theme: {
      fontFamily: {
        sans: ['Helvetica', 'Arial', 'sans-serif'],
      },
    },
  }).then((result) => {
    expect(result.css).toMatchCss(output)
    expect(result.warnings().length).toBe(0)
  })
})

test('box-shadow values are joined when an array', () => {
  const input = `
    .element { box-shadow: theme('boxShadow.wtf'); }
  `

  const output = `
    .element { box-shadow: 0 0 2px black, 1px 2px 3px white; }
  `

  return run(input, {
    theme: {
      boxShadow: {
        wtf: ['0 0 2px black', '1px 2px 3px white'],
      },
    },
  }).then((result) => {
    expect(result.css).toMatchCss(output)
    expect(result.warnings().length).toBe(0)
  })
})

test('transition-property values are joined when an array', () => {
  const input = `
    .element { transition-property: theme('transitionProperty.colors'); }
  `

  const output = `
    .element { transition-property: color, fill; }
  `

  return run(input, {
    theme: {
      transitionProperty: {
        colors: ['color', 'fill'],
      },
    },
  }).then((result) => {
    expect(result.css).toMatchCss(output)
    expect(result.warnings().length).toBe(0)
  })
})

test('transition-duration values are joined when an array', () => {
  const input = `
    .element { transition-duration: theme('transitionDuration.lol'); }
  `

  const output = `
    .element { transition-duration: 1s, 2s; }
  `

  return run(input, {
    theme: {
      transitionDuration: {
        lol: ['1s', '2s'],
      },
    },
  }).then((result) => {
    expect(result.css).toMatchCss(output)
    expect(result.warnings().length).toBe(0)
  })
})

test('basic screen function calls are expanded', () => {
  const input = `
    @media screen(sm) {
      .foo {}
    }
  `

  const output = `
  @media (min-width: 600px) {
    .foo {}
  }
  `

  return run(input, {
    theme: { screens: { sm: '600px' } },
  }).then((result) => {
    expect(result.css).toMatchCss(output)
    expect(result.warnings().length).toBe(0)
  })
})

test('screen function supports max-width screens', () => {
  const input = `
    @media screen(sm) {
      .foo {}
    }
  `

  const output = `
  @media (max-width: 600px) {
    .foo {}
  }
  `

  return run(input, {
    theme: { screens: { sm: { max: '600px' } } },
  }).then((result) => {
    expect(result.css).toMatchCss(output)
    expect(result.warnings().length).toBe(0)
  })
})

test('screen function supports min-width screens', () => {
  const input = `
    @media screen(sm) {
      .foo {}
    }
  `

  const output = `
  @media (min-width: 600px) {
    .foo {}
  }
  `

  return run(input, {
    theme: { screens: { sm: { min: '600px' } } },
  }).then((result) => {
    expect(result.css).toMatchCss(output)
    expect(result.warnings().length).toBe(0)
  })
})

test('screen function supports min-width and max-width screens', () => {
  const input = `
    @media screen(sm) {
      .foo {}
    }
  `

  const output = `
  @media (min-width: 600px) and (max-width: 700px) {
    .foo {}
  }
  `

  return run(input, {
    theme: { screens: { sm: { min: '600px', max: '700px' } } },
  }).then((result) => {
    expect(result.css).toMatchCss(output)
    expect(result.warnings().length).toBe(0)
  })
})

test('screen function supports raw screens', () => {
  const input = `
    @media screen(mono) {
      .foo {}
    }
  `

  const output = `
  @media monochrome {
    .foo {}
  }
  `

  return run(input, {
    theme: { screens: { mono: { raw: 'monochrome' } } },
  }).then((result) => {
    expect(result.css).toMatchCss(output)
    expect(result.warnings().length).toBe(0)
  })
})

test('screen arguments can be quoted', () => {
  const input = `
    @media screen('sm') {
      .foo {}
    }
  `

  const output = `
  @media (min-width: 600px) {
    .foo {}
  }
  `

  return run(input, {
    theme: { screens: { sm: '600px' } },
  }).then((result) => {
    expect(result.css).toMatchCss(output)
    expect(result.warnings().length).toBe(0)
  })
})
