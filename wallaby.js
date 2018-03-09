module.exports = wallaby => ({
  files: [{ pattern: 'src/**/*.+(json|jpg|jpeg|gif|png|svg)', instrument: false }, 'config/**/*.js', 'src/**/*.js?(x)'],
  tests: ['tests/**/*.test.js?(x)'],
  compilers: {
    '**/*.js?(x)': wallaby.compilers.babel({ babel: require('babel-core') })
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
  debug: true
});
