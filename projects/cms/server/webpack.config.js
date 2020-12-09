const basicConfig = require("../webpack.config.js");

module.exports = (config, options) => {
  options.target = "server";
  config = basicConfig(config, options);

  //changes the entry defined in angular.json/**/server/main
  //paths are related to angular.json/projects/cms
  //the output will be dist/**/express.js instead of main.js
  config.entry = { express: "./server/express.ts" };
  return config;
};
