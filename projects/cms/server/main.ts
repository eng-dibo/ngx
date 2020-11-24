import { enableProdMode } from "@angular/core";
import env from "~config/env";
import { NgModule } from "@angular/core";
import { ServerModule } from "@angular/platform-server";
import { AppModule } from "~src/app/app.module";
import { AppComponent } from "~src/app/app.component";

if (env.mode === "prod") {
  enableProdMode();
}

@NgModule({
  imports: [AppModule, ServerModule],
  bootstrap: [AppComponent]
})
export class AppServerModule {}
export { renderModule, renderModuleFactory } from "@angular/platform-server";
