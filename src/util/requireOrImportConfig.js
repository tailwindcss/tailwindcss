"use strict";

// Node v12.17+ exposes `import` within CJS files
// in order to `require` ESM files.

// This file is intentionally excluded from `babel` (and `eslint`)
// to avoid transpiling away the `import` statement

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = requireOrImportConfig;

function requireOrImportConfig(config) {
  try {
    return require(config)
  } catch (e) {
    if (e.code === 'ERR_REQUIRE_ESM') {
      try {
        return import(config).then(mdl => mdl.default)
      } catch (e) {}
    }
  }
  return null;
}
