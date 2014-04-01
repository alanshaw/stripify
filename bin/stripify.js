#!/usr/bin/env node
var fs = require("fs")
  , path = require("path")
  , stripify = require("../")
  , file = process.argv[2]

if (file == "-h" || file == "--help") {
  return fs.createReadStream(path.join(__dirname, "usage.txt")).pipe(process.stdout)
}

var rs = null

if (file && file != "-") {
  rs = fs.createReadStream(file)
} else {
  rs = process.stdin
  file = path.join(process.cwd(), "-")
}

rs.pipe(stripify(file)).pipe(process.stdout)