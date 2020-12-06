const path = require("path");
const webpack = require("webpack");
const nodeExternals = require("webpack-node-externals");

module.exports = (config, options) => {
  //change 'mode' by env (ex: npx cross-env NODE_ENV=production ...)
  config.mode = "none";

  //changes the entry defined in angular.json/**/server/main
  //paths are related to angular.json/projects/cms
  //the output will be dist/**/express.js instead of main.js
  config.entry = { express: "./server/express.ts" };

  //execlude node_modules from bundling, use require(package) instead.
  config.externals.push(nodeExternals());

  //exclude config dir, so the user can modify the dist version and add his own configs.
  //matches: ~config/* ~~config/*  ../config/*
  config.externals.push(/^(~{1,2}|.*\/)config\/.*/);

  //set the root path alias(ex: ~packages/*) for typescript and webpack
  //tsconfig.path & webpack.resolve.alias
  config.resolve.alias["~"] = path.resolve(__dirname, "../");
  config.resolve.alias["~~"] = path.resolve(__dirname, "../../");

  //fix: setting library & libraryTarget to fix issue: require('./server.js') == undefined
  //https://github.com/webpack/webpack/issues/2030#issuecomment-232886608
  //https://github.com/webpack/webpack/issues/2030#issuecomment-290363910
  //todo: libraryTarget commonjs VS commonjs-module
  config.output.library = "";
  config.output.libraryTarget = "commonjs-module";
  config.module.rules.push(
    { test: /\.ts$/, loader: "ts-loader" },
    {
      //load .node files
      //ex: ./node_modules/sharp/build/Release/sharp.node
      // https://github.com/lovell/sharp/issues/794#issuecomment-307188099
      test: /\.node$/,
      use: "node-loader"
    }
  );

  //optimization: {minimize: false},
  //module.noParse: /polyfills-.*\.js/,
  return config;
};
