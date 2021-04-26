const { Util, _parseInput, _getCallerDirName } = require('./util');
const sharp = require('./sharp');

function validateOptions(s, options) {
    if (!('createNonexistentDirectory' in options)) s.options.createNonexistentDirectory = true;
    return s;
}

function handleInput(input, bufferOrURL, options) {
    if (input === null) throw new TypeError(`ImageUtils bufferOrURL must be a Buffer, Uint8Array, Uint8ClampedArray, absolute file location or absolute URL, not "${
        bufferOrURL.constructor && bufferOrURL.constructor.name
        ? bufferOrURL.constructor.name
        : typeof bufferOrURL
    }".`)
    return validateOptions(sharp(input, options), options);
}

/**
 * An extension of Sharp's methods and accepted inputs.
 * @param {(Buffer|Uint8Array|Uint8ClampedArray|string)} [bufferOrURL] - if present, can be
 *  a Buffer / Uint8Array / Uint8ClampedArray containing JPEG, PNG, WebP, AVIF, GIF, SVG, TIFF or raw pixel image data, or
 *  a String containing the filesystem path to an JPEG, PNG, WebP, AVIF, GIF, SVG or TIFF image file.
 *  JPEG, PNG, WebP, AVIF, GIF, SVG, TIFF or raw pixel image data can be streamed into the object when not present.
 * @param {Object} [options] - if present, is an Object with optional attributes.
 * @param {boolean} [options.failOnError=true] - by default halt processing and raise an error when loading invalid images.
 *  Set this flag to `false` if you'd rather apply a "best effort" to decode images, even if the data is corrupt or invalid.
 * @param {number|boolean} [options.limitInputPixels=268402689] - Do not process input images where the number of pixels
 *  (width x height) exceeds this limit. Assumes image dimensions contained in the input metadata can be trusted.
 *  An integral Number of pixels, zero or false to remove limit, true to use default limit of 268402689 (0x3FFF x 0x3FFF).
 * @param {boolean} [options.sequentialRead=false] - Set this to `true` to use sequential rather than random access where possible.
 *  This can reduce memory usage and might improve performance on some systems.
 * @param {number} [options.density=72] - number representing the DPI for vector images in the range 1 to 100000.
 * @param {number} [options.pages=1] - number of pages to extract for multi-page input (GIF, WebP, AVIF, TIFF, PDF), use -1 for all pages.
 * @param {number} [options.page=0] - page number to start extracting from for multi-page input (GIF, WebP, AVIF, TIFF, PDF), zero based.
 * @param {number} [options.subifd=-1] - subIFD (Sub Image File Directory) to extract for OME-TIFF, defaults to main image.
 * @param {number} [options.level=0] - level to extract from a multi-level input (OpenSlide), zero based.
 * @param {boolean} [options.animated=false] - Set to `true` to read all frames/pages of an animated image (equivalent of setting `pages` to `-1`).
 * @param {Object} [options.raw] - describes raw pixel input image data. See `raw()` for pixel ordering.
 * @param {number} [options.raw.width] - integral number of pixels wide.
 * @param {number} [options.raw.height] - integral number of pixels high.
 * @param {number} [options.raw.channels] - integral number of channels, between 1 and 4.
 * @param {Object} [options.create] - describes a new image to be created.
 * @param {number} [options.create.width] - integral number of pixels wide.
 * @param {number} [options.create.height] - integral number of pixels high.
 * @param {number} [options.create.channels] - integral number of channels, either 3 (RGB) or 4 (RGBA).
 * @param {string|Object} [options.create.background] - parsed by the [color](https://www.npmjs.org/package/color) module to extract values for red, green, blue and alpha.
 * @param {Object} [options.create.noise] - describes a noise to be created.
 * @param {string} [options.create.noise.type] - type of generated noise, currently only `gaussian` is supported.
 * @param {number} [options.create.noise.mean] - mean of pixels in generated noise.
 * @param {number} [options.create.noise.sigma] - standard deviation of pixels in generated noise.
 * @returns {(sharp.Sharp|Promise<sharp.Sharp>)}
 */
function ImageUtils(bufferOrURL, options = {}) {
    const input = bufferOrURL ? _parseInput(bufferOrURL, _getCallerDirName(2)) : undefined;
    if (input instanceof Promise) return new Promise((resolve, reject) => {
        input
            .then(r => {
                resolve(handleInput(r, bufferOrURL, options))
            })
            .catch(reject);
    });
    const res = handleInput(input, bufferOrURL, options);
    // Simulate promise then-catch-finally
    Object.defineProperties(res, {
        then: { value(fn) { return fn(res) } },
        catch: { value() { return res } },
        finally: { value(fn) { return fn(res) } }
    })
    return validateOptions(res, options);
}

Object.defineProperties(ImageUtils, Object.getOwnPropertyDescriptors(Util));

module.exports = ImageUtils;