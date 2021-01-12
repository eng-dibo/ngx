/*
a webpack plugin to remove the error: export 'someModule' was not found in './file'
caused by "ts-loader" with webpack
running `tsc` doesn't give this error
we just need webpack to ignore this warning
https://github.com/TypeStrong/ts-loader/issues/653#issuecomment-390889335
https://github.com/webpack/webpack/issues/7378
*/

const IgnoreWarningPlugin = require("./index");
const ModuleDependencyWarning = require("webpack/lib/ModuleDependencyWarning");
const ModuleDependencyError = require("webpack/lib/ModuleDependencyError");

module.exports = class IgnoreNotFoundExportPlugin extends IgnoreWarningPlugin {
  constructor(message, levels) {
    super();
    this.pluginName = "IgnoreNotFoundExportPlugin";
    this.message = message;
    this.levels = levels;
  }

  filter(warn, level) {
    let message = this.getMessage(this.message);

    //or: warn.constructor.name === "ModuleDependencyWarning"
    //https://github.com/TypeStrong/ts-loader/issues/653#issuecomment-507514792
    let ignore =
      ((level === "warnings" && warn instanceof ModuleDependencyWarning) ||
        (level === "errors" && warn instanceof ModuleDependencyError)) &&
      message.test(warn.message);

    console.log(
      `webpack.IgnoreNotFoundExportPlugin: [${level || ""}] ${
        warn.message
      } => ${ignore ? "ignore" : "keep"}`
    );
    return !ignore;
  }

  /**
   * ignore warning messages: 'export $moduleName was not found in $fileName'
   * todo: support message as RegExp or glob-like
   * @method getMessage
   * @param  {Regex | string | string[]}   message [description]
   * @return {[type]}   [description]
   */
  getMessage(message) {
    let module;

    //https://github.com/TypeStrong/ts-loader/issues/653#issuecomment-658129853
    if (message instanceof Array) {
      //https://github.com/sindresorhus/escape-string-regexp
      //todo: add to packages/js
      let escapeStringForRegExp = string =>
        string.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&");

      module = message.map(escapeStringForRegExp).join("|");
    } else module = message || ".*";

    return new RegExp(
      `export '${module}'( \\(reexported as '.*'\\))? was not found in`
    );
  }
};
