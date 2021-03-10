import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { QuillViewComponent } from 'ngx-quill'; // todo: enable sanitizing https://www.npmjs.com/package/ngx-quill#security-hint
import { obs } from '@engineers/ngx';
import { Article, Pref } from './article';
import { MetaService } from '@engineers/ngx/meta.service';
/*
- usage:
<content-view [data]="{title,content,keywords[],auther{},...}" [related]="[{id,title,..}]" >
*/

export type Payload = Article | Article[];

export interface Tags {
  [key: string]: any;
} // todo: import MetaTags from meta.service

export type Type = 'list' | 'item';

@Component({
  selector: 'ngx-content-view',
  templateUrl: './view.html',
  styleUrls: ['./view.scss']
})
export class NgxContentViewComponent implements OnInit {
  @Input() data!: Payload | Observable<Payload>;
  @Input() type!: Type;
  @Input() tags!: Tags;
  @Input() pref!: Pref; // component prefrences

  constructor(private meta: MetaService) {}

  ngOnInit() {
    this.pref = this.pref || {};

    // todo: pref.back=/$item.categories[0]
    this.pref.back = this.pref.back || '/';

    obs(this.data, (data: Payload) => {
      // todo: if (typeof data == "string") data = JSON.parse(data);

      this.meta.setTags(this.tags as Tags);
      this.type = data instanceof Array ? 'list' : 'item';
      this.data = data;
    });
  }
}
