export default function getPurgeContent(tailwindConfig, root) {
  if (typeof tailwindConfig.purge?.options?.contentFunction === 'function') {
    return tailwindConfig.purge.options.contentFunction(root.source.input.file)
  }

  return Array.isArray(tailwindConfig.purge) ? tailwindConfig.purge : tailwindConfig.purge.content
}
