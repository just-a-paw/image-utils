const fs = require('fs');
const sharp = require('sharp');
const path = require('path');
const { _getCallerDirName } = require('./util');

const {toFile} = sharp.prototype;

const extended = {
    toFile(...args) {
        if (!path.isAbsolute(args[0])) args[0] = path.resolve(_getCallerDirName(2), args[0]);
        if (this.options.createNonexistentDirectory === true) {
            const dir = path.resolve(args[0], '..');
            if (!fs.existsSync(dir)) fs.mkdirSync(dir);
        }
        return toFile.call(this, ...args);
    }   
}

Object.defineProperties(sharp.prototype, Object.getOwnPropertyDescriptors(extended));

module.exports = sharp;