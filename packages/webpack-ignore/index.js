/*
ignore webpack warnings
see ./export-not-found.js for more details
 */

module.exports = class IgnoreWarningPlugin {
  /**
   * use constructor() to add option to specify a warning to ignore
   * todo: support glob-like
   * @method constructor
   * @param  {RegEx | sting[]} message warning message to be ignored
   * @param  {sting} level warnings | errors
   */
  constructor(message, levels = ["warnings"]) {
    this.pluginName = "IgnoreWarningPlugin";
    this.message = message;
    this.levels = levels;
  }

  apply(compiler) {
    let _this = this;

    function hook(stats) {
      if (stats.getStats) stats = stats.getStats();
      _this.levels.forEach(level => {
        //console.log(stats.compilation[level]);
        stats.compilation[level] = (
          stats.compilation[level] || []
        ).filter(warn => _this.filter(warn, level));
      });
    }

    //use hooks.afterCompile instead of hooks.done
    //https://github.com/TypeStrong/ts-loader/issues/653#issuecomment-658129853
    this.addHook(compiler, "afterCompile", hook);
  }

  /**
   * use this function to ignore specific warnings based on it's type and message.
   * @method filter
   * @param  {[type]} warn [description]
   * @return {boolean} return false to ignore the warning
   */
  filter(warn, level) {
    //convert message to RegExp
    let message = this.getMessage(this.message);

    //if the message matches warn.mesage ignore it.
    return !message.test(warn.message);
  }

  /**
   * return the message Regex, allow other classes to override it.
   * sub-classes may use message of any type: string | string[] | Regex
   * or override filter()
   * @method getMessage
   * @param  {any}   message [description]
   * @return {Regex}   [description]
   */
  getMessage(message) {
    return message instanceof RegExp ? message : new RegExp(message);
  }

  addHook(compiler, level = "done", hook) {
    if (compiler.hooks) {
      compiler.hooks[level].tap(this.pluginName, hook);
    } else {
      compiler.plugin(level, hook);
    }
  }
};
