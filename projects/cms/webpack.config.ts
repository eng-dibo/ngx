import { resolve } from "path";
import {
  getConfig as basicConfig,
  ConfigOptions,
  Configuration,
  CustomWebpackBrowserSchema,
  TargetOptions
} from "../../webpack.config";
//import { ExternalItem } from "webpack";
import externals from "../../packages/webpack/externals";
import { deepMerge } from "../../packages/js/merge";

export {
  ConfigOptions,
  Configuration,
  CustomWebpackBrowserSchema,
  TargetOptions
};

export default function(
  config: Configuration,
  options: ConfigOptions = {},
  targetOptions?: TargetOptions
): Configuration {
  return getConfig(config);
}

export function getConfig(
  config: Configuration,
  options: ConfigOptions = {}
): Configuration {
  let configPattern = /^(?:~{1,2}|\.\/|(?:\.\.\/)+)config\/(.*)/;

  options = deepMerge(
    [
      options,
      {
        nodeExternals: {
          //add ~* (ex: ~config/*, ~browser/*) to whiteList to prevent it from transforming to `commnjs2 ~config/*`
          //so it can be properly transormed to 'commonjs ../config/*' by the function bellow
          whiteList: [/^~/]
        }
      }
    ],
    { strategy: "push" }
  );

  config = basicConfig(config, options);

  config.externals = config.externals || [];
  if (!Array.isArray(config.externals)) config.externals = [config.externals];

  /*or as ExternalItem[]*/
  (config.externals as Array<any>).push(function() {
    //exclude config dir, so the user can modify the dist version and add his own configs.
    //i.e: keep it as require(config/*) instead of bundling it
    //matches: ~config/* ~~config/* ./config/* ../../config/*
    //todo: also exclude config dir in build:browser

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

    externals(
      [configPattern],
      arguments,

      (request: string) => {
        let match = request.match(configPattern);
        //path is relative to this file (i.e: webpack.config.ts),
        //not to the file that requested the 'request'
        //so, we don't need to calculate the relative path
        return `commonjs2 ../../config/${match![1]}`;

        /*if (match[1] === "config")
          return `commonjs2 ../../${match![1]}/${match![2]}`;
        else if (match[1] === "browser") return; */
      }
    );
  });

  config.resolve = config.resolve || {};
  config.resolve.alias = config.resolve.alias || {};

  //@ts-ignore: TS7053: Element implicitly has an 'any' type because expression of type '"~"' can't be used to index type ...
  config.resolve.alias["~"] = resolve(__dirname, "./");
  //console.log("cms", { config, options });
  return config;
}
