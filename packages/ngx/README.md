# @engineers/ngx

useful tools for Angular.

- dynamically inject a component into the DOM.
- dynamically load resources (js, css, images, ...).
- manage meta tags.
- manage routes.
- rxjs.

## install

install the package and it's peer dependencies:

```
npm i @engineers/ngx
```

## examples

dynamically inject a component into the DOM.

```
//app.module.ts:
import { DynamicLoadService } from '@engineers/ngx/dynamic-load.service';

@NgModule{
  providers: [DynamicLoadService]
}



//component.ts
import { DynamicLoadService } from '@engineers/ngx/dynamic-load.service';


@Component({
  selector: "dynamic-load",
  template: `
    <ng-template #ref> </ng-template>
  `
})
export class ExampleComponent{
  //get a reference to the element which we want to inject our component into it.
  @ViewChild("ref", { read: ViewContainerRef, static: true })
  ref: ViewContainerRef;

  constructor(private dynamic: DynamicLoadService) {}

    ngOnInit() {
      this.dynamic.load(MyComponent, this.ref);

     //you can pass any rbitrary data to the injected component
     //this.dynamic.load(MyComponent, this.ref, { example: true });
    }
}


@Component({
  selector: "content",
  template:`<div>this html code will be dynamically injected into the component dynamic-load</div>`
  })
 export class MyComponent{}
```

dynamically load resources (js, css, images, ...)

```
//don't forget to add the service to @NgModule.providers[]
import { NgxToolsLoadService } from '@engineers/ngx/load-scripts.service';

@Component({ ... })
export class ExampleComponent{
 constructor(private loadScripts: NgxToolsLoadService){

   //load a js script and inject it into <head>
   loadScripts.load('script.js')

   //add attributes
   loadScripts.load('script.js',{ id: 'main-script' })

   //callbacks
   //type: loaded, ready, error
   loadScripts.load('scripts.js', {}, type=>console.log(type))

   //load a css file
   loadScripts.load('style.css')
 }
}

```

manage meta tags.

```
//add the service to @NgModule.providers[]
import { MetaService } from '@engineers/ngx/load-scripts.service';

@Component({ ... })
export class ExampleComponent{
 constructor(private meta: MetaService){}

   ngOninit(){
     this.meta.setTags({
       title: "page title",
       description: "...",
       url: 'canonical link',
       ....
       })
   }
}
```

```

export interface Meta {
  image?: string | Image;
  title?: string;
  name?: string;
  description?: string;
  baseUrl?: string;
  url?: string;
  fb_app?: string;
  apps?: {
    iphone: App;
    googleplay: App;
    ipad: App;
  };
  twitter?: {
    //https://developer.twitter.com/en/docs/tweets/optimize-with-cards/overview/markup
    card?: string;
    site?: string;
    "site:id"?: string;
    creator?: string;
    "creator:id"?: string;
    description?: string; //max: 200 chars
    title?: string;
    image?: string;
    "image:alt"?: string;
    player?: string;
    "player:width"?: string;
    "player:height"?: string;
    "player:stream"?: string;
    "app:name:iphone"?: string;
    "app:id:iphone"?: string;
    "app:url:iphone"?: string;
    "app:name:googleplay"?: string;
    "app:id:googleplay"?: string;
    "app:url:googleplay"?: string;
    "app:name:ipad"?: string;
    "app:id:ipad"?: string;
    "app:url:ipad"?: string;
  };

}

 interface App {
  id?: string;
  name?: string;
  url?: string;
}

 interface Image {
  src?: string;
  alt?: string;
  width?: number | string;
  height?: number | string;
}

```

manage routes.

```
//subscribe to any changes in either url params or url queries.
//this method emits a value each time a change occurred in params or queries.

import { urlParams } from '@engineers/ngx/routes';

...
ngOnInit(){
  urlParams().subscribe(([params, queries])=>{
    //url:   /:type?x=1
    let type = params.get('type'),
        x = queries.get('x')
    })
}

```

rxjs.

```

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

```

```
