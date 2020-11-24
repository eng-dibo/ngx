import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ViewComponent } from "./view.component";
import { EditorComponent } from "./editor.component";
import { ManageComponent } from "./manage.component";
import { Routes, RouterModule } from "@angular/router";

const routes: Routes = [
  //ex: /articles/category-slug/item-slug=123
  { path: ":type", component: ViewComponent },
  { path: ":type/editor", component: EditorComponent }, // ex: /editor?type=jobs
  { path: ":type/editor/:item", component: EditorComponent },
  { path: ":type/manage", component: ManageComponent }, //same as index page but lists only user's posts with notes and status
  { path: ":type/item/:item", component: ViewComponent },
  { path: ":type/:category/:item", component: ViewComponent },
  { path: ":type/:category", component: ViewComponent },
  { path: "", component: ViewComponent, pathMatch: "full" } //or: redirectTo: "articles",
];

@NgModule({
  declarations: [ViewComponent, EditorComponent, ManageComponent],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ContentModule {}
