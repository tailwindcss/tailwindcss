import createUtilityPlugin from '../util/createUtilityPlugin'

export default function () {
  return createUtilityPlugin('translate', [
    [
      ['translate-x', ['--tw-translate-x']],
      ['translate-y', ['--tw-translate-y']],
      ['translate-z', ['--tw-translate-z']],
    ],
  ])
}
