import sharp, {
  Sharp,
  FormatEnum,
  AvailableFormatInfo,
  OutputOptions,
  JpegOptions,
  PngOptions,
  WebpOptions,
  AvifOptions,
  HeifOptions,
  GifOptions,
  TiffOptions
} from "sharp";
import { parsePath } from "@engineers/nodejs/fs";
import { existsSync } from "fs";

export { sharp };
export type Format = keyof FormatEnum | AvailableFormatInfo;
export type FormatOptions =
  | OutputOptions
  | JpegOptions
  | PngOptions
  | WebpOptions
  | AvifOptions
  | HeifOptions
  | GifOptions
  | TiffOptions;

export interface ResizeOptions {
  format?: Format;
  formatOptions?: FormatOptions;
  //todo: rename to: meta
  withMetadata?: boolean;
  output?:
    | string
    | boolean
    | ((img: Img, size: Size | Size[], options: any) => string);
  [key: string]: any;
}

//Sharp or sharp.Sharp
export type Img = string | Buffer | Sharp;
export type Size = number | string | null;
/**
 * [resize description]
 * @method resize
 * @param  {Img} img     file path or image buffer;
 * @param  {Size | Size[]} size    width or [width, height] or 'width,height', if size=null just convert img type
 * @param  {[type]} options [description]
 * @return Promise<info>
 *
 * todo:
 *  - rename size to dimensions
 *  - convert(img) = resize(img,size=null,{output=type})
 */
export function resize(
  img: Img,
  size: Size | Size[],
  options: ResizeOptions = {}
): Promise<any> {
  if (
    typeof img === "string" &&
    (img.indexOf("data:image/") === 0 || options.input === "base64")
  )
    img = Buffer.from(img.replace(/data:image\/.+?;base64,/, ""), "base64");

  if (!(img instanceof sharp)) img = sharp(<string | Buffer>img, options.sharp);
  img = <Sharp>img;

  if (options.output == "")
    Promise.reject(
      "options.output cannot be empty, to get a Buffer, remove this option or use options.output='buffer'."
    );

  //todo: img: Obj{width,height,..} -> sharp({create:{ .. }});
  if (!size) size = [null, null];
  else if (typeof size == "string") size = size.split(",");
  else if (typeof size == "number") size = [size, null];

  //passing (0) to img.resize() will not generate the image.
  //+el: to convert into number
  //don't use (size as number[]|string[]).map()  https://stackoverflow.com/a/49511416/12577650
  size = size.map((el: any) => (!el || el === 0 ? null : +el));

  //Include all metadata (EXIF, XMP, IPTC) from the input image in the output image
  if (options.withMetadata !== false) img = img.withMetadata();

  return img.metadata().then((metadata: any) => {
    //for typescript
    img = <Sharp>img;
    size = <Size[]>size;
    if (
      !size[0] &&
      !size[1] &&
      (!options.format || options.format == metadata.format)
    )
      Promise.reject(
        "width & height can be dismissed only when the image converted into another format, use options.format"
      );

    //@ts-ignore: type 'string | number | null' is not assignable to 'number | null | undefined'
    img = (<Sharp>img).resize(size[0], size[1], options.resize);
    if (options.format)
      img = (<Sharp>img).toFormat(options.format, options.formatOptions);
    if (options.output === "buffer" || !options.output)
      //@ts-ignore
      (<Promise<Buffer>>img) = (<Sharp>img).toBuffer();
    else if (options.output === "base64")
      //@ts-ignore
      (<Promise<string>>img) = (<Sharp>img)
        .toBuffer()
        .then(
          (data: any) =>
            `data:image/${options.format ||
              metadata.format};base64,${data.toString("base64")}`
        );
    else {
      if (typeof options.output == "function")
        options.output = options.output(img, <number[]>size, options);
      else if (options.output === true) {
        //automatically set the destination output
        let parts = parsePath(img);
        options.output = `${parts.dir}/${parts.file}_${size[0]}${
          size[1] ? "X" + size[1] : ""
        }${parts.extension}`;
      }
      //@ts-ignore
      (<Promise<any>>img) = (<Sharp>img)
        .toFile(options.output)
        .then((info: any) => ({ options, metadata, ...info }));
    }

    return img;
  });
}

/**
 * create resized version of an image.
 * @method resizeAll
 * @param  img    image path or Buffer
 * @param sizes    [array of sizes]
 * @return Promise<any>
 */

export function resizeAll(
  img: Img,
  sizes: Array<Size>,
  options: ResizeOptions
) {
  return Promise.all(
    sizes.map((size: Size) => (size: Size) => resize(img, size, options))
  );
}

export function convert(img: Img, options: string | ResizeOptions) {
  if (typeof options === "string")
    //@ts-ignore: Conversion of type 'string' to type 'ResizeOptions' may be a mistake
    (<ResizeOptions>options) = { format: <string>options };
  return resize(img, [null, null], <ResizeOptions>options);
}

//todo:
//export function convertAll(imgs,..);
