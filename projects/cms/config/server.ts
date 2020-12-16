//todo: encrypt all sensetive data, or use ${{env:keyName}}
//ex: password=${{env:password}}

//don't use process.cwd() and process.env.INIT_CWD, use __dirname and __filename
//to use process.cwd(), consider the working directory is project's root i.e: projects/cms
//in this case the project must be started from this location (npm run start),
//starting the project from dist/*/server > node express is wrong

import { credential } from "firebase-admin";
import * as schemas from "./models";
import { existsSync } from "fs";
import { join } from "path";

export const dev = process.env.NODE_ENV === "development";
export const DIST = join(__dirname, "..");
export const TEMP = join(DIST, "./temp"); //todo: use system.temp
export const BUCKET = `${dev ? "test" : "bucketName"}`;
//use auth code to perform admin operations.
export const AUTH = "";
export { schemas };

export const DB = {
  type: "mongodb",
  auth: ["dbUsername", "password"], //todo: ['username', 'env:dbPass']
  host: "username-gbdqa.gcp.mongodb.net",
  srv: true,
  dbName: dev ? "test" : "dbname"
};
