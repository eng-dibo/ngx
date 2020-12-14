import { connect, getModel } from "./mongoose";
import { cache, mkdir, json } from "@engineers/nodejs/fs";
import { Firebase } from "@engineers/firebase/admin";
import { initializeApp } from "firebase-admin";
import multer from "multer";
import { Categories } from "~browser/formly-categories-material/functions";
import { setTimer, getTimer, endTimer } from "@engineers/nodejs/timer";
import { TEMP } from "~config/server";
import { FIREBASE } from "~config/firebase";

export const dev = process.env.NODE_ENV === "development";

/*
process.cwd() for firebase = functions.source (i.e: ./dist)
whitch is different from here (i.e /)
so using process.cwd() will give different values for
`npm run start` and `npm run firebase:serve`

process.env.INIT_CWD is the path where `npm run` runned, regardless of the current working directory
you must run `npm start` or `npm firebase:serve` from the project's root dir.

another solution is to replace process.cwd() with it's value when building this file with webpack
to be a fixed value in both cases.

or re-set the view dir in firebase/index to be relative to it's process.cwd() dir
i.e functions.source (./dist)
app.set("views", "./browser");

todo: process.env.INIT_CWD || ?? -> check if process.env.INIT_CWD is undefined
*/

//todo: use env:GOOGLE_APPLICATION_CREDENTIALS=Path.resolve("./firebase-almogtama3-eg.json")

export const bucket = new Firebase(FIREBASE).storage();
/*


/**
 * get adjusted categories (i.e: adding branches, top to each entry & add main categories)
 * & adjusted articles_categories (i.e: article_categories & category_articles)
 * & inputs (for forms)
 * @method categories
 * @return {categories, main, article_categories, category_articles, inputs}
 */
export function getCategories(collection: string = "articles") {
  return cache(`./temp/${collection}/categories.json`, () =>
    //@ts-ignore: error TS2349: This expression is not callable. Each member of the union type ... has signatures, but none of those signatures are compatible with each other.
    connect().then(() => {
      setTimer("getCategories");
      return Promise.all([
        getModel(`${collection}_categories`)
          .find({})
          .lean(),
        //get all topics categories
        getModel(collection)
          //@ts-ignore
          .find({}, "categories")
          .lean()
      ])
        .then(([categories, items]) => {
          if (dev)
            console.log(
              "[server] getCategories: fetched from server",
              getTimer("getCategories")
            );
          /*
          //don't close the connection after every query
          //todo: close the connection when the server restarts or shutdown
          //https://hashnode.com/post/do-we-need-to-close-mongoose-connection-cjetx0dxh003hcws2l1fs81nl
          mongoose.connection.close(() => {
            if (dev) console.log("connection closed");
          });
          */
          let ctg = new Categories(categories);
          ctg.adjust();
          if (dev)
            console.log(
              "[server] getCategories: adjusted",
              endTimer("getCategories")
            );
          return ctg.itemCategories(items);
        })
        .catch(err => {
          console.error("Error @categories", err);
          throw new Error(`Error @categories, ${err.message}`);
        });
    }, 1)
  );
}

export const jsonData = {
  get(type: string, id?: string | Number) {
    let file = `${TEMP}/${type}/${id ? id + "/data" : "index"}.json`;
    try {
      return json.read(file);
    } catch (e) {
      console.warn(`jsonData.get(${type},${id}) failed`, e);
    }
  },
  save(type: string, data: any) {
    if (data) {
      let dir = `${TEMP}/${type}`;
      mkdir(dir);
      if (data instanceof Array) json.write(`${dir}/index.json`, data);
      else json.write(`${dir}/${data._id}/data.json`, data);
    }
  }
};

//multer hanles multipart/form-data ONLY, make sure to add enctype="multipart/form-data" to <form>
//todo: add multer to specific urls: app.post(url,multer,(req,res)=>{})
//todo: if(error)res.json(error)
//todo: fn upload(options){return merge(options,defaultOptions)}
export let upload = multer({
  limits: {
    fileSize: 5 * 1024 * 1024,
    fieldSize: 10 * 1024 * 1024, //form total size; formData[content] contains some images (base64 encoded)
    files: 20
  },
  fileFilter: function(req: any, file: any, cb: any) {
    //we only upload 'cover image', so only images are available
    //other files are pasted into quill editor as base64-encoded data.
    let result = file.mimetype.startsWith("image/");
    if (dev) console.log("multer fileFilter", { result, req, file, cb });
    cb(null, result); //to reject this file cb(null,false) or cb(new error(..))
  },
  //multer uses memoryStorage by default
  //diskStorage saves the uploaded file to the default temp dir,
  //but rename(c:/oldPath, d:/newPath) not allowed,
  //so we upload the file to a temporary dir inside the same partition
  //https://stackoverflow.com/a/43206506/12577650
  storage: multer.memoryStorage() /*multer.diskStorage({
    destination: function(req, file, cb) {
      let dir = `${TEMP}/uploads`;
      mkdir(dir);
      cb(null, dir);
    },
    filename: function(req, file, cb) {
      cb(null, `tmp${new Date().getTime()}.tmp`);
    }
  }) */
});
