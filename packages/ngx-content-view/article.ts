import { Component, Input, OnInit } from '@angular/core';

interface Obj {
  [key: string]: any;
}

export interface Article extends Obj {
  id: string;
  title: string;
  subtitle?: string;
  content: string;
  // todo: if(keywods:string)keywords=keywords.split(',').map(text=>({text}))
  keywords?: Keywords[];
  cover?: Image;
  // todo: img?: string | Image
  author?: { name?: string; img?: string; link?: string };
  link?: string;
  categories?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Keywords extends Obj {
  text: string;
  count?: number | string;
  link?: string;
  target?: string;
}

// todo: convert <img data-ngx-img="img: Image"> to <img>
export interface Image {
  src?: string;
  srcset?: string;
  sizes?: string;
  alt?: string;
  lazy?: boolean;
  placeholder?: string;
  width?: number; // html img.width is number ex: <img width="50" />
  height?: number;
}

export interface Pref extends Obj {
  layout?: string; // grid || list
  back?: string; // the link in case of no content
  noContent?: string; // noContent text; todo: html
}

@Component({
  selector: 'ngx-content-article',
  templateUrl: './article.html',
  styleUrls: ['./view.scss']
})
export class NgxContentArticleComponent {
  @Input() data!: Article;
  @Input() type!: string;
}
