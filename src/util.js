const path = require('path');
const phin = require('phin');

function _parseInput(x, directory) {
    if (x instanceof Buffer) return x;
    if (x instanceof Uint8Array) return x;
    if (x instanceof Uint8ClampedArray) return x;
    if (typeof x === 'string') {
        if (path.isAbsolute(x)) return x;
        if (Util.isAbsoluteURL(x)) {
            return new Promise((resolve, reject) => {
                phin(x)
                    .then(res => {
                        if (res && res.body instanceof Buffer) return resolve(res.body);
                        resolve(x);
                    })
                    .catch(reject);
            })
        }
        return `${directory}/${x}`;
    }
    return null;
}

function _getCallerFileName(trace = 1) {
    const _prepareStackTrace = Error.prepareStackTrace;
	Error.prepareStackTrace = (_, stack) => stack;
	const stack = new Error().stack.slice(1);
	Error.prepareStackTrace = _prepareStackTrace;
    return stack[trace].getFileName()
}

function _getCallerDirName(trace) {
    return path.resolve(_getCallerFileName(trace), '..')
}

class Util {
    constructor() {
        throw new Error(`The ${this.constructor.name} class may not be instantiated.`);
    }

    /**
     * Checks if a given file name has an extension and returns that extension.
     * @param {string} filename - The name of the file which contains the extension.
     * @returns {string|null} - Returns the extension string (exluding the period) or null if there was no extension.
     */
    static ext(filename) {
        return (/\.(\w+)$/i.exec(filename) || [])[1] || null;
    }

    /**
     * Checks if a given file name has one of the extensions.
     * @param {string} filenameOrExt - The name of the file which contains the extension or the extension by itself.
     * @param {...string} exts - The extensions to check for.
     * @example Util.isExt('myFile.png', 'png', 'jpg', 'jpeg')
     * @returns {boolean}
     */
    static isExt(filenameOrExt, ...exts) {
        const ext = Util.ext(filenameOrExt) || filenameOrExt;
        const checkFor = Array.isArray(exts[0])
                        ? exts[0]
                        : exts
        for (const check of checkFor) {
            if (ext.toLowerCase() === check.toLowerCase()) return true;
        }
        return false;
    }

    /**
     * Checks if a given URL is valid and absolute, following RFC 3986's standard.
     * @param {string} url  - The URL to validate.
     * @returns {boolean}
     */
    static isAbsoluteURL(url) {
        return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(url);
    }
}

module.exports = {
    Util, _parseInput, _getCallerFileName, _getCallerDirName
}