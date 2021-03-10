import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { Routes, RouterModule, InitialNavigation } from '@angular/router';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ErrorComponent } from './error.component';
import { ContentModule } from './content/content.module';
import env from '~config/env';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { UniversalInterceptor } from '@engineers/ngx-universal-express/universal-interceptor';
import { MatToolbarModule } from '@angular/material/toolbar';
import { HighlightModule } from 'ngx-highlightjs';
/*
routes are loaded in the following order:
1- appRoutes: all routes in the project, except endRoutes, contentRoutes (dynamic routes)
2- contentRoutes comes after appRoutes because it contains dynamic paths ex: /:type
3- endRoutes: contains the routes that must be loaded after all other routs, such as "**" (i.e: error component)

-> Modules are proceeded befor RouterModule.forRoot() and RouterModule.forChild()
we need to load AppRutingModule first then routes defineded in ContentModule (contains RouterModule.forChild())
then endRoutes in the last (because it contains '**')

-> @NgModule processes before RouterModule.forRoot()
 https://blogs.msmvps.com/deborahk/angular-route-ordering/
 */
const appRoutes: Routes = [
  //  { path: "", component: AppComponent, pathMatch: "full" }
];
const endRoutes: Routes = [{ path: '**', component: ErrorComponent }];
// const enableTracing = env.mode === "dev";
const enableTracing = false;

@NgModule({
  declarations: [AppComponent, ErrorComponent],
  imports: [
    RouterModule.forRoot(appRoutes, {
      initialNavigation: 'enabled' as InitialNavigation,
      enableTracing
    }),
    ContentModule,
    RouterModule.forRoot(endRoutes, { enableTracing }),
    BrowserModule.withServerTransition({ appId: 'serverApp' }),
    BrowserAnimationsModule,
    MatToolbarModule,
    HighlightModule // todo: import common languages only https://ngx-highlight.netlify.com/
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: UniversalInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent],
  exports: [RouterModule]
})
export class AppModule {}
