module.exports = {
  preset: 'react-native',
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|@react-native|@react-navigation|@reduxjs/toolkit|immer|react-native-localize)/',
  ],
};
