// todo: import from "~webpack.config", "~~webpack.config"
import basicConfig from '../webpack.config';
import { ConfigOptions, Configuration } from '../../../webpack.config';

export default (config: Configuration, options: ConfigOptions) => {
  options.target = 'browser';
  config = basicConfig(config, options);

  /*
  //keep the original config.entry provided by angular
  //  console.log({ entry: config.entry });
  config.entry = {
    main: "./browser/main.ts",
    polyfills: "./browser/polyfills.ts"
  }; */

  config.output = config.output || {};
  config.output.libraryTarget = 'window';
  config.target = 'web';
  return config;
};
