import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { metaTags } from '~config/browser';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  name = metaTags().name;

  constructor(private router: Router) {}
  go(path: Array<string> | string) {
    if (typeof path == 'string') { path = [path]; }
    this.router.navigate(path);
  }
}
