import _ from 'lodash'
import postcss from 'postcss'

import substituteTailwindAtRules from './lib/substituteTailwindAtRules'
import evaluateTailwindFunctions from './lib/evaluateTailwindFunctions'
import substituteVariantsAtRules from './lib/substituteVariantsAtRules'
import substituteResponsiveAtRules from './lib/substituteResponsiveAtRules'
import convertLayerAtRulesToControlComments from './lib/convertLayerAtRulesToControlComments'
import substituteScreenAtRules from './lib/substituteScreenAtRules'
import substituteClassApplyAtRules from './lib/substituteClassApplyAtRules'
import applyImportantConfiguration from './lib/applyImportantConfiguration'
import purgeUnusedStyles from './lib/purgeUnusedStyles'

import corePlugins from './corePlugins'
import processPlugins from './util/processPlugins'
import cloneNodes from './util/cloneNodes'
import { issueFlagNotices } from './featureFlags.js'

import hash from './util/hashConfig'
import log from './util/log'
import { shared } from './util/disposables'

let previousConfig = null
let processedPlugins = null
let getProcessedPlugins = null

export default function (getConfig) {
  return async function (css) {
    const config = await getConfig()
    const configChanged = hash(previousConfig) !== hash(config)
    previousConfig = config

    if (configChanged) {
      shared.dispose()
      if (config.target) {
        log.warn([
          'The `target` feature has been removed in Tailwind CSS v2.0.',
          'Please remove this option from your config file to silence this warning.',
        ])
      }

      issueFlagNotices(config)

      processedPlugins = processPlugins(
        [...corePlugins(config), ..._.get(config, 'plugins', [])],
        config
      )

      getProcessedPlugins = function () {
        return {
          ...processedPlugins,
          base: cloneNodes(processedPlugins.base),
          components: cloneNodes(processedPlugins.components),
          utilities: cloneNodes(processedPlugins.utilities),
        }
      }
    }

    return postcss([
      substituteTailwindAtRules(config, getProcessedPlugins()),
      evaluateTailwindFunctions(config),
      substituteVariantsAtRules(config, getProcessedPlugins()),
      substituteResponsiveAtRules(config),
      convertLayerAtRulesToControlComments(config),
      substituteScreenAtRules(config),
      substituteClassApplyAtRules(config, getProcessedPlugins, configChanged),
      applyImportantConfiguration(config),
      purgeUnusedStyles(config, configChanged),
    ]).process(css, { from: _.get(css, 'source.input.file') })
  }
}
