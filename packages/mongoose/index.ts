// todo: export default mongoose (instead of export every method separately) i.e import mongoose, not import * as mongoose ..
import mongoose from "mongoose";
import shortId from "shortid";
import { setTimer, endTimer } from "@engineers/nodejs/timer";
import { arrayChunk } from "@engineers/nodejs/objects";
export { mongoose };

/*
todo: export single properties from mongoose
import { exportAll } from "./utils";
exportAll(mongoose);
*/

const dev = process.env.NODE_ENV === "development";

export namespace types {
  // todo: merge `namespace types` from ./index.d.ts
  export interface Object {
    [key: string]: any;
  }

  export interface ConnectionOptions extends mongoose.ConnectionOptions {
    dbName?: string;
    multiple?: boolean; //don't create a new connection if there are connections already open
  }
  export interface Model extends types.Object {
    fields?: types.Object;
    methods?: [];
    virtuals?: [];
    indexes?: []; // or:{indexName: value}
    // todo: add model properties
  }
  export interface Host {
    [host: string]: number; // { host1: port1 }
  }
  export type uri =
    | string
    | {
        auth: string[]; //https://github.com/microsoft/TypeScript/issues/38652
        host?: string | Host[];
        srv?: boolean;
        dbName?: string;
      };
  //-->deprecated:
  //| [string, string, string | string[], boolean, string]; // [user,pass,host,srv,dbName]

  export type BackupFilter = (db?: string, collection?: string) => boolean;
  export interface Obj {
    [key: string]: any;
  }

  export interface BackupData {
    info: Obj;
    backup: {
      [db: string]: {
        [collection: string]: {
          data: Obj[];
          info?: Obj;
          schema?: Obj;
          modelOptions?: Obj;
        };
      };
    };
  }
}

/*
Object.keys(mongoose).forEach(key => {
  exports[key] = mongoose[key]; //todo: ES export i.e export key = mongoose[key]
});*/

export function connect(uri: types.uri, options: types.ConnectionOptions = {}) {
  if (!options.multiple && mongoose.connection.readyState > 0) {
    console.log("[mongoose] already connected");
    return Promise.resolve(mongoose.connection);
  }

  delete options.multiple;

  setTimer("connect");
  const defaultOptions = {
    // todo: export static defaultConnectionOptions={..}
    useCreateIndex: true,
    useNewUrlParser: true, // https://mongoosejs.com/docs/deprecations.html; now it gives "MongoError: authentication fail"
    useFindAndModify: false,
    bufferCommands: false, // https://mongoosejs.com/docs/connections.html
    autoIndex: false,
    useUnifiedTopology: true,
    retryWrites: true,
    w: "majority",
    keepAlive: true
  };

  let srv: boolean;
  if (typeof uri !== "string") {
    /* -->deprecated
    if (uri instanceof Array) {
      uri = {
        auth: [uri[0], uri[1]],
        host: uri[2],
        srv: uri[3],
        dbName: uri[4]
      };
    } */

    srv = !!uri.srv;
    if (!uri.host) {
      uri.host = "localhost:27017";
    } else if (uri.host instanceof Array) {
      uri.host = uri.host.join(",");
    }

    uri = `${encode(uri.auth[0])}:${encode(uri.auth[1])}@${uri.host}/${
      uri.dbName
    }`;
  } else srv = false;

  if ((uri as string).substr(0, 7) != "mongodb") {
    uri = "mongodb" + (srv ? "+srv" : "") + "://" + uri;
  }

  options = Object.assign(options || {}, defaultOptions);
  if (dev) console.log("[mongoose]", { uri, options });

  // todo: return Promise<this mongoose, not Mongoose>
  return mongoose.connect(uri as string, options).then(c => {
    //this will log in both dev & prod mode to track the connection execution time.
    console.log("[mongoose] connected", endTimer("connect"));
    return c;
  });
}

export interface SchemaOptions extends mongoose.SchemaOptions {
  shortId?: boolean;
}
export function model(
  collection: string | typeof mongoose.Model,
  obj: types.Model = {},
  options: SchemaOptions = {},
  con?: string | typeof mongoose | mongoose.Connection //example: db = mongoose.connection.useDb('dbName')
) {
  // todo: merge schema's defaultOptions

  //note that creating a new connection useing ...useDb() will reset con.models{},
  //so it is better to pass con as a connection (i.e ..useDn()) instead of dbName (i.e string)
  //if you want to reuse models instead of creating a new one each time
  con = con
    ? typeof con === "string"
      ? mongoose.connection.useDb(con)
      : con
    : mongoose;

  //todo: option.force -> remove the existing model and create a new one
  if (
    typeof collection !== "string" &&
    collection.prototype instanceof mongoose.Model
  )
    return collection;

  //todo: if opt.override delete the existing one
  if (con.models[<string>collection]) return con.models[<string>collection];
  let schema: mongoose.Schema;

  if (!("fields" in obj)) obj = { fields: obj };

  options.collection = <string>collection;
  if (!("timestamps" in options)) options.timestamps = true; //add createdAt, updatedAt https://mongoosejs.com/docs/guide.html#timestamps

  //@ts-ignore: object possibly undefined
  if (options.shortId !== false && !("_id" in obj?.fields)) {
    //@ts-ignore
    obj.fields._id = { type: String, default: shortId.generate };
    delete options.shortId;
  }
  schema = new mongoose.Schema(obj.fields, options);
  // todo: add methods,virtuals,...

  //to get schema: model.schema
  //@ts-ignore: This expression is not callable. Each member of the union type ... has signatures, but none of those signatures are compatible with each other.
  return (con as typeof mongoose | mongoose.Connection).model(
    <string>collection,
    schema
  );
}

export function encode(str: string) {
  return encodeURIComponent(str); //.replace(/%/g, "%25");
}

/**
 * useDb and return mongoDB native db
 * @method useDb
 * @param  dbName [description]
 * @return [description]
 */
export function useDb(dbName: string = "") {
  //@ts-ignore: client dosen't exist in Connection
  return mongoose.connection.useDb(dbName).client.db(dbName);
}

export function admin(dbName: string = "") {
  //return new (mongoose.mongo.Admin)((connection || mongoose.connection).db);
  //@ts-ignore: admin dosen't exist in Connection
  return useDb(dbName).admin();
}

export function dbs(systemDbs = false) {
  return admin()
    .listDatabases()
    .then((dbs: any) =>
      systemDbs
        ? dbs.databases
        : dbs.databases.filter(
            (db: any) => !["admin", "local"].includes(db.name)
          )
    );
}

export function collections(dbName?: string) {
  //mongoose.connection.db.listCollections().toArray()
  return useDb(dbName)
    .listCollections()
    .toArray();
}

/**
 * [backup description]
 * usage: connect(..).then(con=>backup(con,...))
 * @method backup
 * @param  connection the connection returned from mongoose.connect()
 * @param  filter:Filter     a filter strategy for databases/collections/fields to be fetched
 * @return {promise<Data>}   { dbName: { collectionName:{data} }}
 */
export function backup(
  connection: any, //todo: mongoose.connection || MongoClient
  filter: types.BackupFilter = () => true
): Promise<types.BackupData> {
  //convert [{k:v}] to {k:v}
  let extract: any = (arr: any) =>
    arr.reduce(
      (obj: any, item: any) => ({
        ...obj,
        [Object.keys(item)[0]]: item[Object.keys(item)[0]]
      }),
      {}
    );

  return dbs().then((dbs: any) =>
    Promise.all(
      dbs
        .filter((db: any) => filter(db.name))
        .map(async (db: any) => ({
          [db.name]: await collections(db.name).then((collections: any) =>
            Promise.all(
              collections
                .filter((coll: any) => filter(db.name, coll.name))
                .map(async (coll: any) => ({
                  [coll.name]: {
                    coll,
                    data: await useDb(db.name)
                      .collection(coll.name)
                      .find({})
                      .toArray()
                  }
                }))
            ).then((result: any) => extract(result))
          )

          //.catch(error => ({}))
        }))
    ).then((result: any) => extract(result))
  );
}

/**
 * [restore description]
 * @method restore
 * @param  backupData [description]
 * @return [description]
 *
 * notes:
 * - to insert the data into another database just rename dbName.
 *   ex:
 *       data.backup.newDbName = data.backup.oldDbName
 *       delete data.backup.oldDbName
 *   todo: return promise<{dbName:report}>
 */
export function restore(backupData: types.BackupData, chunkSize: number = 50) {
  for (let dbName in backupData.backup) {
    let con = mongoose.connection.useDb(dbName);
    let db = backupData.backup[dbName];
    for (let collName in db) {
      let coll = db[collName],
        data = coll.data,
        modelOptions = Object.assign(coll.modelOptions || {}, {
          timestamps: true,
          strict: false,
          validateBeforeSave: false
        });

      let dataModel = model(collName, coll.schema || {}, modelOptions, con);
      if (chunkSize && data.length > chunkSize) {
        data = arrayChunk(data, chunkSize);
        let chunks = data.length;
        data.map((part, index) =>
          dataModel
            .insertMany(part)
            .then(() =>
              console.log(`${collName}: part ${index + 1}/${chunks} inserted`)
            )
            .catch((err: any) => console.error(`error in ${collName}:`, err))
        );
      } else
        dataModel
          .insertMany(data)
          .then(() => console.log(`${collName}: inserted`))
          .catch((err: any) => console.error(`error in ${collName}:`, err));
    }
  }
}

/**
 * quickly perform database operations via an API call.
 * this fuction is useful to dynamically perform operations, for example via an API request.
 * @example: GET /api/v1/find/articles
 * @example: GET /api/v1/find/articles/$articleId
 * @example: GET /api/v1/find/articles/[{"status":"approved"},null,{"limit":1}]
 * @method query
 * @param  operation  operation name, ex: find
 * @param  modelObj   model object (as accepted in @engineers/mongoose model()) or collection name as string
 * @param  params  every operation has it's own params, for example find accepts filter, docs, options
 * @return {}
 */
export function query(
  operation: string,
  collection: string | Array<any> | typeof mongoose.model,
  params: Array<any> = []
) {
  if (dev) console.log("[server] query", { operation, collection, params });

  let contentModel =
    collection instanceof Array
      ? model(collection[0], collection[1], collection[2], collection[3]) //todo: model(...collection) gives error
      : model(<string | typeof mongoose.Model>collection);

  if (typeof params[0] === "string") {
    if (operation === "find") operation = "findById";
    else if (["update", "delete"].includes(operation)) operation += "One";
    if (operation.indexOf("One")) params[0] = { _id: params[0] };
  }
  //@ts-ignore
  return contentModel[operation as keyof typeof contentModel](...params).lean();
}
