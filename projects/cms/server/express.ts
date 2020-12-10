import {
  server as expressServer,
  run
} from "@engineers/ngx-universal-express/express";
import { AppServerModule } from "./main";
import { join } from "path";

export function server() {
  let app = expressServer({
    browserDir: join(__dirname, "../browser"),
    serverModule: AppServerModule
  });
  return app;
}

// Webpack will replace 'require' with '__webpack_require__'
// '__non_webpack_require__' is a proxy to Node 'require'
// The below code is to ensure that the server is run only when not requiring the bundle.
declare const __non_webpack_require__: NodeRequire;
const mainModule = __non_webpack_require__.main;
const moduleFilename = (mainModule && mainModule.filename) || "";
if (moduleFilename === __filename || moduleFilename.includes("iisnode")) {
  run(server(), 4200);
}

export * from "./main";
