const prettier = require('prettier')
const { diff } = require('jest-diff')

// Used to compare two CSS strings with all whitespace removed
// This is probably naive but it's fast and works well enough.
function stripped(str) {
  return str.replace(/\s/g, '').replace(/;/g, '')
}

function format(input) {
  return prettier.format(input.replace(/\n/g, ''), {
    parser: 'css',
    printWidth: 100,
  })
}

expect.extend({
  toMatchCss(received, argument) {
    const options = {
      comment: 'stripped(received) === stripped(argument)',
      isNot: this.isNot,
      promise: this.promise,
    }

    const pass = stripped(received) === stripped(argument)

    const message = pass
      ? () => {
          return (
            this.utils.matcherHint('toMatchCss', undefined, undefined, options) +
            '\n\n' +
            `Expected: not ${this.utils.printExpected(format(received))}\n` +
            `Received: ${this.utils.printReceived(format(argument))}`
          )
        }
      : () => {
          const actual = format(received)
          const expected = format(argument)

          const diffString = diff(expected, actual, {
            expand: this.expand,
          })

          return (
            this.utils.matcherHint('toMatchCss', undefined, undefined, options) +
            '\n\n' +
            (diffString && diffString.includes('- Expect')
              ? `Difference:\n\n${diffString}`
              : `Expected: ${this.utils.printExpected(expected)}\n` +
                `Received: ${this.utils.printReceived(actual)}`)
          )
        }

    return { actual: received, message, pass }
  },
  toMatchLargeCss(received, argument) {
    const options = {
      comment: 'stripped(received) === stripped(argument)',
      isNot: this.isNot,
      promise: this.promise,
    }

    const pass = stripped(received) === stripped(argument)

    const message = pass
      ? () => {
          return (
            this.utils.matcherHint('toMatchLargeCss', undefined, undefined, options) +
            '\n\n' +
            `Expected: not ${this.utils.printExpected(received)}\n` +
            `Received: ${this.utils.printReceived(argument)}`
          )
        }
      : () => {
          const diffString = diff(argument, received, {
            expand: this.expand,
          })

          return (
            this.utils.matcherHint('toMatchLargeCss', undefined, undefined, options) +
            '\n\n' +
            (diffString && diffString.includes('- Expect')
              ? `Difference:\n\n${diffString}`
              : `Expected: ${this.utils.printExpected(argument)}\n` +
                `Received: ${this.utils.printReceived(received)}`)
          )
        }

    return { actual: received, message, pass }
  },
  toIncludeCss(received, argument) {
    const options = {
      comment: 'stripped(received).includes(stripped(argument))',
      isNot: this.isNot,
      promise: this.promise,
    }

    const pass = stripped(received).includes(stripped(argument))

    const message = pass
      ? () => {
          return (
            this.utils.matcherHint('toIncludeCss', undefined, undefined, options) +
            '\n\n' +
            `Expected: not ${this.utils.printExpected(format(received))}\n` +
            `Received: ${this.utils.printReceived(format(argument))}`
          )
        }
      : () => {
          const actual = format(received)
          const expected = format(argument)

          const diffString = diff(expected, actual, {
            expand: this.expand,
          })

          return (
            this.utils.matcherHint('toIncludeCss', undefined, undefined, options) +
            '\n\n' +
            (diffString && diffString.includes('- Expect')
              ? `Difference:\n\n${diffString}`
              : `Expected: ${this.utils.printExpected(expected)}\n` +
                `Received: ${this.utils.printReceived(actual)}`)
          )
        }

    return { actual: received, message, pass }
  },
  toMatchFormattedCss(received, argument) {
    const options = {
      comment: 'format(received) === format(argument)',
      isNot: this.isNot,
      promise: this.promise,
    }

    let formattedReceived = format(received)
    let formattedArgument = format(argument)

    const pass = formattedReceived === formattedArgument

    const message = pass
      ? () => {
          return (
            this.utils.matcherHint('toMatchCss', undefined, undefined, options) +
            '\n\n' +
            `Expected: not ${this.utils.printExpected(formattedReceived)}\n` +
            `Received: ${this.utils.printReceived(formattedArgument)}`
          )
        }
      : () => {
          const actual = formattedReceived
          const expected = formattedArgument

          const diffString = diff(expected, actual, {
            expand: this.expand,
          })

          return (
            this.utils.matcherHint('toMatchCss', undefined, undefined, options) +
            '\n\n' +
            (diffString && diffString.includes('- Expect')
              ? `Difference:\n\n${diffString}`
              : `Expected: ${this.utils.printExpected(expected)}\n` +
                `Received: ${this.utils.printReceived(actual)}`)
          )
        }

    return { actual: received, message, pass }
  },
})
