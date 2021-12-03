'use strict'

module.exports = function callee () {
  const _prepareStackTrace = Error.prepareStackTrace
  Error.prepareStackTrace = (_, stack) => stack
  const stack = new Error().stack.slice(1)
  Error.prepareStackTrace = _prepareStackTrace
  return stack.map((call, i) => {
    return {
      stackIndex: i,
      fileName: call.getFileName(),
      lineNumber: call.getLineNumber(),
      columnNumber: call.getColumnNumber(),
      functionName: call.getFunctionName(),
      typeName: call.getTypeName(),
      methodName: call.getMethodName()
    }
  })
}
