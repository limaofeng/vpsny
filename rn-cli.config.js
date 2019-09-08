const blacklist = require('metro-config/src/defaults/blacklist');

module.exports = {
  resolver: {
    blacklistRE: blacklist([/node_modules\/.*\/node_modules\/react-native\/.*/])
  },
  transformer: {
    babelTransformerPath: require.resolve('react-native-typescript-transformer')
  }
};
