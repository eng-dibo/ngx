import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ViewComponent } from './view.component';
import { EditorComponent } from './editor.component';
import { ManageComponent } from './manage.component';

@NgModule({
  declarations: [ViewComponent, EditorComponent, ManageComponent],
  imports: [CommonModule]
})
export class ContentModule {}
