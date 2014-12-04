var fs = require("fs")
  , path = require("path")
  , test = require("tape")
  , concat = require("concat-stream")
  , stripify = require("../")

var files = fs.readdirSync(path.join(__dirname, "fixtures"))
var testOpts = {
  "replacement.js": {r: "(0)"}
}

files.forEach(function (file) {
  test("Test " + file, function (t) {
    t.plan(2)

    var filePath = path.join(__dirname, "fixtures", file)
    var opts = testOpts[file]

    fs.createReadStream(filePath)
      .pipe(stripify(filePath, opts))
      .pipe(concat({encoding: 'string'}, function (stripped) {
        fs.readFile(path.join(__dirname, "expected", file), "utf8", function (er, expectation) {
          t.ifError(er, "No error reading expectation file")
          t.equal(stripped, expectation, "Transformed file contents equal expected file contents")
          t.end()
        })
      }))
  })
})