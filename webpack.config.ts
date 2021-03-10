// the basic webpack configurations for the project, extend it for server, browser

// todo: use @engineers/webpack/config
// should know the alias path using tsconfig.paths
// webpack runs `tsc` to compile this file into .js using tsconfig.json
import webpackConfig, { ConfigOptions } from './packages/webpack/config';
import { ExternalsOptionsObj } from './packages/webpack/externals';
import { deepMerge } from './packages/js/merge';
import { Configuration } from 'webpack';
import {
  CustomWebpackBrowserSchema,
  TargetOptions
} from '@angular-builders/custom-webpack';
import { resolve } from 'path';

export {
  ConfigOptions,
  Configuration,
  CustomWebpackBrowserSchema,
  TargetOptions
};

/**
 * function received by @angular-builders/custom-webpack
 * @method function
 * @param  config        [description]
 * @param  options       [description]
 * @param  targetOptions [description]
 * @return [description]
 */
export default function(
  config: Configuration,
  options?: CustomWebpackBrowserSchema,
  targetOptions?: TargetOptions
): Configuration {
  // todo: use `targetOptions` to set default options.target
  return getConfig(config);
}

/**
 * the basic webpack config for the workspace.
 * @method getConfig
 * @param  config    [description]
 * @param  options   [description]
 * @return [description]
 */
export function getConfig(
  config: Configuration,
  options: ConfigOptions = {}
): Configuration {
  // todo: in other applications that use @engineers/* packages,
  // it is better to not whiteList it, as it will be published to npm.

  options = deepMerge(
    [
      options,
      {
        nodeExternals: {
          whiteList: [/@engineers\/.+/]
        }
      }
    ],
    { strategy: 'push' }
  );

  config = webpackConfig(config, options);

  // set the root path alias(ex: ~packages/*) for typescript and webpack
  // tsconfig.path & webpack.resolve.alias
  config.resolve = config.resolve || {};
  config.resolve.alias = config.resolve.alias || {};

  // @ts-ignore
  config.resolve.alias['~~'] = resolve(__dirname, './');
  // @ts-ignore
  config.resolve.alias['@engineers'] = resolve(__dirname, './packages/');
  config.resolve.symlinks = false;

  // optimization: {minimize: false},
  // module.noParse: /polyfills-.*\.js/,
  // console.log("WS", { config, options });
  return config;
}
