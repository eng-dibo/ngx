import express from "express";
import shortId from "shortid";
import { connect, getModel } from "../mongoose";
import { dev, TEMP, BUCKET } from "~config/server";
import { upload, bucket, getCategories } from "../functions";
import { cache, write, mkdir } from "@engineers/nodejs/fs";
import { Categories } from "~browser/formly-categories-material/functions";
import { setTimer, endTimer, getTimer } from "@engineers/nodejs/timer";
import { resize } from "@engineers/graphics";
import { backup, restore, query as _query } from "@engineers/mongoose";
import { replaceAll } from "@engineers/nodejs/objects";

//todo: add auth token

//todo: don't import from ngx-* packages, because it may contain browser-specific APIs.
import { slug } from "@engineers/ngx-content-core/functions";

//todo: import {} from 'fs/promises' dosen't work yet (expremental)
const { readdir, unlink } = require("fs").promises;

const app = express.Router();

//todo: update collection list
//todo: get collections from db, then collections.map(el=>/*rename or remove*/), save to ./temp/supportedCollections.json
const supportedCollections = [
  "articles",
  "jobs",
  "articles_categories",
  "jobs_categories",
  "countries",
  "keywords",
  "persons",
  "languages"
];
app.get("/collections", (req: any, res: any) => res.json(supportedCollections));

export function query(
  operation: string,
  collection: string | Array<any>,
  params: Array<any>
) {
  //@ts-ignore
  return _query(operation, getModel(collection), params);
}

/*
  perform db operations via API.
  todo: use AUTH_TOKEN
  todo: send small data via app.post()
  ex: /api/v1/:find/articles/$articleId
  ex: /api/v1/:find/articles?params=[{"status":"approved"},null,{"limit":2}]
 */
app.get(/\/:([^\/]+)\/([^\/]+)(?:\/(.+))?/, (req: any, res: any) => {
  let operation = req.params[0],
    collection = req.params[1],
    params = JSON.parse(<string>req.params[2] || "[]"); //array of function params ex: find(...params)
  if (!(params instanceof Array)) params = [<any>params];
  setTimer(`get ${req.url}`);

  query(operation, collection, params)
    .then((data: any) => res.json(data))
    .catch((error: any) => res.json({ error }))
    .then(() => {
      if (dev) console.log("[server] get", req.url, endTimer(`get_${req.url}`));
    });
});

//todo: /\/(?<type>image|cover)\/(?<id>[^\/]+) https://github.com/expressjs/express/issues/4277
//ex: <img src="/images/articles-cover-$topicId/slug-text.png?size=250" />
//todo: change to /api/v1/articles/image/$articleId-$imageName (move to the previous app.get(); execlude from ngsw cache)
//todo:  /api/v1/$collection/image=$name-$id/slug-text?size
app.get(/\/image\/([^/-]+)-([^/-]+)-([^/]+)/, (req: any, res: any) => {
  setTimer("/image");

  //todo: use system.temp folder
  let collection = req.params[0],
    name = req.params[1],
    id = req.params[2],
    size = <string>req.query.size,
    bucketPath = `${BUCKET}/${collection}/${id}/${name}.webp`,
    localPath = `${TEMP}/${collection}/item/${id}/${name}.webp`,
    resizedPath = `${localPath.replace(".webp", "")}_${size}.webp`;

  if (!id || !collection)
    return res.json({
      error: { message: "[server/api] undefined id or collection " }
    });

  cache(
    resizedPath,
    () =>
      cache(
        localPath,
        () => bucket.download(bucketPath).then((data: any) => data[0]),
        24
      ).then((data: any) =>
        resize(data, size, {
          //  dest: resizedPath, //if the resizid img saved to a file, data=readFile(resized)
          format:
            req.headers?.accept.indexOf("image/webp") !== -1 ? "webp" : "jpg",
          allowBiggerDim: false, //todo: add this options to resize()
          allowBiggerSize: false
        })
      ),
    24
  )
    .then((data: any) => {
      //todo: set cache header
      //todo: resize with sharp, convert to webp
      //res.write VS res.send https://stackoverflow.com/a/54874227/12577650
      //res.write VS res.sendFile https://stackoverflow.com/a/44693016/12577650
      //res.writeHead VS res.setHeader https://stackoverflow.com/a/28094490/12577650
      res.writeHead(200, {
        "Content-Type": "image/jpg",
        "Cache-Control": "max-age=31536000"
      });

      res.write(data);
      if (dev)
        console.log(
          `[server/api] get /image ${id}/${name}.webp`,
          endTimer("/image")
        );
      res.end();
    })
    .catch((error: any) => res.json({ error }));
});

/*
-> $collection
-> $collection/$itemId
-> $collection/$itemType=$itemValue

  ex: /api/v1/articles?limit=50 -> get all articles
  ex: /api/v1/articles/123 -> get article: 123
  ex: /api/v1/articles/category=123 -> get articles from this category
  ex: /api/v1/articles_categories -> get categories list
 */
app.get(/\/([^\/]+)(?:\/(.+))?/, (req: any, res: any, next: any) => {
  let collection = req.params[0],
    itemType: string,
    item: any;

  setTimer(`get ${req.url}`);

  if (!req.params[1]) itemType = "index";
  else if (req.params[1].indexOf("=") !== -1)
    [itemType, item] = req.params[1].split("=");
  else {
    itemType = "item";
    item = req.params[1];
  }

  //------------------ API route validation ------------------//
  if (!["item", "category", "index", "image"].includes(itemType))
    return res.json({
      error: {
        message: "unknown itemType, allowed values: item, category, index"
      }
    });

  /* todo:
  if (!supportedCollections.includes(collection))
    return res.json({
      error: {
        message:
          "unknown collection, use /api/v1/collections to list the allowed collections"
      }
    }); */

  if (itemType != "index" && !item)
    return res.json({ error: { message: "no id provided" } });
  //------------------ /API route validation ------------------//

  //todo: add query to file cashe ex: articles_index?filter={status:approved}
  //  -> articles_index__JSON_stringify(query)
  //for item temp=.../item/$id/data.json because this folder will also contain it's images
  let tmp = `${TEMP}/${collection}/${itemType}${item ? `/${item}` : ""}${
    itemType == "item" ? "/data" : ""
  }.json`;

  return cache(
    tmp,
    () =>
      //@ts-ignore: error TS2349: This expression is not callable. Each member of the union type ... has signatures, but none of those signatures are compatible with each other.
      connect().then(() => {
        let content;
        if (itemType == "item") content = query("find", collection, [item]);
        else {
          let findOptions = {
            filter: JSON.parse(<string>req.query.filter || "{}") || {},
            //todo: support docs{} -> typeod docsstring in both cases
            docs: req.query.docs, //projection
            options: JSON.parse(<string>req.query.options || "{}") || {}
          };
          if (req.query.limit) findOptions.options.limit = +req.query.limit;

          if (
            ["articles", "jobs"].includes(collection) &&
            !findOptions.filter.status
          )
            findOptions.filter.status = "approved";
          if (findOptions.filter.status === null)
            delete findOptions.filter.status;

          if (itemType == "index") {
            content = query("find", collection, [
              findOptions.filter,
              findOptions.docs,
              findOptions.options
            ]);
          } else if (itemType == "category") {
            content = getCategories(collection).then((categories: any) => {
              let ctg = new Categories(categories);

              let category = categories.categories.find(
                (el: any) => el.slug == item
              );

              let branches = [category, ...ctg.getBranches(category)];
              let items = new Set();

              categories = categories.categories
                .find((el: any) => branches.includes(el))
                .forEach((el: any) => {
                  if (el.items instanceof Array)
                    el.items.forEach((item: any) => items.add(item));
                });

              findOptions.filter._id = { $in: items };
              return query("find", collection, [
                findOptions.filter,
                findOptions.docs,
                findOptions.options
              ]);
            });
          } else if (itemType == "image") {
          }
        }
        return content;
      }),
    //todo: ?refresh=AUTH_TOKEN
    req.query.refresh ? -1 : 3
  )
    .then((payload: any) => {
      res.json(payload);
      if (dev)
        console.log(
          "[server/api] getData:",
          endTimer(`get ${req.url}`),
          payload
        );
    })
    .catch((error: any) => {
      res.json({ error });
      if (dev)
        console.error(
          "[server/api] getData:",
          endTimer(`get ${req.url}`),
          error
        );
    });
});

//todo: typescript: add files[] to `req` definition
//todo: cover= only one img -> upload.single()
//todo: change to /api/v1/collection/itemType[/id]
app.post("/:collection", upload.single("cover"), (req: any, res: any) => {
  if (dev)
    console.log("[server/api] post", {
      body: req.body,
      files: req.files,
      file: req.file,
      cover: req.body.cover //should be moved to files[] via multer
    });

  if (!req.body || !req.body.content)
    return res.send({ error: { message: "no data posted" } });

  let data = req.body;

  let update: boolean;
  if (!data._id) {
    data._id = shortId.generate();
    update = false;
  } else update = true;
  let collection = req.params.collection;

  if (collection == "article") collection = "articles";
  else if (collection == "job") collection = "jobs";
  setTimer(`post ${req.url}`);

  let tmp = `${TEMP}/${collection}/item/${data._id}`;
  mkdir(tmp);

  //todo: replace content then return insertData()
  /*
  1- handle base46 data, then: upload images to firebase, then resize
  2- insert data to db
  3- upload cover image then resize it
   */

  let date = new Date();

  if (!data.slug || data.slug == "")
    data.slug = slug(data.title, 200, ":ar", false); //if slug changed, cover fileName must be changed

  //todo: check permissions, for owner, admin -> auto approve
  data.status = "approved";

  // handle base64-encoded data (async)
  data.content = data.content.replace(
    /<img src="data:image\/(.+?);base64,([^=]+)={0,2}">/g,
    (
      match: any,
      extention: any,
      imgData: any,
      matchPosition: any,
      fullString: any
    ) => {
      let fileName = date.getTime(),
        bucketPath = `${BUCKET}/${collection}/${data._id}/${fileName}.webp`,
        src = `api/v1/image/${collection}-${fileName}-${data._id}/${data.slug}.webp`,
        srcset = "",
        sizes = "";
      for (let i = 1; i < 10; i++) {
        srcset += `${src}?size=${i * 250} ${i * 250}w,`;
      }

      //todo: catch(err=>writeFile('queue/*',{imgData,err})) to retry uploading again
      resize(imgData, "", { format: "webp", input: "base64" })
        .then((data: any) => bucket.upload(data, bucketPath)) //todo: get fileName
        .then(() => {
          console.log(`[server/api] uploaded: ${fileName}`);
          write(`${tmp}/${fileName}.webp`, imgData);
        });
      //todo: get image dimentions from dataImg
      return `<img width="" height="" data-src="${src}" data-srcset="${srcset}" sizes="${sizes}" alt="${data.title}" />`;
    }
  );

  //upload cover
  if (req.file && req.file.buffer) {
    if (dev) console.log("[server/api] uploading cover ...");
    data.cover = true;

    //to get original name: cover.originalname
    let bucketPath = `${BUCKET}/${collection}/${data._id}/cover.webp`;

    resize(req.file.buffer, "", { format: "webp" })
      .then((data: any) => bucket.upload(data, bucketPath))
      .then((file: any) => {
        console.log(`[server/api] cover uploaded`);
        write(`${tmp}/cover.webp`, req.file.buffer);
      });
  }

  write(`${tmp}/data.json`, data).catch((error: any) =>
    console.error(
      `[server/api] cannot write the temp file for: ${data._id}`,
      error
    )
  );

  //todo: data.summary=summary(data.content)

  connect()
    //@ts-ignore: error TS2349: This expression is not callable. Each member of the union type ... has signatures, but none of those signatures are compatible with each other.
    .then(() => {
      let contentModel = getModel(collection);
      if (update)
        return (
          contentModel
            .replaceOne({ _id: data._id }, data, {
              upsert: true,
              timestamps: true
            })
            //return data to the front-End
            .then((doc: any) => {
              let temp = `${TEMP}/${collection}/item/${data._id}`;
              readdir(temp).then((files: any) => {
                files.forEach((file: any) => {
                  //remove images and cover sizes; cover.webp, $images.webp and data.json are already renewed.
                  if (file.indexOf(".webp") && file.indexOf("_") !== -1)
                    unlink(`${temp}/${file}`).catch((error: any) =>
                      console.error(
                        `[server/api] cannot delete ${temp}/${file}`,
                        {
                          error
                        }
                      )
                    );
                });
              });

              return data;
            })
        );
      let content = new contentModel(data);
      return content.save();
    })
    .then((data: any) => {
      res.send(data);
      unlink(`${TEMP}/${collection}/index.json`);
      if (dev)
        console.log(
          `[server/api] post: ${collection}`,
          endTimer(`post ${req.url}`),
          data
        );
    })
    .catch((error: any) => {
      res.send({ error });
      console.error(
        `[server/api] post: ${collection}`,
        endTimer(`post ${req.url}`),
        error
      );
    });

  //the content will be available after the process completed (uploading files, inserting to db, ..)
});

//todo: /backup?filter=db1,db2:coll1,coll2,db3:!coll4
app.get("/backup", (req: any, res: any) => {
  let filter: any;
  if (req.query.filter) {
    let tmp = JSON.parse(<string>req.query.filter);
    if (tmp instanceof Array) filter = (db: any, coll: any) => tmp.includes(db);
    //todo: else of object; else if string
  } else
    filter = (db: any, coll: any) => {
      if (dev) console.log("[backup] filter", db, coll);
      return true;
    };

  connect
    //@ts-ignore: error TS2349: This expression is not callable. Each member of the union type ... has signatures, but none of those signatures are compatible with each other.
    .then((con: any) => {
      let host = con.client.s.options.srvHost,
        now = replaceAll(new Date().toISOString(), ":", "-");
      console.log(`[backup] host: ${host}`);

      //using !console.log() or console.log() || true is illegal in typescript
      //don't convert void to boolean this way, use ',' (console.log(),true)
      //playground: https://www.typescriptlang.org/play?#code/GYVwdgxgLglg9mABFApgZygCgB4H4BcARnHADYoCGYAlAN4C+AsAFAssD07cA1i6hpkwQEaMigB0pOAHNM1ADRQATiBTVqbVs04olSuEr7oswsKPKSZcjc35YAhKfMSps9UYFOxlt4gA+fsgqakA
      //issue: https://github.com/microsoft/TypeScript/issues/28248#issuecomment-434693307
      return backup(con, filter).then((data: any) => {
        let file = `${process.env.INIT_CWD}/tmp/db-backup/${host}/${now}.json`;
        if (dev) console.log("[backup]", { file, data });
        let result = { info: con.client.s, backup: data };

        return write(file, result)
          .then(() => {
            console.log("[backup] Done");
            res.json(result);
          })
          .catch((error: any) => {
            console.error({ error });
            throw Error(`[backup] cannot write to ${file}`);
          });
      });
    })

    .catch((error: any) => res.json({ error }));
});

//todo: /restore?filter=db1;db2:coll2,coll3;db3:!coll1,coll2 & change=db2:db5
//i.e: upload db2:coll2 to db5
app.get("/restore", (req: any, res: any) => {});
/*
 cors default options:
 {
  "origin": "*",
  "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
  "preflightContinue": false,
  "optionsSuccessStatus": 204
}

 */

/*app.use(
  formidableMiddleware({
    //  uploadDir: './data/uploads/$type',
    multiples: true,
    keepExtensions: true,
    maxFileSize: 5 * 1024 * 1024,
    maxFieldsSize: 5 * 1024 * 1024 //the amount of memory all fields together (except files)
  })
);*/

export default app;
