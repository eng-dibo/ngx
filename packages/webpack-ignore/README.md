# @engineers/webpack-ignore

a webpack plugin to ignore specific warning and error messages.

## install

install the package and it's peer dependencies:

```
npm i @engineers/webpack-ignore

```

## usage

for example, if you want to ignore messages that includes 'was not found',
just add this plugin to webpack config plugin array.

you can ignore only error or warning messages, or both of them by providing `levels`

```
const IgnoreWarningPlugin = require("@engineers/webpack-ignore");

let levels = ["warnings", "errors"]
let message = /was not found in/

{
  plugins: [
       new IgnoreWarningPlugin(message, levels)
  ]
}
```

also this package supports some known cases, such as 'export not found' issue
https://github.com/webpack/webpack/issues/7378

in this case use `IgnoreNotFoundExportPlugin` plugin, and you don't need to
specify a message.

```
const IgnoreNotFoundExportPlugin = require("@engineers/webpack-ignore/export-not-found");

{
  plugins: [
       new IgnoreNotFoundExportPlugin()
  ]
}
```
