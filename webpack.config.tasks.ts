import {getConfig as basicConfig, Configuration, ConfigOptions} from './webpack.config';
import {  join, resolve } from 'path';


export interface Config extends Configuration{
  WEBPACK_BUNDLE?: boolean;
  WEBPACK_BUILD?: boolean;
}

export default function (config: Config): Configuration {
  delete config.WEBPACK_BUNDLE;
  delete config.WEBPACK_BUILD;


  // outputs in the workspace's root dir, so all paths are relative to the root
  // filename ends with "!!" to be excluded by .gitignore
  config.entry = {'tasks!!': resolve(__dirname, './tasks.ts')};
  config.output = {path: resolve(__dirname)};



  const options: ConfigOptions = {
    target: 'server',
    loaders: {
       // ts: {configFile: 'tsconfig.tasks.json'}
       ts: {
       // extends: './tsconfig.json',
        compilerOptions: {
          sourceMap: false,
        },
        // only compile files bundled by webpack, instead of the provided in tsconfig.json
        // by include, exclude, files
        // same as files:['tasks.ts']
        // https://www.npmjs.com/package/ts-loader#onlycompilebundledfiles
        onlyCompileBundledFiles : true
      }
     }
 };
  return basicConfig(config, options);
}


