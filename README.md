stripify [![Build Status](https://travis-ci.org/alanshaw/stripify.svg)](https://travis-ci.org/alanshaw/stripify) [![Dependency Status](https://david-dm.org/alanshaw/stripify.svg?theme=shields.io)](https://david-dm.org/alanshaw/stripify)
====
Browserify transform that strips `console.log` lines from your code.

This module for [browserify](http://browserify.org/) will remove `console.log`, `console.info`, `console.warn`, `console.error`, `debugger` [and friends](https://developer.mozilla.org/en-US/docs/Web/API/console) from your js files.

Example
---

For example.js:

```js
var foo = "bar"
console.log(foo + " bar")
foo = "foo"
```

then on the command line:

```sh
browserify -t stripify example.js > bundle.js
```

or with the api:

```js
var browserify = require("browserify")
  , fs = require("fs")

var b = browserify("example.js")
b.transform("stripify")

b.bundle().pipe(fs.createWriteStream("bundle.js"))
```

the bundle file output is:

```js
var foo = "bar"

foo = "foo"
```

Usage
---

```sh
npm install stripify
```

As with all browserify transforms, stripify returns a through/transform stream.

```js
var fs = require("fs")
  , stripify = require("stripify")
  , src = "/path/to/file.js"
  , dest = "/path/to/file-transformed.js"
  , ts = stripify(src)

fs.createReadStream(src).pipe(ts).pipe(fs.createWriteStream(dest))
```

### Command line
You can use stripify on the command line as well:

```sh
npm install -g stripify
stripify /path/to/file.js
```

Output is written to stdout.

### Options

#### `--replacement=STATEMENT, -r STATEMENT`

Stripify will remove `console.log` statements by default. If you've put a log statement in a weird place, removing it could cause a syntax error. The `replacement` option allows you to specify a replacement statement.

e.g.

```sh
echo "console.log('foo')" | stripify -r '(0)' # Outputs (0)
```

```sh
browserify main.js -t [stripify -r '(0)']
```

```js
var stripify = require("stripify")
stripify("file.js", {replacement: '(0)'})
```
