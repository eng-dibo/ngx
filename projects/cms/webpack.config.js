const basicConfig = require("../../webpack.config.js");
const path = require("path");

module.exports = (config, options) => {
  config = basicConfig(config, options);

  //exclude config dir, so the user can modify the dist version and add his own configs.
  //i.e: keep it as require(config/*) instead of bundling it
  //matches: ~config/* ~~config/* ./config/* ../../config/*
  //todo: also exclude config dir in build:browser
  config.externals = config.externals || [];
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

  config.resolve = config.resolve || {};
  config.resolve.alias = config.resolve.alias || {};
  config.resolve.alias["~"] = path.resolve(__dirname, "./");

  return config;
};
