import { Configuration } from "webpack";
import { node, ExternalsOptions } from "./externals";
import IgnoreNotFoundExportPlugin from "./ignore-export-not-found";
//todo: use @engineers/*
import { deepMerge } from "../js/merge";

export interface Obj {
  [key: string]: any;
}

//or use string enum; i.e: enum Loaders{ts:"ts",...}
export type Loaders = "ts" | "node";
export type Plugins = "ignoreNotFound";
export type LoaderOptions = boolean | Obj;
export interface ConfigOptions {
  target?: "server" | "browser";
  //add node packages to externals; boolean or whileList array
  nodeExternals?: boolean | ExternalsOptions;
  //loaders = true (load all loaders with default options) | ["loader"] | {loader1:true, loader2:false} | {loader:{options}}
  loaders?:
    | boolean
    | Array<Loaders>
    | {
        //todo: [k in Loaders] VS [k in keyof typeof Loaders]
        //both are working; but the second one is read only and cannot be modified later (ex: loader.ts="another value")
        //https://stackoverflow.com/questions/44243060/use-enum-as-restricted-key-type-in-typescript
        //https://www.typescriptlang.org/play?noImplicitAny=false&jsx=0#code/KYOwrgtgBAouEGUAuAnAliA5lA3gKCigEMBeAIiLIBoCoAjcusvAXzz1ElngDkv9CRGoTqt2SAJ4AHYFAAq02SSgUyUAD4qm7ADbAkUAB4BGAFw4A2gGsoGbpGTosAXQD8poiAlQWJHEVNjNj0DQwAmc2tbEHsIPgg3Dy8fPwCgvBCjAGZImzsFGUTPb19-QLYM-SgJM0srU1jHDEwi5NK04KqJCLqGuEh41pLU8sqDCRy66PlFIZSy9LGoAC9aqLsrYAkAewAzKEkZPcbUZrn20czlnvWYzZ39w+Bj-rjIc5H0q8nrBvvjp7HArAD4LNhAA
        [key in Loaders]?: LoaderOptions;
      };
  plugins?: boolean | Array<Plugins> | { [key in Plugins]?: boolean | Obj };
}

/**
 * webpack configurations
 * @method function
 * @param  config   [description]
 * @param  options  [description]
 * @return [description]
 */
export default function(
  config: Configuration,
  options: ConfigOptions = {}
): Configuration {
  options = deepMerge([
    options,
    {
      target: "browser",
      nodeExternals: true,
      loaders: true,
      plugins: true
    }
  ]);

  //todo: initiate all config properties, ex: {resolve:{alias:[]}, ...
  config = deepMerge([
    config,
    {
      //change 'mode' by env (ex: npx cross-env NODE_ENV=production ...)
      mode: "none",
      externals: [],
      output: {
        library: "",
        libraryTarget: "window"
      },
      module: {
        rules: []
      },
      plugins: []
    }
  ]);

  //todo: typescript: these objects cannot be empty
  //tmp: initiate config properties (remove after deepMerge config & defaultConfig)
  config.externals = config.externals || [];
  config.plugins = config.plugins || [];
  config.module = config.module || { rules: [] };
  config.module.rules = config.module.rules || [];
  config.output = config.output || {};
  if (!Array.isArray(config.externals)) config.externals = [config.externals];

  if (options.nodeExternals === true)
    (options.nodeExternals as ExternalsOptions) = { whiteList: [] };
  if (options.nodeExternals)
    (config.externals as Array<any>).push(function() {
      node(arguments, options.nodeExternals as ExternalsOptions);
    });

  //todo: libraryTarget commonjs VS commonjs-module
  if (options.target === "server")
    config.output.libraryTarget = "commonjs-module";

  if (options.loaders) {
    if (options.loaders === true) options.loaders = ["ts", "node"];
    if (Array.isArray(options.loaders)) {
      let loadersTemp: { [key in Loaders]?: LoaderOptions } = {};
      options.loaders.forEach(
        //@ts-ignore: TS7053: Element implicitly has an 'any' type because expression of type '"ts" | "node"' can't be used to index type '{ 0: LoaderOptions; 1: LoaderOptions; }'
        (item: Loaders) => (loadersTemp[item] = true)
      );
      options.loaders = loadersTemp;
    }

    if (options.loaders.ts) {
      if (options.loaders.ts === true) options.loaders.ts = {};
      config.module.rules.push({
        test: /\.ts$/,
        loader: "ts-loader",
        options: options.loaders.ts
      });
    }

    //load .node files
    //ex: ./node_modules/sharp/build/Release/sharp.node
    // https://github.com/lovell/sharp/issues/794#issuecomment-307188099
    if (options.loaders.node) {
      if (options.loaders.node === true)
        options.loaders.node = { name: "[name]-[contenthash].[ext]" };
      config.module.rules.push({
        test: /\.node$/,
        loader: "node-loader",
        options: options.loaders.node
      });
    }
  }

  if (options.plugins) {
    if (options.plugins === true) options.plugins = { ignoreNotFound: true };
    if (Array.isArray(options.plugins)) {
      let pluginsTemp: { [key in Plugins]?: Obj } = {};
      options.plugins.forEach(
        //@ts-ignore: TS7053: Element implicitly has an 'any' type because expression of type '"ts" | "node"' can't be used to index type '{ 0: LoaderOptions; 1: LoaderOptions; }'
        (item: Plugins) => (pluginsTemp[item] = true)
      );
      options.plugins = pluginsTemp;
    }
    if (options.plugins.ignoreNotFound) {
      if (options.plugins.ignoreNotFound === true)
        options.plugins.ignoreNotFound = {
          message: undefined,
          levels: ["warnings", "errors"]
        };
      config.plugins.push(
        new IgnoreNotFoundExportPlugin(
          options.plugins.ignoreNotFound.message,
          options.plugins.ignoreNotFound.levels
        )
      );
    }
  }

  return config;
}
