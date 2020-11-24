import { Component } from "@angular/core";
import { Router } from "@angular/router";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"]
})
export class AppComponent {
  title = "cms";

  constructor(private router: Router) {}
  go(path: Array<string> | string) {
    if (typeof path == "string") path = [path];
    this.router.navigate(path);
  }
}
