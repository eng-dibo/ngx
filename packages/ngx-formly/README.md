# @engineers/ngx-form

convert plain objects into Angular reactive forms, using [`formly`](https://github.com/ngx-formly/ngx-formly) to convert an object to an angular reactive form.
supporting `form steps`, `material design` and many features.

this package is build on formly, you can learn more about formly from it's [official docs](https://formly.dev/guide/getting-started).

## peer dependencies

- [ngx-formly-core](https://www.npmjs.com/package/@ngx-formly/core)
- [@angular/material](https://www.npmjs.com/package/@angular/material)

## example

add `NgxFormModule` to your app.module @NgModule.imports[]

```
import { NgxFormModule } from '@engineers/ngx-form/module'

@NgModule({
  imports: [ NgxFormModule ]
})
```

use `ngx-form` in your component to create a form.

comonent.html:

```
<ngx-form
  [formObj]="formObj"
  [response]="response"
  [progress]="progress"
  (submit)="onSubmit($event)"
>
</ngx-form>
```

componet.ts:

```
this.formObj = {
  fields:[
  {
    key: "title",
    type: "input",
    templateOptions: {
      label: "Title",
      description: "maximum: 200 charachters",
      required: true,
      maxLength: 200
    },
    validation: {
      messages: {
        maxLength: "title is too long"
      }
    }
  },
  ],
  model:{
    title: 'hello world'
  }
}
```

`formObj: FormObj` is an object that contains the form info.
it can be a plain object of the type `FormBoj` or an `observable<FormObj>` to support async operations, for example if you like to perform an API call to get the fields dynamically or to get the model from the database.

- `form: FormGroup | FormArray`: the formGroup, if no formGroup provided, a new one will be created.
- `fields`: an object that contains the form fields, typically the `fields: FormlyFieldConfig[]` used in `formly`. [see examples here](https://formly.dev/guide/getting-started).
- fields, model, options are the same as used with `formly`, see examples.
- `title: string`: the form main title.
- `steps: Step[]`: use this option to divide the form into steps, each step has it's title and it's own fields.
  it will automatically create the 'next' and 'previous' buttons and the stepper bar and take care of their functionality.

- `response: Response` use this option to show a response while and after submitting the form.
  - `status: 'ok' | 'error' | 'loading'`: one of 'ok', 'error', 'loading'.
    use 'loading' while the form is being submitted, and after the server responses change it to either 'ok' or 'error'.
  - `message: string`: a message to be displayed in the response area.
  - `class: { [className: string]: boolean }`: use this option to add or remove css classes to the response area, by default it will show a green or red or blue area depending on the `status` value.
- `progress: Progress`: use `progress` to display a progress bar, while the form is being sent to the server.
  - `loaded: number`: the amount that has been loaded until now.
  - `total: number`: the total amount.
- events: -`submit`: this event emits when the form being submitted.

```
interface FormObj {
  form?: FormGroup | FormArray;
  fields?: FormlyFieldConfig[];
  model?: { [key: string]: any }; //data from API calls
  options?: FormlyFormOptions;
  title?: string;
  steps?: Step[];
}

 interface Step {
  title?: string;
  fields?: FormlyFieldConfig[];
}

interface Response {
  status: "ok" | "error" | "loading";
  message?: string;
  class?: { [className: string]: boolean };
}

interface Progress {
  loaded: number;
  total?: number;
}
```

you can load some ready-to-use form objects from samples.
for example to display a from to create a new article.

```
import { article } from "@enginssrs/ngx-form/samples/article"

//add a new field.
article.fields.push({
  key: 'resources',
  type: 'textarea',
  templateOptions:{ ... }
  })

  //change content type from textarea to quill editor https://www.npmjs.com/package/ngx-quill
  //you will need to create the custom type 'quill' https://formly.dev/guide/custom-formly-field

  let content = article[article.findIndex(el => el.key == "content")];
  content.type = "quill";
  content.templateOptions["modules"] = {
    toolbar: [
      ["bold", "italic", "underline", "strike"],
      ["blockquote", "code-block"],
      [{ header: [false, 2, 3, 4] }],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ script: "sub" }, { script: "super" }],
      [{ direction: ["rtl", "ltr"] }],
      [{ size: ["small", false, "large"] }],
      [{ color: [] }, { background: [] }],
      [{ align: [] }],
      ["link", "image", "video"],
      ["clean"]
    ]
    //,syntax: true //->install highlight.js or ngx-highlight
  };
```

you can insert any arbitrary html code, or even another `formObj`, by using `<ng-content>` and add one of the following attributes:

- `data-before`: insert an html code before the form fields and inside the `<form>` tag.
- `data-after`: insert an html code just after the form fields and before the buttons.

# todo list:

- support various UIs such as bootstrap.

## useful packages by `engineers`

- check out these useful packages that created by engineers
  https://www.npmjs.com/org/engineers?tab=packages

- Angular CMS:

  a CMS platform built with `angular` to be very fast & SEO friendly
  https://github.com/eng-dibo/angular-cms

## contributing

contributing with us are very welcome.

## support us
