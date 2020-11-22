import shortId from "shortid";
import mongoose from "mongoose";
export const basic = {};

/*
//replace '-' with '@', because it will be used as a separator between the id and the slug,
//or use '='
//ex: /id-slug-text   OR /id=slug-text
shortid.characters(
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_@"
);
*/

//times (createdAt, updatedAt) are added automatically, by the option {typestamps: true}

//todo: separate collections jobs & articles
//use articles_categories & jobs_categories, or add {type:'articles'|'jobs'} to categories
export const articles = {
  _id: { type: String, default: shortId.generate },
  title: String,
  subtitle: String,
  content: String,
  summary: String,
  keywords: [{ type: String, ref: "keywords" }],
  author: { type: String, ref: "persons" },
  status: String, //pending, approved, denied, expired
  notes: String, //ex: denied reason
  type: String,
  contacts: String, //for jobs
  categories: [String],
  sources: String
};

export const categories = {
  _id: { type: String, default: shortId.generate },
  title: String,
  slug: String,
  parent: { type: String, ref: "categories" },
  fb_pages: [String],
  config: {} //listed: boolean (listed in home page),
};

export const keywords = {
  text: String,
  status: String, //same as articles.status (approved keywords appears in suggestions)
  count: Number //number of times this keyword used
};

//logins collection now merged with accounts {type:"login", entries:{ type:"email|mobile|fb", pass:"", confirmed:boolean}}
export const accounts = {
  type: String,
  entry: {}, //for Adsense: id (pub-*), slot, channel;
  user: { type: String, ref: "persons" },
  role: { type: mongoose.ObjectId, ref: "roles" } //account role, ex: admin, modirator,...
};

export const countries = {
  _id: String, //country code, ex: 'EG'
  name: {
    en: String,
    native: String
  },
  lang: { type: String, ref: "languages" }, //top language
  capital: String,
  currency: String
};

export const cities = {
  coutry: { type: String, ref: "countries" },
  name: {
    en: String,
    native: String
  }
};

export const languages = {
  _id: String, //language code, ex: 'ar', 'en'
  name: {
    en: String,
    native: String
  }
};

export const persons = {
  _id: { type: String, default: shortId.generate },
  name: [String],
  gender: String,
  birth: {
    date: [Number],
    country: { type: String, ref: "countries" },
    city: { type: String, ref: "cities" }
  },
  //including mobiles, emails used for logins
  //emails will sent to the primary email
  //active: if the email receives our messages
  emails: [
    {
      entry: String,
      confirmed: { type: Boolean, default: false },
      primary: Boolean,
      active: Boolean
    }
  ],
  mobiles: [
    {
      entry: String,
      confirmed: { type: Boolean, default: false },
      primary: Boolean,
      active: Boolean
    }
  ],
  ids: [{ type: { type: String }, value: String }], //type= national id, passport, ...
  type: String //bot, fk,...
};

//CV extends person info
export const cv = {
  _id: { type: String, default: shortId.generate },
  person: { type: String, ref: "persons" },
  job_hsitory: [
    {
      company: { type: String, ref: "places" },
      position: String,
      notes: String, //tasks, activities, job description, ...
      period: [Date], //start->end;  //validation: current job has no end value
      current: Boolean, //validation: when selecting a job as current, offer to remove the previous current job and set an end date
      country: { type: String, ref: "countries" },
      city: { type: String, ref: "cities" }
    }
  ],
  education: [
    {
      level: String, //primary school, PHD, ...
      name: String, //school or colledge name
      department: String,
      universty: String,
      country: { type: String, ref: "countries" },
      city: { type: String, ref: "cities" },
      period: [Date],
      current: Boolean
    }
  ],
  languages: [
    { language: { type: String, ref: "languages" }, fluency: Number }
  ], //fluency%
  skills: [{ name: String, level: Number }] //level%
};

export const places = {
  name: String,
  location: [String],
  description: String,
  type: String, //ex: company, club, shop, store, ...
  head: Boolean, //if it is the headsquare
  branches: [{ type: String, ref: "places" }]
};

/*
ex:
{name:user,
 permissions:[
    {type:articles, scope:own, allowed:['edit','delete']},
    {type:articles, scope:all, allowed:['read','comment','react']},
    {type:jobs, scope:all, allowed:['read','comment','react','apply']},
]},
 */
export const roles = {
  name: String, //admin, modirator, writer, advertiser, user, guest
  permissions: [{ type: { type: String }, scope: String, allowed: [String] }]
};

//todo: jobs_description {title:"civil engineer", description:"", responsibilities:[String] }

/*
jobsSchema = { ...schemas["article"], contacts: String } as typeof contentObj;
//https://stackoverflow.com/a/31816062/12577650 & https://github.com/microsoft/TypeScript/issues/18075
*/
