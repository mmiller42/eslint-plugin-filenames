/**
 * @fileoverview Rule to ensure that filenames match the exports of the file
 * @author Stefan Lau
 */

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

var path = require('path'),
    inflection = require('inflection'),
    parseFilename = require('../common/parseFilename'),
    isIgnoredFilename = require('../common/isIgnoredFilename'),
    getExportedName = require('../common/getExportedName'),
    isIndexFile = require('../common/isIndexFile'),
    transforms = {
        kebab: require('lodash.kebabcase'),
        snake: require('lodash.snakecase'),
        camel: require('lodash.camelcase')
    };

function getStringToCheckAgainstExport(parsed) {
    var dirArray = parsed.dir.split(path.sep);
    var lastDirectory = dirArray[dirArray.length - 1];

    if (isIndexFile(parsed)) {
        return lastDirectory;
    } else {
        return parsed.name;
    }
}

function transform(exportedName, transformName) {
    var transform = transforms[transformName];

    return transform ? transform(exportedName) : exportedName;
}

module.exports = function(context) {
    return {
        "Program": function (node) {
            var transformName = context.options[0],
                useSuffix = context.options[1] === 'check-suffix',
                filename = context.getFilename(),
                absoluteFilename = path.resolve(filename),
                parsed = parseFilename(absoluteFilename, useSuffix),
                shouldIgnore = isIgnoredFilename(filename),
                exportedName = getExportedName(node),
                isExporting = Boolean(exportedName),
                expectedExport = getStringToCheckAgainstExport(parsed),
                transformed = transform(exportedName, transformName),
                everythingIsIndex = exportedName === 'index' && parsed.name === 'index',
                matchesExported = transformed === expectedExport || everythingIsIndex,
                reportIf = function (condition, messageForNormalFile, messageForIndexFile) {
                    var message = (!messageForIndexFile || !isIndexFile(parsed)) ? messageForNormalFile : messageForIndexFile;

                    if (condition) {
                        context.report(node, message, {
                            name: parsed.base,
                            expectedExport: expectedExport,
                            exportName: transformed,
                            extension: parsed.ext
                        });
                    }
                };

            var isSuffixOk = true;
            if (useSuffix && isExporting && matchesExported) {
                var parts = path.dirname(absoluteFilename).split(path.sep);
                if (parsed.suffix) {
                    isSuffixOk = parts.includes(parsed.suffix) || parts.includes(inflection.pluralize(parsed.suffix));
                } else {
                    isSuffixOk = parsed.name === 'index';
                }
            }

            if (shouldIgnore) return;
            reportIf(
                (isExporting && !matchesExported) || !isSuffixOk,
                "Filename '{{expectedExport}}' must match the exported name '{{exportName}}'.",
                "The directory '{{expectedExport}}' must be named '{{exportName}}', after the exported value of its index file."
            );
        }
    }
};

module.exports.schema = [
    {
        "enum": ["none", "kebab", "snake", "camel"]
    },
    {
        "enum": ["check-suffix", "no-suffix"]
    }
];
