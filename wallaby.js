module.exports = wallaby => ({
  files: [
    { pattern: 'src/**/*.+(json|png|svg|js|html|yaml|css)', instrument: false },
    'config/**/*.js',
    'src/**/*.ts?(x)',
    '!src/**/*.test.ts?(x)'
  ],
  tests: ['src/**/*.test.ts?(x)', '!src/__tests__/*.test.ts?(x)'],
  compilers: {
    'config/**/*.js?(x)': wallaby.compilers.babel({ babel: require('babel-core') }),
    '**/*.ts?(x)': wallaby.compilers.typeScript({
      useStandardDefaults: true
    })
  },
  env: {
    type: 'node',
    runner: 'node'
  },
  testFramework: 'jest',
  setup(wallaby) {
    const jestConfig = require('./package.json').jest;
    jestConfig.globals = { __DEV__: true };
    wallaby.testFramework.configure(jestConfig);
  },
  workers: {
    initial: 6,
    regular: 2
  },
  debug: true
});
