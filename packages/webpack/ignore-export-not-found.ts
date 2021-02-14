/*
a webpack plugin to remove the error: export 'someModule' was not found in './file'
caused by "ts-loader" with webpack
running `tsc` doesn't give this error
we just need webpack to ignore this warning
https://github.com/TypeStrong/ts-loader/issues/653#issuecomment-390889335
https://github.com/webpack/webpack/issues/7378
*/

import IgnoreWarningPlugin, { Level, Message } from "./ignore";

//@ts-ignore
import ModuleDependencyWarning from "webpack/lib/ModuleDependencyWarning";
//@ts-ignore
import ModuleDependencyError from "webpack/lib/ModuleDependencyError";

export default class IgnoreNotFoundExportPlugin extends IgnoreWarningPlugin {
  constructor(moduleName: Message, levels: Level | Array<Level>) {
    //todo: if(moduleName instanceof RegExp){ RegExp to string}
    moduleName =
      moduleName instanceof Array ? `(${moduleName.join("|")})` : moduleName;
    let message = `export '${moduleName}'( \\(reexported as '.*'\\))? was not found in`;
    super(message, levels, "WebPackIgnoreNotFoundExportPlugin");
  }

  filter(warn: any, level: Level) {
    let message = this.getMessage(this.message);

    //or: warn.constructor.name === "ModuleDependencyWarning"
    //https://github.com/TypeStrong/ts-loader/issues/653#issuecomment-507514792
    let ignore =
      ((level === "warnings" && warn instanceof ModuleDependencyWarning) ||
        (level === "errors" && warn instanceof ModuleDependencyError)) &&
      message.test(warn.message);

    console.log(
      `${this.pluginName}: [${level || ""}] ${warn.message} => ${
        ignore ? "ignore" : "keep"
      }`
    );
    return !ignore;
  }
}
