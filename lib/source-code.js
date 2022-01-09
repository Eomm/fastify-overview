'use strict'

module.exports = function callee () {
  const _prepareStackTrace = Error.prepareStackTrace
  Error.prepareStackTrace = (_, stack) => stack
  const stack = new Error().stack.slice(2)
  Error.prepareStackTrace = _prepareStackTrace
  return stack
    .filter(noNodeModules)
    .map(toCodeItem)
}

function noNodeModules (call) {
  const file = call.getFileName()
  return file && file.indexOf('node_modules') === -1
}

function toCodeItem (call, i) {
  return {
    stackIndex: i,
    fileName: call.getFileName(),
    lineNumber: call.getLineNumber(),
    columnNumber: call.getColumnNumber(),
    functionName: call.getFunctionName(),
    typeName: call.getTypeName(),
    methodName: call.getMethodName()
  }
}
