# todo:

- move cms/projects/tsconfig.app to browser/tsconfig
- create a shared resources folder in the project's root contains:

  - the shared assets
  - basic settings for webpack, ... which can be extended by projects

  -> to use the shared resources, add it to angular.json/assets[]

- tsconfig & webpack.config:

 - ~~ = workspace's root
 - ~ = project's root


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


# notes
current dir:
- path.dirname(process['mainModule'].filename)
- __dirname
