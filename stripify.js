var through = require("through")
  , falafel = require("falafel")

module.exports = function (file) {
  if (/\.json$/.test(file)) return through()

  var data = ""

  return through(
    function (buf) {
      data += buf
    },
    function () {
      try {
        this.queue(String(parse(data)))
      } catch (er) {
        this.emit("error", new Error(er.toString().replace("Error: ", "") + " (" + file + ")"))
      }
      this.queue(null)
    }
  )
}

function parse (data) {
  return falafel(data, function (node) {
    if (node.type != "CallExpression" || !isConsoleLog(node.callee)) return;
    node.update("")
  })
}

function isConsoleLog (node) {
  return isConsole(node) && isLog(node.property)
}

function isConsole (node) {
  if (!node) return false
  if (node.type != "MemberExpression") return false
  return node.object.type == "Identifier" && node.object.name == "console"
}

function isLog (node) {
  return node.type == "Identifier"
    && (node.name == "log"
    ||  node.name == "info"
    ||  node.name == "warn"
    ||  node.name == "error")
}