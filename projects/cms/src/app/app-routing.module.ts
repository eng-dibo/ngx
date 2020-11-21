import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import env from "../env";

const routes: Routes = [];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      initialNavigation: "enabled",
      enableTracing: env.mode === "dev"
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
