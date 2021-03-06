# todo:

- move cms/projects/tsconfig.app to browser/tsconfig
- create a shared resources folder in the project's root contains:

  - the shared assets
  - basic settings for webpack, ... which can be extended by projects

  -> to use the shared resources, add it to angular.json/assets[]

- tsconfig & webpack.config:

- ~~ = workspace's root
- ~ = project's root

- [cms] copy config/firebase.json to dist/\*

- ts: enable all strict flags, replace all 'any' types, remove '@ts-ignore', '@ts-nocheck'

- [cms] config/ -> config.ts export {firebase, meta, ...}
  metaTags() -> convert to object meta{}

- [cms] reolace import "_/packages/_" with "@engineers/\*"

- [cms] config/tsconfig use 'module.exports' in the output, instead of 'exports.\*'.
  same as webpack.output.libraryTarget="commonjs2"

# issue:

- [dist/cms/server/express] convert ~cofig/\* to ../config/\*
  https://stackoverflow.com/q/65020011/12577650
  https://github.com/microsoft/TypeScript/issues/41782

test: [projects/cms] > tsc -p tsconfig.app.json (output=dist/app)

related topics:
https://github.com/microsoft/TypeScript/issues/10866
https://www.npmjs.com/package/module-alias
https://npmjs.com/package/@momothepug/tsmodule-alias#nodejs--typescript-problem-background
https://www.npmjs.com/package/tspath

solutions:

- webpack plugin or cli tool to modify alias paths
  https://stackoverflow.com/questions/65160997/convert-alias-paths-back-to-real-paths-in-tsconfig-and-webpack
- temporary use relative paths instead of alias for excluded paths
  (i.e: webpack.execludes[])

- [cms] webpack
  https://stackoverflow.com/q/65171607/12577650
  https://github.com/webpack/webpack/issues/7357

# notes

- current dir:

  - path.dirname(process['mainModule'].filename)

  - \_\_dirname

- commit title:
  [target] {flag} title
  - target = [projectName] or [pkg: packageName]
  - flag = {server} {browser} {minor} {tmp}
    - minor: minor changes (ex: fix typo)
    - tmp: temporary change or disable feature, must be re-enabled later
      (ex: temporary disable a strict flag in tsconfig.json)
