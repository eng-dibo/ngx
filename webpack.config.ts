//the basic webpack configurations for the project, extend it for server, browser

import { Configuration } from "webpack";
import {
  CustomWebpackBrowserSchema,
  TargetOptions
} from "@angular-builders/custom-webpack";
import { resolve } from "path";
//const webpack = require("webpack");
//const process = require("process");
const nodeExternals = require("webpack-node-externals");
const IgnoreNotFoundExportPlugin = require("./packages/webpack-ignore/export-not-found");

export default function(
  config: Configuration,
  options: CustomWebpackBrowserSchema,
  targetOptions: TargetOptions
): Configuration {
  options.target = options.target || "browser";
  //change 'mode' by env (ex: npx cross-env NODE_ENV=production ...)
  if (!("mode" in config)) config.mode = options.mode || "none";

  config.externals = config.externals || [];

  //execlude node_modules from bundling, use require(package) instead.
  config.externals.push(nodeExternals());

  //set the root path alias(ex: ~packages/*) for typescript and webpack
  //tsconfig.path & webpack.resolve.alias
  config.resolve = config.resolve || {};
  config.resolve.alias = config.resolve.alias || {};
  config.resolve.alias["~~"] = resolve(__dirname, "./");
  config.resolve.alias["@engineers"] = resolve(__dirname, "./packages/");
  config.resolve.symlinks = false;

  //fix: setting library & libraryTarget to fix issue: require('./server.js') == undefined
  //https://github.com/webpack/webpack/issues/2030#issuecomment-232886608
  //https://github.com/webpack/webpack/issues/2030#issuecomment-290363910
  //todo: libraryTarget commonjs VS commonjs-module
  config.output = config.output || {};
  config.output.libraryTarget =
    config.output.libraryTarget || options.target === "server"
      ? "commonjs-module"
      : "window";
  config.module = config.module || {};
  config.module.rules = config.module.rules || [];
  config.module.rules.push(
    { test: /\.ts$/, loader: "ts-loader" },
    //load .node files
    //ex: ./node_modules/sharp/build/Release/sharp.node
    // https://github.com/lovell/sharp/issues/794#issuecomment-307188099
    {
      test: /\.node$/,
      loader: "node-loader",
      options: { name: "[name]-[contenthash].[ext]" }
    }
  );

  config.plugins = config.plugins || [];
  config.plugins.push(
    new IgnoreNotFoundExportPlugin(undefined, ["warnings", "errors"])
  );

  //optimization: {minimize: false},
  //module.noParse: /polyfills-.*\.js/,
  return config;
}