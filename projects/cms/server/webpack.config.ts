import { Configuration } from "webpack";
import {
  CustomWebpackBrowserSchema,
  TargetOptions
} from "@angular-builders/custom-webpack";
import { join } from "path";
import basicConfig from "../webpack.config.ts";

export default function(
  config: Configuration,
  options: CustomWebpackBrowserSchema,
  targetOptions: TargetOptions
): Configuration {
  options.target = "server";
  config = basicConfig(config, options);

  //changes the entry defined in angular.json/**/server/main
  //paths are related to angular.json (i.e: ./projects/cms/server/*.ts)
  //the output will be dist/**/express.js instead of main.js
  config.entry = { express: join(__dirname, "./express.ts") };
  //console.log({ config, options });
  return config;
}
