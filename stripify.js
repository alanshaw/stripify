var through = require('through2')
var falafel = require('falafel')

module.exports = function (file, opts) {
  if (/\.json$/.test(file)) return through()

  opts = opts || {}
  opts.replacement = opts.replacement || opts.r || ''
  opts.methods = opts.methods || opts.m || consoleApi

  var data = ''

  return through(
    function (buf, enc, cb) {
      data += buf
      cb()
    },
    function (cb) {
      try {
        this.push(String(parse(data, opts)))
      } catch (er) {
        return cb(new Error(er.toString().replace('Error: ', '') + ' (' + file + ')'))
      }
      cb()
    }
  )
}

function parse (data, opts) {
  return falafel(data, function (node) {
    if (node.type !== 'DebuggerStatement' && (node.type !== 'CallExpression' || (!isConsoleMethod(node.callee, opts.methods) && !isConsoleMethodProto(node.callee, opts.methods)))) return
    node.update(opts.replacement)
  })
}

function isConsoleMethodProto (node, methods) {
  if (!node) return false
  if (node.type !== 'MemberExpression') return false
  return isProto(node.property) && isConsoleMethod(node.object, methods)
}

var functionProtoMethods = [ 'apply', 'call' ]

function isProto (node) {
  return node.type === 'Identifier' && (functionProtoMethods.indexOf(node.name) > -1)
}

function isConsoleMethod (node, methods) {
  return isConsole(node) && isMethod(node.property, methods)
}

function isConsole (node) {
  if (!node) return false
  if (node.type !== 'MemberExpression') return false
  return node.object.type === 'Identifier' && node.object.name === 'console'
}

function isMethod (node, methods) {
  return node.type === 'Identifier' && (methods.indexOf(node.name) > -1)
}

var consoleApi = ['assert', 'count', 'debug', 'dir', 'error', 'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log', 'profile', 'profileEnd', 'time', 'timeEnd', 'trace', 'warn', 'table']
