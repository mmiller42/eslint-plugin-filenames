var path = require('path');

module.exports = function parseFilename(filename, getSuffix) {
    var ext = path.extname(filename);
    var name = path.basename(filename, ext);
    var lastDotIndex = name.lastIndexOf('.');

    return {
        dir: path.dirname(filename),
        base: path.basename(filename),
        ext: ext,
        name: getSuffix && lastDotIndex > -1 ? name.substr(0, lastDotIndex) : name,
        suffix: getSuffix && lastDotIndex > -1 ? name.substr(lastDotIndex + 1) : null
    }
};
