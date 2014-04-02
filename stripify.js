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
    if (node.type != "DebuggerStatement" && (node.type != "CallExpression" || !isConsoleLog(node.callee))) return;
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

var consoleApi = ["assert", "count", "debug", "dir", "error", "exception", "group", "groupCollapsed", "groupEnd", "info", "log", "profile", "profileEnd", "time", "timeEnd", "trace", "warn"]

function isLog (node) {
  return node.type == "Identifier"
    && (consoleApi.indexOf(node.name) > -1)
}