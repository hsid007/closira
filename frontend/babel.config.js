module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    // Reanimated 3.16+ uses the worklets plugin from react-native-worklets.
    // It must remain the LAST plugin in the list.
    plugins: ["react-native-worklets/plugin"],
  };
};
