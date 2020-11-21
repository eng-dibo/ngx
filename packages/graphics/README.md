# @engineers/graphics.

use this package to work with images.
built on top of [`sharp`](https://www.npmjs.com/package/sharp)

## install

install the package and it's peer dependencies:

```
npm i @engineers/graphics
npm i sharp@^0.26.3
```

## examples

resize an image on the fly.

```
import {resize} from '@engineers/graphics';
import express from 'express';

const app = express()
app.get('/image/:name',(req,res)=>{


  //you can pass a query `?format=png`, if no format provided we will attempt to use 'webp' to save bandwith if the browser supports it, if not, we will use `jpeg`.

  let format = <string>req.query.size;
  if(!format)format = req.headers.accept.indexOf("image/webp") !== -1 ? "webp" : "jpeg";

  resize(`./images/${req.params.name}`,'500x500',{ format: req.query})
  .then(data=>{
    res.writeHead(200, {
      "Content-Type": `image/${format}`,
      "Cache-Control": "max-age=31536000"
    });

    res.write(data);
    res.end();
    })
})
```

convert an image from `png` format to `jpeg`, and keep the original dimensions:

```
import {convert} from '@engineers/graphics'

convert('photo.png','jpeg')
```

resize an image to 500px width, and keep the aspect ratio.
`resize()` will automatically calculate the height.

```
resize('photo.jpg',500)
```

resize an image into multiple dimensions

```
resizeAll('photo.jpg',['750x750','500x500', '250x250']);

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
