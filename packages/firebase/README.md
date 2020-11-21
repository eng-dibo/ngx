# @engineers/firebase

tools for firebase.

- initialize a new firebase app.
- upload & download files to firebase storage buckets.
- convert your `express` app into a `firebase cloud function`.

## install

install the package and it's peer dependencies:

```
npm i @engineers/firebase
npm i firebase-admin@^9.4.1" firebase-functions@^3.11.0
```

# examples

```
let firebaseConfig = {
  "type": "service_account",
  "project_id": "my-project",
  "private_key_id": "***",
  "private_key": "-----BEGIN PRIVATE KEY----- **** -----END PRIVATE KEY-----",
  "client_email": "***",
  "client_id": "***",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "messagingSenderId": "684865417357", //Cloud Messaging
  "measurementId": "G-59RT8HNS31"
}

let firebase = new Firebase(firebaseConfig);

//get a reference to the default bucket
let bucket = firebase.storage();

//upload a file
bucket.upload('myfile.jpg');

//or if you have a buffer, you can upload it directly without writing it to the local storage.
bucket.upload(buffer);

//download a file and save it in 'files' directory.
//you don't need to create a 'file' reference by yourself, it will be automatically created.
bucket.download('myfile.jpg','./files/myphoto.jpg')
```

convert your express app into a firebase app

```
import express from "express";
const app = express();

app.get('/',(req,res)=>res.send('hello world!'));

const firebaseApp = firebase.express(app);

//you just created a firebase function, you can access this function from a url like:
//https://us-central1-<projectId>.cloudfunctions.net/<functionName>
```

## useful packages by `engineers`

- check out these useful packages that created by engineers
  https://www.npmjs.com/org/engineers?tab=packages

- Angular CMS:

  a CMS platform built with `angular` to be very fast & SEO friendly
  https://github.com/eng-dibo/angular-cms

## contributing

contributing with us are very welcome.

## support us
