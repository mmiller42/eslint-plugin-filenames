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

function getExportedNameAndSuffix(exportedName) {
    // the easiest with kebabcase
    var parsed = transforms.kebab(exportedName),
        suffix = parsed.split('-').pop();

    return [parsed.slice(0, -suffix.length), suffix];
}

module.exports = function(context) {
    return {
        "Program": function (node) {
            var transformName = context.options[0],
                suffixOption = context.options[1],
                checkSuffix = suffixOption === 'check-suffix',
                hasSuffix = suffixOption === 'has-suffix', // we may ignore suffix if it's present
                checkSuffixExported = context.options[2] === 'check-suffix-exported',
                filename = context.getFilename(),
                absoluteFilename = path.resolve(filename),
                parsed = parseFilename(absoluteFilename, checkSuffix || hasSuffix),
                shouldIgnore = isIgnoredFilename(filename),
                _exportedName = getExportedName(node),
                exportedNameAndSuffix = checkSuffixExported && getExportedNameAndSuffix(_exportedName),
                exportedName = checkSuffixExported ? exportedNameAndSuffix[0] : _exportedName,
                exportedSuffix = checkSuffixExported && exportedNameAndSuffix[1],
                isExporting = Boolean(exportedName),
                expectedExport = getStringToCheckAgainstExport(parsed),
                transformed = transform(exportedName, transformName),
                everythingIsIndex = exportedName === 'index' && parsed.name === 'index',
                matchesExported = transformed === expectedExport || everythingIsIndex,
                reportIf = function (condition, messageForNormalFile, messageForIndexFile, messageForFileWithSuffix) {
                    var message = isIndexFile(parsed)
                        ? messageForIndexFile
                        : (!checkSuffixExported)
                        ? messageForNormalFile
                        : messageForFileWithSuffix;

                    if (condition) {
                        context.report(node, message, {
                            name: parsed.base,
                            expectedExport: expectedExport,
                            expectedSuffix: parsed.suffix,
                            exportName: transformed,
                            exportSuffix: exportedSuffix,
                            extension: parsed.ext
                        });
                    }
                };

            var isSuffixOk = true;
            if ((checkSuffix || checkSuffixExported) && isExporting && matchesExported) {
                var parts = path.dirname(absoluteFilename).split(path.sep);
                if (parsed.suffix) {
                    if (!hasSuffix) {
                        isSuffixOk = parts.includes(parsed.suffix) || parts.includes(inflection.pluralize(parsed.suffix));
                    }
                    if (checkSuffixExported) {
                        isSuffixOk = isSuffixOk && exportedNameAndSuffix[1] === parsed.suffix;
                    }
                } else {
                    isSuffixOk = parsed.name === 'index';
                }
            }

            if (shouldIgnore) return;
            reportIf(
                (isExporting && !matchesExported) || !isSuffixOk,
                "Filename '{{expectedExport}}' must match the exported name '{{exportName}}'.",
                "The directory '{{expectedExport}}' must be named '{{exportName}}', after the exported value of its index file.",
                "Filename's '{{expectedExport}}' suffix '{{expectedSuffix}}' must match the exported name suffix '{{exportSuffix}}'."
            );
        }
    }
};

module.exports.schema = [
    {
        "enum": ["none", "kebab", "snake", "camel"]
    },
    {
        "enum": ["check-suffix", "has-suffix", "no-suffix"]
    },
    {
        "enum": ["check-suffix-exported"]
    }
];
