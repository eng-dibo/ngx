// install the same version of 'webpack' as the version used internally by 'Angular'
// > npm list webpack
import { Configuration } from 'webpack';
import { node, ExternalsOptions } from './externals';
import IgnoreNotFoundExportPlugin from './ignore-export-not-found';
// todo: use @engineers/*
import { deepMerge } from '../js/merge';

export interface Obj {
  [key: string]: any;
}

// or use string enum; i.e: enum Loaders{ts:"ts",...}
export type Loaders = 'ts' | 'node';
export type Plugins = 'ignoreNotFound';
export type LoaderOptions = boolean | Obj;
export interface ConfigOptions {
  target?: 'server' | 'browser';
  // add node packages to externals; boolean or whileList array
  nodeExternals?: boolean | ExternalsOptions;
  // loaders = true (load all loaders with default options) | ["loader"] | {loader1:true, loader2:false} | {loader:{options}}
  loaders?:
    | boolean
    | Array<Loaders>
    | {
        // todo: [k in Loaders] VS [k in keyof typeof Loaders]
        // both are working; but the second one is read only and cannot be modified later (ex: loader.ts="another value")
        // https://stackoverflow.com/questions/44243060/use-enum-as-restricted-key-type-in-typescript
        // https://www.typescriptlang.org/play?noImplicitAny=false&jsx=0#code/KYOwrgtgBAouEGUAuAnAliA5lA3gKCigEMBeAIiLIBoCoAjcusvAXzz1ElngDkv9CRGoTqt2SAJ4AHYFAAq02SSgUyUAD4qm7ADbAkUAB4BGAFw4A2gGsoGbpGTosAXQD8poiAlQWJHEVNjNj0DQwAmc2tbEHsIPgg3Dy8fPwCgvBCjAGZImzsFGUTPb19-QLYM-SgJM0srU1jHDEwi5NK04KqJCLqGuEh41pLU8sqDCRy66PlFIZSy9LGoAC9aqLsrYAkAewAzKEkZPcbUZrn20czlnvWYzZ39w+Bj-rjIc5H0q8nrBvvjp7HArAD4LNhAA
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
  const opts = deepMerge([
    {
      target: 'browser',
      nodeExternals: true,
      loaders: true,
      plugins: true
    },
    options
  ]);

  // initiate iterable (i.e: Array/object) properties
  config = deepMerge([
    {
      // change 'mode' by env (ex: npx cross-env NODE_ENV=production ...)
      mode: 'none',
      externals: [],
      output: {
        library: '',
        libraryTarget: 'window'
      },
      module: {
        rules: []
      },
      plugins: [],
      dependencies: []
    },
    config
  ]);

  // todo: typescript: these objects cannot be empty
  // tmp: initiate config properties (remove after deepMerge config & defaultConfig)
  config.externals = config.externals || [];
  config.plugins = config.plugins || [];
  config.module = config.module || { rules: [] };
  config.module.rules = config.module.rules || [];
  config.output = config.output || {};
  if (!Array.isArray(config.externals)) { config.externals = [config.externals]; }

  if (opts.nodeExternals === true) {
    (opts.nodeExternals as ExternalsOptions) = { whiteList: [] };
  }
  if (opts.nodeExternals) {
    (config.externals as Array<any>).push(function externalsNode() {
      return node(arguments, opts.nodeExternals as ExternalsOptions);
    });
  }

  // todo: libraryTarget commonjs VS commonjs-module
  if (opts.target === 'server') { config.output.libraryTarget = 'commonjs2'; }

  if (opts.loaders) {
    if (opts.loaders === true) { opts.loaders = ['ts', 'node']; }
    if (Array.isArray(opts.loaders)) {
      const loadersTemp: { [key in Loaders]?: LoaderOptions } = {};
      opts.loaders.forEach(
        // @ts-ignore: TS7053: Element implicitly has an 'any' type because expression of type '"ts" | "node"' can't be used to index type '{ 0: LoaderOptions; 1: LoaderOptions; }'
        (item: Loaders) => (loadersTemp[item] = true)
      );
      opts.loaders = loadersTemp;
    }

    if (opts.loaders.ts) {
      if (opts.loaders.ts === true) { opts.loaders.ts = {}; }
      config.module.rules.push({
        test: /\.tsx?$/,
        loader: 'ts-loader',
        options: opts.loaders.ts
      });
    }

    // load .node files
    // ex: ./node_modules/sharp/build/Release/sharp.node
    // https://github.com/lovell/sharp/issues/794#issuecomment-307188099
    if (opts.loaders.node) {
      if (opts.loaders.node === true) {
        opts.loaders.node = { name: '[name]-[contenthash].[ext]' };
      }
      config.module.rules.push({
        test: /\.node$/,
        loader: 'node-loader',
        options: opts.loaders.node
      });
    }
  }

  if (opts.plugins) {
    if (opts.plugins === true) { opts.plugins = { ignoreNotFound: true }; }
    if (Array.isArray(opts.plugins)) {
      const pluginsTemp: { [key in Plugins]?: Obj } = {};
      opts.plugins.forEach(
        // @ts-ignore: TS7053: Element implicitly has an 'any' type because expression of type '"ts" | "node"' can't be used to index type '{ 0: LoaderOptions; 1: LoaderOptions; }'
        (item: Plugins) => (pluginsTemp[item] = true)
      );
      opts.plugins = pluginsTemp;
    }
    if (opts.plugins.ignoreNotFound) {
      if (opts.plugins.ignoreNotFound === true) {
        opts.plugins.ignoreNotFound = {
          message: undefined,
          levels: ['warnings', 'errors']
        };
      }
      config.plugins.push(
        new IgnoreNotFoundExportPlugin(
          opts.plugins.ignoreNotFound.message,
          opts.plugins.ignoreNotFound.levels
        )
      );
    }
  }
  // console.log("webpack.config", { config, opts, options });
  return config;
}
