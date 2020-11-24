//todo: encrypt all sensetive data, or use ${{env:keyName}}
//ex: password=${{env:password}}

import { credential } from "firebase-admin";
import * as schemas from "./models";
import { existsSync } from "fs";
import { join } from "path";

export const dev = process.env.NODE_ENV === "development";
export const TEMP = join(process.env.INIT_CWD || "", "./temp"); //todo: use system.temp
export const DIST = join(process.env.INIT_CWD || "", "./dist"); //process.cwd() dosen't include /dist
export const BUCKET = `${dev ? "test" : "bucketName"}`;
export { schemas };

export const DB = {
  type: "username",
  auth: ["dbUsername", "password@@"], //todo: ['username', 'env:dbPass']
  host: "username-gbdqa.gcp.mongodb.net",
  srv: true,
  dbName: dev ? "test" : "dbname"
};
