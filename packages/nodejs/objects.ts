import { setTimer, endTimer, getTimer } from './timer';

export interface Obj {
  [key: string]: any;
}

const dev = process.env.NODE_ENV === 'development';

export function isNumber(value: any) {
  // isNumber() anly accepts numbers or NaN value https://stackoverflow.com/a/42121162/12577650
  return !isNaN(Number(value));
}

export function isIterable(obj: any): boolean {
  return (
    obj &&
    (obj instanceof Array ||
      (typeof obj != 'string' && typeof obj[Symbol.iterator] == 'function'))
    // todo: or obj={...}
  );
}

export function isPromise(obj: any): boolean {
  return obj instanceof Promise || (obj && typeof obj.then == 'function');
}

/**
 * return the object type. i.e: string, array, number, ...
 * @examples examples:
 *  {} => object
 *  [] => array
 *  null => null
 *  function(){} => function
 *  1 => number
 *  "x", 'x', `x` => string
 * @method objectType
 * @param  obj        [description]
 * @return [description]
 */

export function objectType(obj: any): string {
  return Object.prototype.toString
    .call(obj)
    .replace('[object ', '')
    .replace(']', '')
    .toLowerCase();
}

export function isEmpty(obj: any): boolean {
  return typeof obj == 'undefined' || inArray(obj, ['', null, [], {}]);
}

export function merge(target: any, ...obj: any[]): any {
  // merge objects,arrays,classes (must besame type) ;
  // don't use "arguments" in an arrow functions, also don't use 'this' inside a normal function, so we declare a new variable = arguments
  const _arg = arguments; // the arguments of merge() not run()

  const type = objectType(target); // todo: error: Cannot read property 'objectType' of undefined
  for (let i = 1; i < _arg.length; i++) {
    if (objectType(_arg[i]) !== type) {
      return target;
    }
  }
  if (type == 'array') {
    target = target.concat(...obj);
  } else if (type == 'object') {
    // target=Object.assign(target,...obj) //later objects dosen't override previous ones
    for (let i = 1; i < _arg.length; i++) {
      for (const p in _arg[i]) {
        target[p] = _arg[i][p]; // to override current values
      }
    }
  } else if (type == 'class') {
    // add or override target's methods & properties
  }

  return target;
}

// ------------- Arrays ------------------- //

/**
 * check if the array includes the element
 * @method inArray
 * @param  element        the element that you want to search for
 * @param  array       [description]
 * @param  caseSensitive applies only if the element is string
 * @return boolean
 *
 * todo: rename to in(element,container ) or exists()
 * todo: add more container types (class,. ...)
 * todo: inArray(element: string|RegEx, ["string",/RegEx/])
 */
export function inArray(
  element: any,
  array: Array<any> | object | string,
  caseSensitive?: boolean // case sensitive
): boolean {
  if (element instanceof Array) {
    for (let i = 0; i < element.length; i++) {
      if (inArray(element[i], array, caseSensitive)) { return true; }
    }
    return false;
  }

  if (element instanceof RegExp) {
    if (typeof array === 'string') { return element.test(array); }
    else if (array instanceof Array) {
      for (let i = 0; i < array.length; i++) {
        if (inArray(element, array[i])) { return true; }
      }
      return false;
    } // todo: else if(objectTybe==="object")
  }
  if (!caseSensitive && typeof element === 'string') {
    element = element.toLowerCase();
  }
  if (typeof array == 'string') { return array.indexOf(element) > -1; }
  // !! to convert number to boolean
  else if (array instanceof Array) { return array.includes(element); }
  else if (isIterable(array)) {
    for (let i = 0; i < (array as Array<any>).length; i++) {
      return (
        array[i as keyof typeof array] == element ||
        (!caseSensitive &&
          typeof array[i as keyof typeof array] == 'string' &&
          (array[i as keyof typeof array] as string).toLowerCase() == element)
      );
    }
  }
  // todo: use objectTyoe(array)
  else if (typeof array == 'object') {
    return element in array;
  }

  // todo: throw exception
  return false;
}

/**
 * divide Array into chuncks
 * @method chunk
 * @param  arr       [description]
 * @param  chunkSize [description]
 * @return [description]
 */

export function arrayChunk(arr: Array<any>, chunkSize: number) {
  const result = [];
  for (let i = 0; i < arr.length; i += chunkSize) {
    result.push(arr.slice(i, i + chunkSize));
  }
  return result;
}
// ------------- /Arrays ------------------- //

// ------------- Strings ------------------- //
/**
 * str.replace() only replaces the first occurence, this function replaces all occurances.
 * @method replaceAll
 * @param  str        [description]
 * @param  replace    [description]
 * @param  with       [description]
 * @return [description]
 */
export function replaceAll(
  str: string,
  replace: string | RegExp,
  replaceWith: string
): string {
  replace = new RegExp(replace, 'g');
  return str.replace(replace as RegExp, replaceWith); // faster than str.split().join() https://jsperf.com/replace-all-vs-split-join
  // return str.split(replace).join(with)
}

/**
 * asynchronously replace part of a string
 * @method replaceAsync
 * @param  {string}     str      [description]
 * @param  {regular expression}     regex    [description]
 * @param  {[type]}     replacer a function that returns a promise
 * @return {str}
 */
/*
 https://github.com/RSamaium/async-replace

todo:
 - regex = Regex | string
 - replacer: any (string | fn:()=>any | async fn | promise | any athor type (cust to string))
   ex: replacer may be a promise or a function that returns a promise
 */
export function replaceAsync(str: string, regex: RegExp, replacer: any) {
  setTimer('replaceAsync');
  const matched = str.match(regex);
  if (!matched) { return Promise.resolve(str); }
  if (!regex.global) {
    return replacer(...matched).then((newStr: any) =>
      str.replace(regex, newStr)
    );
  }

  // if regex.global (i.e: /regex/g) we need to recursively apply the replacement
  let i = 0;
  let index = 0;
  const result: string[] = [];
  const copy = new RegExp(regex.source, regex.flags.replace('g', ''));
  const callbacks: any = [];

  while (matched.length > 0) {
    const substr: string = matched.shift() || ''; // remove the first element and return it
    const nextIndex = str.indexOf(substr, index); // position of substr after the current index
    result[i] = str.slice(index, nextIndex);
    i++;
    const j = i;
    callbacks.push(
      replacer(...(substr.match(copy) || []), nextIndex, str).then(
        (newStr: any) => {
          result[j] = newStr;
        }
      )
    );
    index = nextIndex + substr.length;
    i++;
  }
  result[i] = str.slice(index);
  return Promise.all(callbacks).then(() => {
    if (dev) {
      console.log('replaceAsync', endTimer('replaceAsync'), { str, regex });
    }
    return result.join('');
  });
}

/**
 * detect and replace circular references with a path reference
 * ex: x= {a:x, b:{k:x}, c:{k:b}} -> {a:':this:', b:{k: ':this:'}, c:{k:':this.b:'}}
 * @method removeCircular
 * @param  object         [description]
 * @return [description]
 */
export function cleanObject(object: any) {
  if (objectType(object === 'object')) {
    // todo: https://stackoverflow.com/questions/7582001/is-there-a-way-to-test-circular-reference-in-javascript/7583161#7583161
  }
  return object;
}

/* todo:
export interface String {
  replaceAll(
    str: string,
    replace: string | RegExp,
    replaceWith: string
  ): string;
}
String.prototype.replaceAll = replaceAll;

or proto('method')=> string.prototype...
*/
// ------------- /Strings ------------------- //
