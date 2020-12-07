const basicConfig = require("../webpack.config.js");

module.exports = (config, options) => {
  config = basicConfig(config, options);

  /*
  //keep the original config.entry provided by angular
  //  console.log({ entry: config.entry });
  config.entry = {
    main: "./browser/main.ts",
    polyfills: "./browser/polyfills.ts"
  }; */
  return config;
};
