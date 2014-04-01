var fs = require("fs")
  , path = require("path")
  , assert = require("assert")
  , async = require("async")
  , concat = require("concat-stream")
  , stripify = require("../")

fs.readdir(path.join(__dirname, "fixtures"), function (er, files) {
  if (er) throw er

  var tasks = files.map(function (file) {
    return function (cb) {
      var filePath = path.join(__dirname, "fixtures", file)

      fs.createReadStream(filePath)
        .pipe(stripify(filePath))
        .pipe(concat(function (stripped) {
          fs.readFile(path.join(__dirname, "expectations", file), function (er, expectation) {
            if (er) throw er
            assert.equal(stripped, expectation, file)
            cb()
          })
        }))
    }
  })

  async.series(tasks, function (er) {
    if (er) throw er
  })
})