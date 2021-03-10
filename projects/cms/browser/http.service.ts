import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpRequest,
  HttpResponse,
  HttpEvent,
  HttpParams
} from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import env from '~config/env';

const dev = env.mode === 'dev';

export interface Obj {
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class HttpService {
  constructor(private http: HttpClient) {}

  get<T>(params: string | Obj, query: Obj = {}, options?: Obj): Observable<T> {
    options = Object.assign(options || {}, {
      observe: 'body'
    });
    // todo: rename params.type to params.collection
    let url = `/api/v1/`; // todo: /api/$version/$type(articles)/$item(id,ctg,...)
    if (typeof params === 'string') { url += params; }
    else {
      url += `${params.type}/`;
      if (params.id) { url += params.id; }
      else if (params.category) {
        url += `category=${encodeURIComponent(params.category)}`;
 }
      if (params.refresh) { (query || {}).refresh = params.refresh; }
    }

    options.params = this.queryParams(query);

    if (dev) { console.log('[httpService] get', { params, query, url }); }
    return this.http.get<T>(url, options);
  }

  post<T>(
    type: string,
    data: Obj,
    query: Obj = {},
    options: Obj = {}
  ): Observable<T> {
    if (dev) { console.log('[httpService] post', { type, query, data }); }

    // todo: sending data as FormData instead of Object causes that req.body=undefined
    if (options.formData !== false) { data = this.toFormData(data); } // typescript 3.2 dosen't support null safe operator i.e: options?.formData
    delete options.formData;
    options.params = this.queryParams(query);
    return this.http.post<T>(`/api/v1/${type}`, data, options);
  }

  // same as get() & post(), but reports the progress
  progress<T>(
    method: 'get' | 'post',
    params: string | Obj,
    data?: any,
    query?: Obj,
    options?: any
  ): Observable<HttpEvent<T>> {
    options = Object.assign(options || {}, {
      reportProgress: true,
      observe: 'events'
    });
    return method === 'post'
      ? this.post<HttpEvent<T>>(
          typeof params === 'string' ? params : params.type,
          data,
          query,
          options
        )
      : this.get<HttpEvent<T>>(
          params,
          query,
          options
        ); /*.pipe(
      //todo: support other `event.type`s
      map((event: HttpEvent<any>) => {
        if (
          [
            HttpEventType.UploadProgress,
            HttpEventType.DownloadProgress
          ].include(event.type)
        ) {
          event.type = "progress";
          event.value = Math.round((event.loaded * 100) / event.total);
        } else if (event.type === HttpEventType.Response)
          event.type = "response";

        return event;
      })
    );*/
  }

  // this method dosent return an Observable
  // todo: http.request('post') VS http.post()
  request(method: string, type: string, data: Obj, options?: Obj) {
    return new HttpRequest(method, `/api/v1/${type}`, data, options);
  }

  /**
   * use formData when the form contains files (i.e: multipart), otherwise send the data as a json object
   * note that body-parser doesn't handle multipart data which is what FormData is submitted as.
   * instead use: busboy, formidable, multer, ..
   * https://stackoverflow.com/questions/37630419/how-to-handle-formdata-from-express-4/37631882#37631882
   * @method toFormData
   * @param  data           [description]
   * @param  singleElements append the element as a single entry i.e: JSON.stringify(el)
   * @return FormData
   */
  toFormData(data: FormData | Obj, singleElements?: string[]): FormData {
    if (data instanceof FormData) { return data; }

    const formData = new FormData();
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        let el = data[key];
        if (
          (el instanceof Array || el instanceof FileList) &&
          (!singleElements || !singleElements.includes(key))
        ) {
          // if (!key.endsWith("[]")) key += "[]";
          // FileList.forEach() is not a function
          for (let i = 0; i < el.length; i++) { formData.append(key, el[i]); }
        } else {
          if (el == null) { el = ''; }
          // formData converts null to "null" , FormData can contain only strings or blobs
          else if (el instanceof Array) { el = JSON.stringify(el); }
          formData.append(key, el);
        }
      }
    }
    if (dev) { console.log('toFormData()', { data, formData }); }
    return formData;
  }

  queryParams(query: Obj) {
    if (!query) { return; }
    let queryParams = new HttpParams();
    for (const key in query) {
      // HTTPParams is immutable, so queryParams.set() will return a new value
      // and will not update queryParams
      // https://www.tektutorialshub.com/angular/angular-pass-url-parameters-query-strings/
      queryParams = queryParams.set(key, query[key]);
    }
    return queryParams;
  }
}
