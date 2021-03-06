/*
create our express server
usage example:

import { server as expressServer,run } from "@engineers/ngx-universal-exporess/express";
export function server() {
  let app = expressServer({ dist: join(__dirname, "../browser",serverModule:AppServerModule ) });
  app.get('/path', (req,res)=>{...})
  return app
}


 */
/*
//imports for serverModule()
import { enableProdMode } from "@angular/core";
import { NgModule } from "@angular/core";
import { ServerModule } from "@angular/platform-server";
*/

// imports for server()
import 'zone.js/dist/zone-node';
import { ngExpressEngine } from '@nguniversal/express-engine';
import express from 'express';
import { APP_BASE_HREF } from '@angular/common';

/*
export interface ServerModuleOptions {
  //bootstrap component (AppComponent)
  //todo: type = component
  bootstrap: any;
  //App module (from app.module.ts)
  browserModule: any;
  prod?: boolean;
}

export function serverModule(options: ServerModuleOptions): any {
  let defaultOptions = {
    prod: true
  };

  if (options.prod) {
    enableProdMode();
  }

  @NgModule({
    imports: [options.browserModule, ServerModule],
    bootstrap: [options.bootstrap]
  })
  //todo: return class AppServerModule
  return  class AppServerModule {}
  //export { renderModule, renderModuleFactory } from "@angular/platform-server";
}
*/

export interface AppOptions {
  browserDir: string;
  // AppServerModule from server/main (created by ng cli)
  // todo: create AppServiceModule (options:{prod:bool, bootstrap: AppComponent})
  // todo: serverModule type.
  serverModule: any;
  engine?: string;
  staticDirs?: string[];
  staticMaxAge?: string;
  indexFile?: string;
  prod?: boolean;
}

// The Express server() is exported so that it can be used by serverless Functions.
export function server(
  options: AppOptions,
  cb: (app: express.Express) => express.Express
): express.Express {
  const app: express.Express = express();

  // todo: error
  if (!('browserDir' in options)) {
  }
  if (!('serverModule' in options)) {
  }

  const defaultOptions = {
    engine: 'html',
    // todo: or static={dir: maxAge}
    staticDirs: [options.browserDir],
    staticMaxAge: '1y',
    indexFile: 'index.html'
  };

  options = Object.assign(options, defaultOptions);

  // Universal express-engine
  // https://github.com/angular/universal/tree/master/modules/express-engine
  // https://expressjs.com/en/api.html#app.engine
  app.engine(
    options.engine as string,
    ngExpressEngine({
      bootstrap: options.serverModule
    })
  );

  app.set('view engine', options.engine as string);
  app.set('views', options.browserDir);

  // Example Express Rest API endpoints
  // server.get('/api/**', (req, res) => { });
  // Serve static files from /browser
  if (options.staticDirs && options.staticDirs.length > 0) {
    options.staticDirs.forEach(dir =>
      app.get('*.*', express.static(dir, { maxAge: options.staticMaxAge }))
    );
  }

  // allow the consumer to modify app (ex: adding routes) before the final route added (i.e: "*")
  // app will be changed by reference, cb() dosn't have to return it.
  if (cb && typeof cb === 'function') { cb(app); } // app = cb(app) || app;

  // All regular routes use the Universal engine, must be after all other routes
  app.get('*', (req, res) => {
    res.render(options.indexFile as string, {
      req,
      providers: [{ provide: APP_BASE_HREF, useValue: req.baseUrl }]
    });
  });

  return app;
}

export function run(
  server: express.Express,
  port?: string | number,
  msg?: string,
  errorMsg?: string
): void {
  port = port || process.env.PORT || 4200;

  // Start up the Node server
  server.listen(port, () => {
    console.log(
      msg || `Node Express server is listening on http://localhost:${port}`
    );
  });
}
