var through = require("through2")
  , falafel = require("falafel")

var preserveMessage = '!Stripify:Preserve!'

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
  return falafel(data, function (node) {
    if (node.type != "DebuggerStatement" && (node.type != "CallExpression" || !isConsoleLog(node.callee))) return;

    // If a console message begins with '!Stripify:Preserve!', then we don't want to remove the log,
    // But we do need to remove the '!Stripify:Preserve!' from the log message itself.
    if (node.arguments && node.arguments.length > 0 && node.arguments[0].value && node.arguments[0].value.indexOf(preserveMessage) === 0) {
      node.arguments[0].update(node.arguments[0].source().replace(preserveMessage, ''))
      return;
    }

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
