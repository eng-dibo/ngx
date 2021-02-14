//todo: use @engineers (@engineers/js/regex)
import { toRegExp } from "../js/regex";
import { objectType } from "../nodejs/objects";

export type ExternalsParams = IArguments;

/**
 * function arguments of config.externals[function(...args){}]
 * @method params
 * @param  args   [description]
 * @return [description]
 */
export function params(args: ExternalsParams) {
  let request, context, callback;
  if (args[0].context) {
    //webpack 5
    context = args[0].context;
    request = args[0].request;
    callback = args[1];
  } else {
    //webpack 4
    context = args[0];
    request = args[1];
    callback = args[2];
  }

  return { request, context, callback };
}

export type ExternalsOptions =
  | ExternalsOptionsObj
  | externalsOptionsTransform
  | externalsOptionsWhiteList;

export interface ExternalsOptionsObj {
  transform?: externalsOptionsTransform;
  whiteList?: externalsOptionsWhiteList;
}
export type externalsOptionsTransform = string | ((matched: any) => string);
export type externalsOptionsWhiteList = Array<string | RegExp>;

/**
 * add list of items to webpack's externals, using RegExp
 * @method externals
 * @param  list      [description]
 * @param  args       function arguments of config.externals[function(...args){}]; check params(args)
 * @param  options    {transform, whiteList}:
 *  whiteLiat is an array of paths (strings or regex) to be excluded from adding to externals even if matched
 *  transform is a function or string to transform the request; default is `commonjs [request]`
 * @return [description]
 *
 * @example
 * config.externals[function(){ externals(["path",/pathRegex/], arguments) }]
 *
 */
export default function externals(
  list: Array<string | RegExp>,
  args: ExternalsParams,
  options: ExternalsOptions = {}
) {
  let { request, context, callback } = params(args);
  list.forEach(item => {
    //todo: item = 'pattern' | {pattern, ...options}
    //ex: {'^config/(.*).ts', value: 'commonjs [request]/[$1]'}

    if (objectType(options) !== "object") {
      (options as ExternalsOptionsObj) = Array.isArray(
        <ExternalsOptions>options
      )
        ? <ExternalsOptionsObj>{ whiteList: options }
        : <ExternalsOptionsObj>{ transform: options };
    }

    options = options as ExternalsOptionsObj;

    //todo: if(request.match(<options.whiteList>))callback()
    let matched = request.match(toRegExp(item));
    if (matched) {
      //todo: use @engineers/js/aliases to transform module name (ex: "module" -> "commonjs module")
      options.transform = options.transform || `commonjs ${request}`;

      if (typeof options.transform === "function")
        options.transform = options.transform(matched);
      //replace ${vars}; ex: 'commonjs ${request}'
      options.transform = options.transform.replace(/\${(.*)}/g, m => {
        //todo: expose more variables
        let vars = { request, matched: m[1] };
        //@ts-ignore
        return vars[m[1]];
      });

      callback(null, options.transform);
    } else callback();
  });
}

/**
 * add imported package (i.e: doesn't start with ".") to webpack's externals list.
 * execlude node_modules from bundling, use require(package) instead.
 * @method node
 * @param  {[type]} whileList [description]
 * @return {[type]} [description]
 */
export function node(args: ExternalsParams, options?: ExternalsOptions) {
  //doesn't start with ".", ex: ".." and "./"
  let regex = "^(?!.).*";
  return externals([regex], args, options);
}
