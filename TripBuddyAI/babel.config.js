module.exports = function (api) {
  api.cache(true);

  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'nativewind/babel',
      // Keep reanimated last per Metro requirements.
      'react-native-reanimated/plugin',
    ],
  // Keep this as a simple string so Metro loads the NativeWind preset correctly.
  // Add other plugins (e.g., reanimated) at the end of the array if needed.
  return {
    presets: ['babel-preset-expo'],
    plugins: ['nativewind/babel'],
  };
};
