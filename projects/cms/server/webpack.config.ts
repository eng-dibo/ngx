import { join } from "path";
import {
  getConfig as basicConfig,
  ConfigOptions,
  Configuration,
  CustomWebpackBrowserSchema,
  TargetOptions
} from "../webpack.config";

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
  options.target = "server";
  config = basicConfig(config, options);

  //changes the entry defined in angular.json/**/server/main
  //paths are related to angular.json (i.e: ./projects/cms/server/*.ts)
  //the output will be dist/**/express.js instead of main.js
  config.entry = { express: join(__dirname, "./express.ts") };
  //console.log("server", { config, options });
  return config;
}
