import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

// todo: do we need to make this class as a service, or just a function?
// don't forget to add this service to ngModule.provide[]
@Injectable()
export class NgxToolsLoadService {
  constructor(@Inject(DOCUMENT) private document: any) {}

  load(
    src: any,
    type = 'script',
    attributes: { [key: string]: any } = {},
    cb?: (type: 'loaded' | 'ready' | 'error') => void,
    parent?: any // todo: HtmlElement
  ) {
    // tmp: for index.html
    // if (!cb) cb = ev => console.log("[load]", ev, src);

    if (type === 'css') {
      type = 'link';
      attributes.rel = 'stylesheet';
      attributes.type = 'text/css';
    }

    if (type === 'link') {
      attributes.href = src;
      attributes.crossorigin = true; // https://developer.mozilla.org/en-US/docs/Web/HTML/Preloading_content#Cross-origin_fetches
    } else if (type === 'script' || type === 'module') {
      attributes.src = src;
      attributes.type = type === 'script' ? 'text/javascript' : type;
    }

    if (!('async' in attributes)) { attributes.async = true; }

    const el = this.document.createElement(type === 'link' ? 'link' : 'script');
    for (const key in attributes) {
      el.setAttribute(key, attributes[key]);
    }

    if (cb) {
      // or return a promise -> new Promise(resolve=>{el.onLoad=resolve})
      el.addEventListener('load', () => cb('loaded'));
      el.addEventListener('readystatechange', () => cb('ready'));
      el.addEventListener('error', () => cb('error'));
    }

    (parent || this.document.getElementsByTagName('head')[0]).appendChild(el);
  }

  adsense(
    id: string,
    cb?: (type: string) => void,
    attributes: { [key: string]: any } = {},
    src?: string
  ) {
    attributes['data-ad-client'] = id;
    return this.load(
      src || '//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js',
      'script',
      attributes,
      cb
    );
  }
}
