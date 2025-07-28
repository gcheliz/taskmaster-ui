module.exports = {
  'packages/frontend/**/*.{js,jsx,ts,tsx}': (filenames) => [
    `cd packages/frontend && pnpm exec eslint --fix --max-warnings 500 ${filenames.map(f => f.replace(/^packages\/frontend\//, '')).join(' ')}`,
    `prettier --write ${filenames.join(' ')}`
  ],
  'packages/backend/**/*.{js,ts}': (filenames) => [
    `cd packages/backend && pnpm exec eslint --fix ${filenames.map(f => f.replace(/^packages\/backend\//, '')).join(' ')}`,
    `prettier --write ${filenames.join(' ')}`
  ],
  '*.{json,md,yml,yaml}': ['prettier --write'],
  'packages/frontend/**/*.{ts,tsx}': () => [
    'cd packages/frontend && pnpm exec tsc --noEmit'
  ],
  'packages/backend/**/*.{ts,tsx}': () => [
    'cd packages/backend && pnpm exec tsc --noEmit'
  ]
};