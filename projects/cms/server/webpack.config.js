const path = require("path");
const webpack = require("webpack");
const process = require("process");
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
  //i.e: keep it as require(config/*) instead of bundling it
  //matches: ~config/* ~~config/* ./config/* ../../config/*
  //todo: also exclude config dir in build:browser
  config.externals.push(function() {
    let context, request, callback;
    if (arguments[0].context) {
      //webpack 5
      context = arguments[0].context;
      request = arguments[0].request;
      callback = arguments[1];
    } else {
      //webpack 4
      context = arguments[0];
      request = arguments[1];
      callback = arguments[2];
    }

    let regex = /^(?:~{1,2}|\.\/|(?:\.\.\/)+)config\/(.*)/;
    let match = request.match(regex);
    if (match) {
      //console.log({ context, request, match });
      //
      /*
      //get the path to config from the project's root (i.e: process.cwd() or '.')
      //the dist path will include an additional part (core) i.e: dist/cms/core/server
      //so we need to add an extra '../'
      //todo: use request.replace(REGEX) to replace ${1}
      if (request.startsWith("~"))
        request = `${path.relative(context, process.cwd())}/../config/${match[1]}`;
      else if (request.startsWith("~~")) {
        //todo: get config's path from workspace's root
      }*/

      //all paths are relative to the output file (i.e: dist/cms/core/express.js)
      //because all require(config/*) statements are in this file
      request = `../../config/${match[1]}`;

      callback(null, `commonjs ${request}`);
    } else callback();
  });

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
