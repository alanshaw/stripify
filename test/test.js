var fs = require('fs')
var path = require('path')
var test = require('tape')
var concat = require('concat-stream')
var stripify = require('../')

var files = fs.readdirSync(path.join(__dirname, 'fixtures'))
var testOpts = {
  'replacement.js': {r: '(0)'}
}

files.forEach(function (file) {
  test('Test ' + file, function (t) {
    t.plan(2)

    var filePath = path.join(__dirname, 'fixtures', file)
    var opts = testOpts[file]

    fs.createReadStream(filePath)
      .pipe(stripify(filePath, opts))
      .pipe(concat({encoding: 'string'}, function (stripped) {
        fs.readFile(path.join(__dirname, 'expected', file), 'utf8', function (err, expectation) {
          t.ifError(err, 'No error reading expectation file')
          t.equal(stripped, expectation, 'Transformed file contents equal expected file contents')
          t.end()
        })
      }))
  })
})
