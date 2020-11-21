# @engineers/nodejs-tools

useful tools for nodejs.

## install

install the package and it's peer dependencies:

```
npm i @engineers/nodejs

```

## fs & fsSync

same as node ('fs/promises' or 'fs') and 'path' with extra features.
most of these function returns a promise, and every one has a sync version of it.
for example:

```
let file = 'file/to/file.txt';

write(file, 'hello world')
 .then(()=>getSize(file))
 .then(size=>console.log(size))

 //sync version
 writeSync('file/to/file.txt', 'hello world');
 let size = getSizeSync(file);
 console.log(size);
```

retrieve a content from the cache

```
//cache(files: string | string[], data?,expire = 0,maxAge = 0,type?,allowEmpty = false): Promise<any>

//get the content from 'cacheFile.tmp', if the file cache expired (i.e it's created time is older than 3 hours) it will refresh the cache by running `getData()`.
//getData() may return almost any type including a promise.
cache('cacheFile.tmp', ()=>getData('/api/example'), 3);

//force refresh the cache.
cache('cacheFile.tmp', ()=>getData(..), -1);

//force get the data from the cache file (don't refresh it)
cache('cacheFile.tmp', ()=>getData(..), 0);

//get the content from the first valid cache file in the list.
cache(['cache1.tmp', 'cache2.tmp', 'cache3.tmp'], ()=>getData(..), 3)

//if all cache files in the list are expired, and refreshing the data is failed (for example, due to network failure) it will try to get the content from the first cache file in the list that fulfills the `maxAge`.

cache('cacheFile.tmp', ()=>getData('/error'), [3, 24]);

//purge the cache
cache('cacheFile.tmp',':purge:')

```

resolve a path: join it's parts and then normalize it.

```
//resolve(...paths: PathLike[]): string
```

analyze a path & get it's parts.

```
parsePath('path/to/file.txt');

//returns: {type: 'file', dir:'path/to', file:'file.txt', extension:'.txt'}
```

get file's information

```
getExtention('path/to/file.txt'); //.txt

getSize('path/to/file.txt'); //1024 bytes
getSize('path/to/file.txt','kb'); //1 kb

isDir('path/to/file.txt'); //false

getMtime('path/to/file.txt');

move('path/to/file.txt', 'new/path/file2.txt');

//delete files or folders recursively
remove('path/to/file.txt');
remove('path/to/dir');

//you don't have to stringify arrays and objects.
write('path/to/file.json', {ok: true});
read('path/to/file.json').then(content => console.log(content));


//creates a dir and (all it's parent dirs) if it doesn't not exist.
//it will automatically creats 'path', 'path/to', 'path/to/dir'
//and it will not fail in case of the dir already exist.
mkdir('path/to/dir');

```

## objects

```
isNumber(123); //true

isIterable([1,2,3]); //true

isPromise(new Promise(..)); //true

objectType(123); //number
objectType('abc'); //string
objectType(function(){}); //function
objectType({x: 1}); //object
...

isEmpty(null); //true
isEmpty(undefined); //true
isEmpty([]); //true
isEmpty({}); //true

merge({x:1, y:2}, {y:3, z:4}, 'a'); //{x:1, y:3, z:4, a:true}
merge([1,2], [3,4], 5) //[1, 2, 3, 4, 5]
merge(classA, classB, function method1(){}); //merge classses as if classA xtends classB, and add method1 to it.


inArray(1, [1, 2, 3]); //true
inArray("A", ["a", "b"]); //true
inArray("A", ["a", "b"], true); //false

//divide an array into chunks.
arrayChunk(range(1, 10), 2); //[ [1,2], [3,4], [5,6], ... [9,10] ]
arrayChunk(range(1, 10), 5); //[ [1,2,3,4,5], [6,7,8,9,10] ]


replaceAll('aa.bb.cc','.','-'); //'aa-bb-cc'
replaceAll('aa.bb.cc',/\./,'-'); //'aa-bb-cc'

//asynchronously replace part of a string
//replaceAsync(str, regex, replacer)
replaceAsync('replace this content asynchronously',/content/,()=>getDataPromise('/api/content'));

```

## timer

measure the execution's duration.

```
import {setTimer, getTimer, endTimer} from '@engineers/nodejs-tools/timer';

function getData(apiUrl){
  setTimer('getData');

  doSomething();

  //get the duration between the previous `setTimer('getData')` or `getTimer('getData')`.
  console.log(`something done in ${getTime('getData')}`); //+1.2s

  doAnotherSomething();
  console.log(`another something done in ${endTimer('getData')}`); //+0.5s

}


```

## utils

import {log} from '@engineers/nodejs-tools/utils';

log some data to the console using the inspector.

```
let data = { x: ["a", "b", "c"]};

//normal log
console.log(data); //{x: [Array]}

//utils logger
log(data); //{ x: ["a", "b", "c"]};
log(data, "error");
```

## useful packages by `engineers`

- check out these useful packages that created by engineers
  https://www.npmjs.com/org/engineers?tab=packages

- Angular CMS:

  a CMS platform built with `angular` to be very fast & SEO friendly
  https://github.com/eng-dibo/angular-cms

## contributing

contributing with us are very welcome.

## support us
