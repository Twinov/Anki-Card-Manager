module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  extends: [
    'standard'
  ],
  overrides: [
    {
      files: ['*.svelte'],
      processor: 'svelte3/svelte3'
    }
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module'
  },
  plugins: [
    'svelte3',
    '@typescript-eslint'
  ],
  rules: {
  },
  settings: {
    'svelte3/typescript': () => require('typescript')
  }
}