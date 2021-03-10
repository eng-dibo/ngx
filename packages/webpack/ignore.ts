/*
ignore webpack warnings
see ./export-not-found.js for more details
 */

export type Level = 'warnings' | 'errors';
export type Message = RegExp | string | Array<string>;

export default class IgnoreWarningPlugin {
  protected message: Message;
  protected levels: Array<Level>;
  protected pluginName: string;

  /**
   * use constructor() to add option to specify a warning to ignore
   * todo: support glob-like
   * @method constructor
   * @param  {RegEx | sting[]} message warning message to be ignored
   * @param  {sting} level warnings | errors
   */
  constructor(
    message: Message,
    levels: Level | Array<Level> = ['warnings'],
    pluginName: string = 'WebpackIgnorePlugin'
  ) {
    this.pluginName = pluginName;
    this.message = message;
    this.levels = typeof levels === 'string' ? [levels] : levels;
  }

  apply(compiler: any) {
    const _this = this;

    function hook(stats: any) {
      if (stats.getStats) { stats = stats.getStats(); }
      _this.levels.forEach((level: Level) => {
        // console.log(stats.compilation[level]);
        stats.compilation[level] = (
          stats.compilation[level] || []
        ).filter((warn: any) => _this.filter(warn, level));
      });
    }

    // use hooks.afterCompile instead of hooks.done
    // https://github.com/TypeStrong/ts-loader/issues/653#issuecomment-658129853
    this.addHook(compiler, 'afterCompile', hook);
  }

  /**
   * use this function to ignore specific warnings based on it's type and message.
   * @method filter
   * @param  {[type]} warn [description]
   * @return {boolean} return false to ignore the warning
   */
  filter(warn: any, level: Level) {
    // convert message to RegExp
    const message = this.getMessage(this.message);

    // if the message matches warn.mesage ignore it.
    return !message.test(warn.message);
  }

  /**
   * return the message Regex, allow other classes to override it.
   * sub-classes may use message of any type: string | string[] | Regex
   * or override filter()
   * @method getMessage
   * @param  {Message}   message [description]
   * @return {Regex}   [description]
   */
  getMessage(message: Message) {
    if (message instanceof RegExp) { return message; }

    // https://github.com/TypeStrong/ts-loader/issues/653#issuecomment-658129853
    if (message instanceof Array) { message = message.join('|'); }
    else { message = message || '.*'; }

    // https://github.com/sindresorhus/escape-string-regexp
    // todo: add to packages/js
    const escapeStringForRegExp = (string: string) =>
      string.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');

    return new RegExp(escapeStringForRegExp(message));
  }

  addHook(compiler: any, level = 'done', hook: any) {
    if (compiler.hooks) {
      compiler.hooks[level].tap(this.pluginName, hook);
    } else {
      compiler.plugin(level, hook);
    }
  }
}
