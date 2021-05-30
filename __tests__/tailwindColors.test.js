import tailwindColors from '../colors'

test('generate colors using buildColors function', () => {
  const colors = tailwindColors.buildColors({
    green: 'green',
    gray: 'coolGray',
  })

  expect(new Set(Object.keys(colors))).toEqual(new Set(['green', 'gray', 'transparent', 'current']))
  expect(typeof colors.green).toBe('object')
  expect(typeof colors.gray).toBe('object')
  expect(colors.transparent).toBe('transparent')
  expect(colors.current).toBe('currentColor')
})

test('failing buildColors function', () => {
  expect(() =>
    tailwindColors.buildColors({
      green: 'notAColor',
    })
  ).toThrow()
})
