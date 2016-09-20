#!/usr/bin/env node
var fs = require('fs')
var path = require('path')
var stripify = require('../')
var argv = require('minimist')(process.argv.slice(2))
var file = argv._[0]

if (argv.h || argv.help) {
  fs.createReadStream(path.join(__dirname, 'usage.txt')).pipe(process.stdout)
} else {
  var rs = null

  if (file && file !== '-') {
    rs = fs.createReadStream(file)
  } else {
    rs = process.stdin
    file = path.join(process.cwd(), '-')
  }

  rs.pipe(stripify(file, argv)).pipe(process.stdout)
}
