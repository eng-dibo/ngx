# @engineers/ngx-content-core

display and manage the content in Angular.

> this package is part of [Angular CMS](https://github.com/eng-dibo/angular-cms) platform.

## install

install the package and it's peer dependencies:

```
npm i @engineers/ngx-content-core
```

## functions & pipes

all the following functions are available as Angular pipes.

- `slug`: converts a text into a url-compitable and SEO-friendly slug.

  `slug(value: string,length = 200,allowedChars = "",encode = true): string`

- `html2text`: converts an html code into a plain text (except the chosen elements).

  `function html2text(value: string, options: Obj = {}): string`

- `length`: truncate a text into the provided length, starting from the provided start.

  `function length(value: string, _length?: number, start = 0): string`

- `summary`: equivalent to txt2html() + length() + nl2br()

  `summary(value: string, lngth = 500, options: Obj = {}): string`

- `nl2br`: converts line breaks such as `\n` and `\r` into `<br />`, to be displayed correctly in the html page.

  `nl2br(value: string): string`

- `content`: adjusts the content:

  - applies nl2br, activates the links.
  - displays social links (facebook, twitter, youtube, ..) as widgets.
  - adds tooltips to hyperlinks, ...
    `content(value: string): string`

- `keepHtml`: bypasses Angular sanitizer and prevents Angular from sanitizing the html value. it injects the html code without sanitizing.

  `keepHtml(value: string, sanitizer?): string`

  example:

  `<div [innerHTML]="htmlContent | keepContent"></div>`

## useful packages by `engineers`

- check out these useful packages that created by engineers
  https://www.npmjs.com/org/engineers?tab=packages

- Angular CMS:

  a CMS platform built with `angular` to be very fast & SEO friendly
  https://github.com/eng-dibo/angular-cms

## contributing

contributing with us are very welcome.

## support us

```

```
