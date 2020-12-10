import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ContentViewComponent } from "./view.component";
import { ContentEditorComponent } from "./editor.component";
import { ContentManageComponent } from "./manage.component";
import { Routes, RouterModule } from "@angular/router";

const routes: Routes = [
  //ex: /articles/category-slug/item-slug=123
  { path: ":type", component: ContentViewComponent },
  { path: ":type/editor", component: ContentEditorComponent }, // ex: /editor?type=jobs
  { path: ":type/editor/:item", component: ContentEditorComponent },
  { path: ":type/manage", component: ContentManageComponent }, //same as index page but lists only user's posts with notes and status
  { path: ":type/item/:item", component: ContentViewComponent },
  { path: ":type/:category/:item", component: ContentViewComponent },
  { path: ":type/:category", component: ContentViewComponent },
  { path: "", component: ContentViewComponent, pathMatch: "full" } //or: redirectTo: "articles",
];

@NgModule({
  declarations: [
    ContentViewComponent,
    ContentEditorComponent,
    ContentManageComponent
  ],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ContentModule {}
