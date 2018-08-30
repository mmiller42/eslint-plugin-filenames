# eslint-plugin-filenames-suffix

Adds [eslint](http://eslint.org/) rules to ensure consistent filenames for your javascript files.

__Please note__: This plugin will only lint the filenames of the `.js`, `.jsx` files you are linting with eslint. It will ignore other files that are not linted with eslint.

## Enabling the plugin

This plugin requires a version of `eslint>=1.0.0` to be installed as a peer dependency.

Modify your `.eslintrc` file to load the plugin and enable the rules you want to use.

```json
{
  "plugins": [
    "filenames-suffix"
  ],
  "rules": {
    "filenames-suffix/match-regex": 2,
    "filenames-suffix/match-exported": 2,
    "filenames-suffix/no-index": 2
  }
}
```

## Rules

### Consistent Filenames via regex (match-regex)

A rule to enforce a certain file naming convention using a regular expression.

The convention can be configured using a regular expression (the default is `camelCase.js`). Additionally
exporting files can be ignored with a second configuration parameter.

```json
"filenames-suffix/match-regex": [2, "^[a-z_]+$", true]
```

With these configuration options, `camelCase.js` will be reported as an error while `snake_case.js` will pass.
Additionally the files that have a named default export (according to the logic in the `match-exported` rule) will be
ignored.  They could be linted with the `match-exported` rule.

### Matching Exported Values (match-exported)

Match the file name against the default exported value in the module. Files that dont have a default export will
be ignored. The exports of `index.js` are matched against their parent directory.

```js
// Considered problem only if the file isn't named foo.js or foo/index.js
export default function foo() {}

// Considered problem only if the file isn't named Foo.js or Foo/index.js
module.exports = class Foo() {}

// Considered problem only if the file isn't named someVariable.js or someVariable/index.js
module.exports = someVariable;

// Never considered a problem
export default { foo: "bar" };
```

If your filename policy doesn't quite match with your variable naming policy, you can add a tansform:

```json
"filenames-suffix/match-exported": [2, "kebab"]
```

Now, in your code:

```js
// Considered problem only if file isn't named variable-name.js or variable-name/index.js
export default function variableName;
```

Available transforms:
'[snake](https://www.npmjs.com/package/lodash.snakecase)',
'[kebab](https://www.npmjs.com/package/lodash.kebabcase)', and
'[camel](https://www.npmjs.com/package/lodash.camelcase)'

In addition to applying a transform, you can also allow files to have suffixes. A suffix describes the type
of module the file exports. A suffix is a singular word that is separated from the filename by a `.` and
precedes the file extension, e.g. `filename.suffix.ext`. By default a file with a suffix must reside in a directory
whose name is the plural version of the suffix, or a subdirectory therein. So for example, if suffixes are
enabled and a file is named `example.component.jsx`, it must live in a directory named `components` or a
subdirectory of it.

```json
"filenames-suffix/match-exported": [2, "kebab", "check-suffix"]
```

`index` files do not require a suffix.

One may want to have suffices but not to have them checked against their parent directories.

```json
"filenames-suffix/match-exported": [2, "kebab", "has-suffix"]
```

Some projects may require that exported entities have a suffix being part of their name like:

```javascript
// side-nav.component.js
export default class SideNavComponent{}
```

To validate exported class or function name one can use `check-suffix-exported` option:

```json
"filenames-suffix/match-exported": [2, "kebab", "has-suffix", "check-suffix-exported"]
```

### Don't allow index.js files (no-index)

Having a bunch of `index.js` files can have negative influence on developer experience, e.g. when
opening files by name. When enabling this rule. `index.js` files will always be considered a problem.

## Changelog

#### 1.1.0
- Introduce `transform` option for `match-exported`

#### 1.0.0
- Split rule into `match-regex`, `match-exported` and `no-index`

#### 0.2.0
- Add match-exported flags

#### 0.1.2
- Fix example in README

#### 0.1.1
- Fix: Text via stdin always passes
- Tests: Travis builds also run on node 0.12 and iojs now

#### 0.1.0
- Initial Release
