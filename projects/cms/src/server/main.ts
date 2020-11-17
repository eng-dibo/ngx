import { enableProdMode } from "@angular/core";
import env from "../env";

if (env.mode === "prod") {
  enableProdMode();
}

export { AppServerModule } from "./app.server.module";
export { renderModule, renderModuleFactory } from "@angular/platform-server";
