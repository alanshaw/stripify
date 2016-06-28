var through = require("through2")
  , falafel = require("falafel")
  , acorn = require("acorn")

module.exports = function (file, opts) {
  if (/\.json$/.test(file)) return through()

  opts = opts || {}
  opts.replacement = opts.replacement || opts.r || ""

  var data = ""

  return through(
    function (buf, enc, cb) {
      data += buf
      cb()
    },
    function (cb) {
      try {
        this.push(String(parse(data, opts)))
      } catch (er) {
        return cb(new Error(er.toString().replace("Error: ", "") + " (" + file + ")"))
      }
      cb()
    }
  )
}

function parse (data, opts) {
  return falafel(data, {
    parser: acorn
  }, function (node) {
    if (node.type != "DebuggerStatement" && (node.type != "CallExpression" || !isConsoleLog(node.callee))) return;
    node.update(opts.replacement)
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

var consoleApi = ["assert", "count", "debug", "dir", "error", "exception", "group", "groupCollapsed", "groupEnd", "info", "log", "profile", "profileEnd", "time", "timeEnd", "trace", "warn", "table"]

function isLog (node) {
  return node.type == "Identifier"
    && (consoleApi.indexOf(node.name) > -1)
}
