module.exports = function (api) {
  api.cache(true);

  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'nativewind/babel',
      // Keep reanimated last per Metro requirements.
      'react-native-reanimated/plugin',
    ],
  };
};
