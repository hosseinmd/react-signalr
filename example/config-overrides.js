const path = require("path");
const webpack = require("webpack");

// const appDirectory = fs.realpathSync(process.cwd())
const resolveApp = (relativePath) => path.resolve(__dirname, relativePath);
// our packages that will now be included in the CRA build step
const appIncludes = [resolveApp("./src"), resolveApp("../src")];

module.exports = function override(config, env) {
  const __DEV__ = env !== "production";

  // allow importing from outside of src folder
  config.resolve.plugins = config.resolve.plugins.filter(
    (plugin) => plugin.constructor.name !== "ModuleScopePlugin",
  );

  config.module.rules[0].include = appIncludes;
  //eslint
  // if (__DEV__) {
  //   config.module.rules[1].include = srcIncludes;
  //   config.module.rules[1].use[0].options.baseConfig = require("./.eslintrc.json");
  // } else {
  //   config.module.rules[1] = null;
  // }
  // oneOf index will change to 2 in future
  config.module.rules[1].oneOf[2].include = appIncludes;
  // config.module.rules[1].oneOf[2].options.plugins = [
  //   require.resolve("babel-plugin-react-native-web"),
  // ].concat(config.module.rules[1].oneOf[2].options.plugins);
  // config.module.rules = config.module.rules.filter(Boolean);

  // config.plugins = config.plugins.filter((v) => !(v instanceof ESLintPlugin));

  config.plugins.push(new webpack.DefinePlugin({ __DEV__ }));
  return config;
};
