// todo: use @engineers (@engineers/js/regex)
import { toRegExp } from '../js/regex';
import { objectType, inArray } from '../nodejs/objects';

export type ExternalsParams = IArguments;

/**
 * function arguments of config.externals[function(...args){}]
 * @method params
 * @param  args   [description]
 * @return [description]
 */
export function params(args: ExternalsParams) {
  let request: string,
    context: any,
    callback: any,
    contextInfo: any,
    getResolve: any;

  if (args[0].context) {
    // webpack 5
    context = args[0].context;
    request = args[0].request;
    contextInfo = args[0].contextInfo;
    getResolve = args[0].getResolve;
    callback = args[1];
  } else {
    // webpack 4
    context = args[0];
    request = args[1];
    callback = args[2];
  }

  return { request, context, callback, contextInfo, getResolve };
}

export type ExternalsOptions =
  | ExternalsOptionsObj
  | externalsOptionsTransform
  | externalsOptionsWhiteList;

export interface ExternalsOptionsObj {
  transform?: externalsOptionsTransform;
  whiteList?: externalsOptionsWhiteList;
  // sources: a list of locations to get the packagesList,
  // or an array of packagesList
  // if provided and not empty, it will only include the `request` in `webpack.externals[]` if it exists in packagesList[]
  // ex: sources= ["./package.json:dependencies,devDependencies", "./node_modules", "./arrayOfPackageNames", "./ObjectOfPackageNamesAndVersions", "./ObjectOfPackageNamesAndVersions:key1,key2", "./stringList:,"  ["pkg1", "pkg1"], {"pkg1":"1.0", "pkg2":"1.0"}]
  // if the object is a file it will load it's content
  // if it is an object it will use the 'keys' flag (i.e: ':key' or ':key1,key2');
  // by default it uses keys of package.json ':/(dev|peer|optional)?dependencies/'
  // if the file contains a string content, or a string provided with a key flag, it uses it as a delemeter
  sources?: Array<string | Array<string> | { [key: string]: string }>;
  log?: boolean;
}
export type externalsOptionsTransform =
  | string
  | ((
      request: string,
      context: any,
      contextInfo: any,
      getResolve: any
    ) => string);
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
  const { request, context, callback, contextInfo, getResolve } = params(args);
  // prevent options from mutation
  let opts: ExternalsOptionsObj;

  if (objectType(options) === 'object') {
    opts = Object.assign({ log: true }, options);
  }
  else {
    // adjust options: convert to {}
    opts = Array.isArray(options)
      ? { whiteList: options } as ExternalsOptionsObj
      : { transform: options } as ExternalsOptionsObj;

    opts.log = true;
  }

  // if any of whiteList[] matched 'request', just return
  if (inArray(opts.whiteList || [], [request])) {
    if (opts.log) { console.log(`\n[webpack externals]: whiteListed: ${request}`); }
    return callback();
  }

  for (let i = 0; i < list.length; i++) {
    const item = list[0];
    // todo: item = 'pattern' | {pattern, ...options}
    // ex: {'^config/(.*).ts', value: 'commonjs [request]/[$1]'}

    if (toRegExp(item).test(request)) {
      // create sources[] (packagesList)
      const sources: Array<string> = [];
      if (Array.isArray(opts.sources) && opts.sources.length > 0) {
        // todo: parse (flatten) sources
      }
      // if 'request' doesn't included in 'sources[]' don't add it to externals[] even if it matched
      if (sources.length > 0 && !inArray(request, sources)) { return callback(); }

      // todo: use @engineers/js/aliases to transform module name (ex: "module" -> "commonjs module")
      opts.transform = opts.transform || `commonjs2 ${request}`;
      if (typeof opts.transform === 'function') {
        opts.transform = opts.transform(
          request,
          context,
          contextInfo,
          getResolve
        );
      }

      // replace ${vars}; ex: 'commonjs ${request}'
      // todo: support multiple groups: ex: "commonjs ${var1} - ${var2}"
      opts.transform = opts.transform.replace(
        /\${(.*)}/g,
        (...matched: any[]): string => {
          // todo: expose more variables (ex: context{}, matches[])
          // todo: support obj.* syntax ex: "commonjs ${var.property}"
          // todo: support js ex: "commonjs ${var.replace('x','y')}"
          const vars = { request };
          // @ts-ignore
          return vars[matched[1]];
        }
      );
      if (opts.log) {
        console.log(
          `\n[webpack externals]: ${request} -> ${opts.transform}\n matched: ${item}`
        );
      }

      return callback(null, opts.transform);
    }
  }

  // if 'request' doesn't match any item in list[], just call callback()
  callback();
}

/**
 * add imported package (i.e: doesn't start with ".") to webpack's externals list.
 * execlude node_modules from bundling, use require(package) instead.
 * @method node
 * @param  {[type]} whileList [description]
 * @return {[type]} [description]
 */
export function node(args: ExternalsParams, options?: ExternalsOptions) {
  const list = [
    // match request that doesn't start with ".", ex: ".." and "./"
    // but not an absolute path (ex: D:/path in windows or /path in linux)
    /*
   pattern:
    ^ starts with
    (?!  negative lookahead i.e: "^(?!\.).*"
    . | \/ | \\ | .+?:  dosen't start with any of these characters
                        .+?: matches D:/
    */
    /^(?!\.|\/|\\|.+?:).*/,
    // a path to node_modules/
    /^.*?\/node_modules\//
  ];
  return externals(list, args, options);
}
