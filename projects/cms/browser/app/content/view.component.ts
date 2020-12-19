/**
get type from params (articles or jobs), and then retrive data$ from the server,
then display it in the browser
/*
todo:
 - if(!job.open | article.expire)show warning & disable apply btn (for jobs)
 - if(job) add fields (ex: contacts, salary, ..), add apply btn
 - add copy btn to each post
 - add copy-all btn to inde (or category) page (*ngIf=data.type=list){show ctg.title; add copy-all btn}
 */

import { Article, Payload, Keywords, Tags } from "@engineers/ngx-content-view";
import { MetaService } from "@engineers/ngx/meta.service";
import { slug } from "@engineers/ngx-content-core";
import { metaTags as _defaultMetaTags, ADSENSE } from "~config/browser";
import { replaceAll } from "@engineers/nodejs/objects";

import {
  Component,
  OnInit,
  AfterViewInit,
  ElementRef,
  ViewChild
} from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { HttpService } from "~browser/http.service";
import { Observable } from "rxjs";
import { map, concatMap } from "rxjs/operators";
import { HighlightJS } from "ngx-highlightjs";
import env from "~config/env";
import { summary } from "@engineers/ngx-content-core/functions";
import { urlParams } from "@engineers/ngx/routes";
import { NgxToolsLoadService } from "@engineers/ngx/load-scripts.service";

//todo: import module & interfaces from packages/content/ngx-content-view/index.ts

export interface Obj {
  [key: string]: any;
}

export interface Params extends Obj {
  category: string | null;
  id?: string | null;
  //pass ?refresh=auth to forece refreshing the cache
  //get admin auth from ~config/server,
  //or get an auth code for each user from db
  refresh?: string | null;
  type?: string;
}

//todo: defaultMetaTags(): Tags{}
function defaultMetaTags(type: string = "articles") {
  let defaultTags = _defaultMetaTags();
  defaultTags.link += type;
  return defaultTags;
}

@Component({
  selector: "content-view",
  templateUrl: "./view.component.html",
  styleUrls: ["./view.component.scss"]
})
export class ContentViewComponent implements OnInit, AfterViewInit {
  @ViewChild("quillView") quillView: any;
  data$!: Observable<Payload>;
  tags!: Tags;
  pref = { layout: "grid" };
  //use the definite assignment assertion "!" when tsconfig.strictPropertyInitialization
  //if a property in the constructor() will be assigned to a value later (i.e outside of the constructor)
  //https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-7.html#strict-class-initialization
  params!: Params;
  dev = env.mode === "dev"; //to disable adsense in dev mode

  //todo: share adsense by changeing this value based on the article's author
  //to totally remove the adsense code in dev mode, use: <ngx-adsense *ngIf="!dev">
  adsense = ADSENSE;
  constructor(
    private route: ActivatedRoute,
    private httpService: HttpService,
    private meta: MetaService,
    private hljs: HighlightJS,
    private elementRef: ElementRef, //a reference to this component
    private loadService: NgxToolsLoadService
  ) {}

  ngOnInit() {
    this.data$ = urlParams(this.route).pipe(
      map(([params, query]) => this.getParams(params, query)),
      //we use concatMap here instead of map because it immits Observable (this.getData())
      // so we flatten the inner Obs. i.e: it subscribes to the inner Obs. (this.getData) instead of the outer one (urlParams())
      //also we use concatMap and not mergeMap, to wait until the previous Obs. to be completed.
      concatMap(params => this.getData()),
      map(data => {
        if (typeof data === "string") data = JSON.parse(data); //ex: the url fetched via a ServiceWorker

        if (data instanceof Array) {
          <Article[]>data.map((item: Article) => this.adjustArticle(item));
        } else if (!data.error) data = this.adjustArticle(<Article>data);

        let metaTags;
        if (!(data instanceof Array)) {
          let defaultTags = defaultMetaTags(this.params.type);

          if (data.keywords && defaultTags.baseUrl)
            data.keywords = this.adjustKeywords(data.keywords, defaultTags);

          metaTags = {
            ...defaultTags,
            ...data,
            author: data?.author?.name,
            //todo: | data.summary
            description: data?.content,
            image: data?.cover || defaultTags?.image
            //todo: pass twitter:creator, twitter:creator:id
            //todo: expires
          };
        }
        //todo: page link, title
        else metaTags = defaultMetaTags(this.params.type);
        /*
        todo:

        delete tags.id;
        delete tags.slug;
        delete tags.cover;
        delete tags.content;
        delete tags.summary;
        delete tags.sources; //todo: display resources
        delete tags.path; //todo: display path, ex: news/politics
        //delete tags.createdAt;
        //delete tags.updatedAt; -> last-modified
         */

        //todo: if(jobs)description=..
        if (!("cover" in metaTags) && this.params.type == "jobs")
          metaTags.image = {
            src: "/assets/site-image/jobs.webp"
            //todo: width, height
          };

        this.tags = metaTags;
        return data;
      })
    );

    //this.data$.subscribe(x => console.log("this.data:", x));
  }
  ngAfterViewInit() {
    //or this.hljs.initHighlighting().subscribe(); Applies highlighting to all <pre><code>..</code></pre> blocks on a page.
    //don't use document.querySelectorAll(..), it will search over all elements even those outside this component
    if (this.elementRef)
      this.elementRef.nativeElement
        .querySelectorAll("pre.ql-syntax")
        .forEach((item: any) => {
          this.hljs.highlightBlock(item).subscribe();
        });

    /*  document.querySelectorAll("pre.ql-syntax").forEach((item: any) => {
      this.hljs.highlightBlock(item).subscribe();
    });
*/
    if (this.quillView)
      this.quillView.nativeElement
        .querySelectorAll("pre.ql-syntax")
        .forEach((item: any) => {
          this.hljs.highlightBlock(item).subscribe();
        });

    let comp = this.elementRef.nativeElement;
    if (this.dev)
      console.log("selector", {
        "pre.ql-syntax": comp.querySelectorAll("pre.ql-syntax"),
        pre: comp.querySelectorAll("pre"),
        ".ql-syntax": comp.querySelectorAll(".ql-syntax"),
        "quill-editor": comp.querySelectorAll("quill-editor"),
        p: comp.querySelectorAll("p"),
        html: comp.querySelectorAll("html")
      });

    //adsense
    //todo: adsense profit sharing
    this.loadService.adsense(this.adsense, type => {
      /*if (this.dev)*/ console.log(`[adsense] ${type} ${this.adsense}`);
    });
  }
  getData(): Observable<Payload> {
    //todo: ?docs="_id title subtitle slug summary author cover categories updatedAt"
    return this.httpService.get<Payload>(this.params, {
      limit: 20
    });
  }

  adjustArticle(item: Article, type: "item" | "list" = "item"): Article {
    item.id = item._id;
    item.summary = item.summary || summary(item.content);
    if (!item.slug || item.slug == "") item.slug = slug(item.title);
    if (item.cover) {
      //if the layout changed, change the attribute sizes, for example if a side menue added.
      //todo: i<originalSize/250
      let src = `/api/v1/image/${this.params.type}-cover-${item._id}/${item.slug}.webp`,
        srcset = "",
        sizes =
          "(max-width: 1000px) 334px, (max-width: 800px) 400px,(max-width: 550px) 550px";
      for (let i = 1; i < 10; i++) {
        srcset += `${src}?size=${i * 250} ${i * 250}w, `;
      }

      item.cover = {
        src,
        srcset,
        sizes,
        alt: item.title,
        lazy: true,
        //use same colors as website theme (i.e: toolbar backgroundColor & textColor)
        //don't use dinamic size i.e: placeholder.com/OriginalWidthXOriginalHeight, because this image will be cashed via ngsw
        //todo: width:originalSize.width, height:..
        placeholder:
          "//via.placeholder.com/500x250.webp/1976d2/FFFFFF?text=loading..."
      };
    }

    //todo: this needs to add 'categories' getData()
    //todo: get category.slug
    if (!item.link)
      item.link =
        `/${this.params.type}/` +
        (item.categories && item.categories.length > 0
          ? `${item.categories[0]}/${item.slug}@${item.id}`
          : `item/${item.id}`);

    item.author = {
      name: "author name",
      img: "assets/avatar-female.png",
      link: ""
    };

    if (type === "item" && this.params.type == "jobs")
      item.content += `<div id='contacts'>${item.contacts}</div>`;

    if (type === "list") {
      item.content = item.summary;
      delete item.summary;
    }

    delete item.status;
    delete item.categories;
    delete item._id;
    delete item.type; //todo: remove from database
    //  delete item.keywords;
    return item;
  }

  getParams(params: any, query: any): Params {
    let type = params.get("type") || "articles",
      category = params.get("category"),
      item = params.get("item"); //item may be: id or slug-text=id

    this.params = {
      type,
      category,
      //get last part of a string https://stackoverflow.com/a/6165387/12577650
      //using '=' (i.e /slug=id) will redirect to /slug
      id: item && item.indexOf("@") !== -1 ? item.split("@").pop() : item,
      refresh: query.get("refresh")
    };

    if (this.dev)
      console.log({ params, query, calculatedParamas: this.params });
    return this.params;
  }

  adjustKeywords(keywords: string | Keywords[], defaultTags: Tags): Keywords[] {
    //error TS2352: Conversion of type 'string' to type 'Keywords[]' may be a mistake
    //because neither type sufficiently overlaps with the other.
    //If this was intentional, convert the expression to 'unknown' first.
    if (typeof keywords === "string")
      //@ts-ignore
      (keywords as Keywords[]) = (<string>keywords)
        .split(",")
        .map((text: string) => ({ text }));

    return (<Keywords[]>keywords)
      .filter((el: any) => el.text)
      .map((el: any) => {
        if (!el.link)
          el.link = `https://www.google.com/search?q=site%3A${
            defaultTags.baseUrl
          }+${replaceAll(el.text, "", "+")}`;

        el.target = "_blank";
        return el;
      });
  }
}
