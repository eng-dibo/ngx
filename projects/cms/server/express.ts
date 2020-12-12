import {
  server as expressServer,
  run
} from "@engineers/ngx-universal-express/express";
import { AppServerModule } from "./main";
import { join } from "path";
import { connect, disconnect } from "./mongoose";
import { dev, DIST, TEMP } from "~config/server";

export function server() {
  //todo: no need to use connect().then(...), as the connection now is already open
  //connect dosen't create a new connection if readystate=1
  connect();

  return expressServer(
    {
      browserDir: join(DIST, "./browser"),
      serverModule: AppServerModule
    },
    app => {
      //cache files, created at runtime
      app.staticDirs.push(TEMP);

      //to use req.protocol in case of using a proxy in between (ex: cloudflare, heroku, ..), without it express may always returns req.protocole="https" even if GET/ https://***
      //https://stackoverflow.com/a/46475726
      app.enable("trust proxy");

      //add trailing slash to all requests,
      //https://expressjs.com/en/guide/using-middleware.html
      //https://dev.to/splodingsocks/getting-all-404s-with-your-firebase-functions-3p1

      app.use((req, res, next) => {
        if (dev) console.log("[server] request:", req.originalUrl, { req });
        if (!req.path) req.url = `/{req.url}`;
        next();
      });

      app.use((req, res, next) => {
        //redirect http -> https & naked -> www
        let parts: ParseResultListed = <ParseResultListed>(
          parseDomain(req.hostname)
        );
        //ex: www.example.com.eg ->{subDomains:[www], domain:google, topLevelDomains:[com]};  old(v2.3.4):{domain:example, subdomain:www, tld:.com.eg}
        //if the url cannot parsed (ex: localhost), parts= null, so we just skip to the next() middliware

        if (
          parts &&
          parts.hostname !== "localhost" &&
          (!parts.subDomains || parts.subDomains === [] || !req.secure)
        ) {
          if (!parts.subDomains) parts.subDomains = [];
          let url = `https://${(parts.subDomains || []).join(".") || "www"}.${
            parts.domain
          }.${(parts.topLevelDomains || []).join(".")}${req.url}`;
          if (dev)
            console.log(`redirecting to: ${url}`, {
              host: req.hostname,
              secure: req.secure,
              protocol: req.protocol,
              url: req.url,
              parts
            });

          return res.redirect(301, url);
        }
        next();
      });

      app.use(jsonParser());
      app.use(urlParser({ extended: true }));
      app.use(cors());

      app.use("/api/v1", v1);
      return app;
    }
  );
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
