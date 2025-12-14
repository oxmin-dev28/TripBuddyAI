module.exports = function (api) {
  api.cache(true);

  const plugins = [require.resolve('nativewind/babel')];

  // Keep additional plugins (e.g., reanimated) at the end if added later
  return {
    presets: ['babel-preset-expo'],
    plugins,
  };
};
