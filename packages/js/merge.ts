//todo: use @engineers/*
import { objectType, cleanObject } from "../nodejs/objects";

export type Strategy = "replace" | "push" | "unshift";
export interface MergeOptions {
  //push & unshift have the same effect for objects
  strategy?: Strategy;
}

export interface DeepMergeOptions extends MergeOptions {
  //level=0: unlimited deep level.
  level?: number;
}

/**
 * merges two or more elements.
 * the first element is the main destination,
 * the seconed one is merged into it, then the third one, etc.
 * the result element type is based on the main destination type,
 * the main destination may be of any type (object, array, string, ...)
 * @method merge
 * @param  obj      [description]
 * @param  strategy [description]
 * @return [description]
 */
//todo: implement this function
export function merge(elements: Array<any>, options: MergeOptions = {}) {}

/**
 *  performs a deep merge, same strategy as merge()
 *  to make keep objects immutable, use deepMerge([{}, ...elements])
 * @method deepMerge
 * @return [description]
 */
//todo: check: https://lodash.com/docs/4.17.15#merge
//todo: add more types (Set, DomNode,...)
//todo: https://stackoverflow.com/questions/27936772/how-to-deep-merge-instead-of-shallow-merge/34749873
//todo: return type of elements[0]; deepMerge<T>(elements:Array<T,...any>):T{}
//https://stackoverflow.com/questions/44402096/in-typescript-define-a-type-for-an-array-where-the-first-element-is-more-specif
export function deepMerge(
  elements: Array<any>,
  options: MergeOptions = {}
): any {
  let defaultOptions = {
    strategy: "push",
    level: 0
  };
  //make 'options' imutable
  let opts = Object.assign({}, options, defaultOptions),
    result = elements.shift(),
    type = objectType(result);

  elements.forEach(el => {
    if (objectType(el) === type) {
      if (type === "object") {
        //ex: deepMerge([{k:{a:1}}, {k:{b:1}}]) -> {k:{a:1,b:1}}
        el = cleanObject(el);
        for (let k in el) {
          if (
            !(
              objectType(result[k]) === "object" &&
              objectType(el[k]) === "object"
            ) ||
            opts.strategy === "replace" ||
            !(k in result)
          )
            result[k] = el[k];
          else result[k] = deepMerge([result[k], el[k]], opts);
        }
      } else if (type === "array") {
        //ex: deepMerge([1,2], [3,4]) -> [1,2,3,4] | [3,4,1,2]
        result[<Strategy>opts.strategy](...el);
      } else if (type === "string") {
        //ex: deepMerge(["ab", "cd"]) -> "abcd" | "cdab"
        result = opts.strategy === "unshift" ? el + result : result + el;
      }
    } else {
      //ex: merge([{x:1}, y]) -> {x:1, y:true}
      //ex: merge([ [1,2], 3 ]) -> [1,2,3]  (i.e: Array.push())
      //if(opts.strict): error
      //todo:
    }
  });

  return result;
}
