import path from 'path'
import fs from 'fs'

import _ from 'lodash'

import getModuleDependencies from './lib/getModuleDependencies'
import registerConfigAsDependency from './lib/registerConfigAsDependency'
import processTailwindFeatures from './processTailwindFeatures'
import formatCSS from './lib/formatCSS'
import resolveConfig from './util/resolveConfig'
import getAllConfigs from './util/getAllConfigs'
import requireOrImportConfig from './util/requireOrImportConfig'
import { supportedConfigFiles } from './constants'
import defaultConfig from '../stubs/defaultConfig.stub.js'
import log from './util/log'

import jitPlugins from './jit'

function resolveConfigPath(filePath) {
  // require('tailwindcss')({ theme: ..., variants: ... })
  if (_.isObject(filePath) && !_.has(filePath, 'config') && !_.isEmpty(filePath)) {
    return undefined
  }

  // require('tailwindcss')({ config: 'custom-config.js' })
  if (_.isObject(filePath) && _.has(filePath, 'config') && _.isString(filePath.config)) {
    return path.resolve(filePath.config)
  }

  // require('tailwindcss')({ config: { theme: ..., variants: ... } })
  if (_.isObject(filePath) && _.has(filePath, 'config') && _.isObject(filePath.config)) {
    return undefined
  }

  // require('tailwindcss')('custom-config.js')
  if (_.isString(filePath)) {
    return path.resolve(filePath)
  }

  // require('tailwindcss')
  for (const configFile of supportedConfigFiles) {
    try {
      const configPath = path.resolve(configFile)
      fs.accessSync(configPath)
      return configPath
    } catch (err) {}
  }

  return undefined
}

const getConfigFunction = (config) => async () => {
  if (_.isUndefined(config)) {
    return resolveConfig([...getAllConfigs(defaultConfig)])
  }

  // Skip this if Jest is running: https://github.com/facebook/jest/pull/9841#issuecomment-621417584
  if (process.env.JEST_WORKER_ID === undefined) {
    if (!_.isObject(config)) {
      getModuleDependencies(config).forEach((mdl) => {
        delete require.cache[require.resolve(mdl.file)]
      })
    }
  }

  const configObject = _.isObject(config)
    ? _.get(config, 'config', config)
    : await requireOrImportConfig(config)

  return resolveConfig([...getAllConfigs(configObject)])
}

let warned = false

module.exports = function (config) {
  const resolvedConfigPath = resolveConfigPath(config)
  const getConfig = getConfigFunction(resolvedConfigPath || config)
  const mode = _.get(getConfig(), 'mode', 'aot')

  if (mode === 'jit') {
    if (!warned) {
      log.warn([
        `You have enabled the JIT engine which is currently in preview.`,
        'Preview features are not covered by semver, may introduce breaking changes, and can change at any time.',
      ])
      warned = true
    }

    return {
      postcssPlugin: 'tailwindcss',
      plugins: jitPlugins(config),
    }
  }

  const plugins = []

  if (!_.isUndefined(resolvedConfigPath)) {
    plugins.push(registerConfigAsDependency(resolvedConfigPath))
  }

  return {
    postcssPlugin: 'tailwindcss',
    plugins: [...plugins, processTailwindFeatures(getConfig), formatCSS],
  }
}

module.exports.postcss = true
