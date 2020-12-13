import {
  connect as _connect,
  model,
  mongoose,
  types
} from "@engineers/mongoose";
import { schemas, DB } from "~config/server";

/**
 * connect to the database using 'config'
 * @method connect
 * @param  uri
 * @return
 */
export function connect(uri?: types.uri) {
  if (!uri)
    uri = {
      auth: DB.auth,
      host: DB.host,
      srv: DB.srv,
      dbName: DB.dbName
    };

  return _connect(uri, { multiple: false });
}

/**
 * close all connections;  OR: mongoose.connection.close()
 * @method disconnect
 * @return [description]
 */
export function disconnect() {
  return mongoose.disconnect();
}

/**
 * convert an object to a mongoose model
 * @method getModel
 * @param  collection   [description]
 * @param  schemaObj={} [description]
 * @return [description]
 */
export function getModel(collection: any, schemaObj = {}) {
  //console.log("model: " +{ type, models: mongoose.models, modelNames: mongoose.modelNames() });
  //todo: schemas/mongoose.ts

  if (!schemaObj) {
    //schemaName is the same as collection name (except if [collection]_categories)
    //ex: articles_categories, jobs_categories
    let schemaName = collection.indexOf("_categories")
      ? "categories"
      : collection;
    schemaObj =
      schemaName in schemas
        ? schemas[schemaName as keyof typeof schemas]
        : schemas["basic"] || {};
  }

  return model(collection, schemaObj, { strict: false });
}
