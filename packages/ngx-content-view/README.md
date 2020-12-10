# @engineers/ngx-content-view

pass an article or a post into this component and it will render it to the view.

Demo:
https://www.almogtama3.com

## install

install the package and it's peer dependencies:

```
npm i @engineers/ngx-content-view

npm i @angular/material@9.2.1 ng-lazyload-image@7.1.0 ngx-highlightjs@4.0.2 ngx-quill@8.1.3 @ngx-share/buttons@7.1.4 @fortawesome/angular-fontawesome@0.6.1 @fortawesome/fontawesome-svg-core@1.2.28 @fortawesome/free-brands-svg-icons@5.13.0 @fortawesome/free-solid-svg-icons@5.13.0 ngx-loading@8.0.0
```

usage:

```
<content-view [data]="data" ></content-view>
```

`data` is an object contans the `payload` and optional `tags`.

the `payload` property is of type `Aricle` or `Observable<Aricle>` for async operations, or an array of one of them.

if the payload is an array, the component will display the articles (posts) as a masonry layout.

the `Article` is an object contains the article information, such as title, author, content, keywords, ....

by default, the component will use the article data itself to generate the meta tags (for SEO), but you can override some of it's properties using the property `tags`.

### definitions

```
type Payload = Article | Article[];

interface Data  {
  payload: Payload;
  tags?: MetaTagsك
};

export interface Article  {
  id?: string;
  title?: string;
  subtitle?: string;
  content?: string;
  keywords?: Keywords[];
  cover?: {
    src?: string;
    srcset?: string;
    sizes?: string;
    alt?: string;
    lazy?: boolean;
    placeholder?: string;
    width?: number;
    height?: number;
  };
  author?: { name?: string; img?: string; link?: string };
  link?: string;
  categories?: string[];
  createdAt: string;
  updatedAt: string;

}

export interface Keywords {
  text: string;
  count?: number | string;
  link?: string;
  target?: string;
}
```

# MetaService

see @engineers/ngx-tools

you can use MetaService to easly add or modify the meta tags.
to use it add it to `providers[]` in your module.

methods:

```
setTags(tags: Meta = {})
updateTags(tags: Meta)
prepare(key: string, value: any)
filter(tags)
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
