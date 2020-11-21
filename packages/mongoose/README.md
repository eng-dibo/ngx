# @engineers/mongoose

[mongoose](https://www.npmjs.com/package/mongoose) is a [MongoDB](https://www.mongodb.org/) object modeling tool designed to work in an asynchronous environment. Mongoose supports both promises and callbacks.

this package automates most of mongoose work.
also it supports full backup and restore functionality.

# install

install the package and it's peer dependencies:

```
npm i @engineers/mongoose
npm i mongoose@^5.9.17 shortid@^2.2.15
```

### connect()

creats a new connection to a database, or reuse the connection if you already created one.

this function almost does what the original `mongoose.connect()` do with some key differences:

- it modifies the default options of `mongoose`
- if there is a connection, it doesn't create a new one unless you provide the option 'multiple', so you keep the number of the connections under the 100 limit connections and speed up your app.
- provide the uri as a string or as an object contains host, auth, dbName, ...
- it returns a promise instead of using callbacks.
- it automatically encodes your credentials to prevent a connection error from mongoDB.

```
const defaultOptions = {
  useCreateIndex: true,
  useNewUrlParser: true, //https://mongoosejs.com/docs/deprecations.html; now it gives "MongoError: authentication fail"
  useFindAndModify: false,
  bufferCommands: false, //https://mongoosejs.com/docs/connections.html
  autoIndex: false,
  useUnifiedTopology: true,
  retryWrites: true,
  w: "majority",
  keepAlive: true
}
```

### model()

create a mongoose schema and model from a plain object.

if there is a model already created with the same name, it will not create a new model unless you provide the option 'force'.

example:

```
import {connect, model} from '@engineers/mongoose'

let uri = {auth:['username', 'password'], host:'myhost-gbdqa.gcp.mongodb.net"'}

connect(uri).then(()=>{
  let articlesModel = model('articles, {
    title: String,
    content: String,
    author: { type: String, ref: "authors" },
    })

    articlesModel.find({}).then(data => console.log(data))
  })

```

to perform a full backup.

```
connect(uri)
.then(connection=>backup(connection, () => true))
.then(data=>console.log('the full backup just finished',data))
```

the second parameter is a function to filter witch databases or collections or documents to be included in the backup.

to restore this data into the database (or another database), use `restore()`.

### query()

you can perform any arbitrary query by using the function `query()`.
and it's signature is:

```
query( operation, collection, params )
```

for example to perform a find operation, to find some documents from 'articles' collections with limit option = 20

```
connect(uri).then(()=>{
  query('find','articles',{ limit: 20 })
  })
```

this function is useful for example to perform arbitrary queries on the fly using API calls. (example /query/find/articles?limit=20).

the parameter `params` is the params that passed to the operator.

### other functions

```
encode('username@#');

useDb('anotherDB');

admin();

dbs(); //list all databases
collections(); //list all collections of the current database.
collections('anotherDatabase')
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
