const basicConfig = require("../webpack.config.js");
const path = require("path");

module.exports = (config, options) => {
  options.target = "server";
  config = basicConfig(config, options);

  //changes the entry defined in angular.json/**/server/main
  //paths are related to angular.json (i.e: ./projects/cms/server/*.ts)
  //the output will be dist/**/express.js instead of main.js
  config.entry = { express: path.join(__dirname, "./express.ts") };
  //console.log({ config, options });
  return config;
};
