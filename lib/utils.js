'use strict'

module.exports = {
  getFunctionName,
  transformRoute,
  getEmptyTree
}

function getFunctionName (func) {
  const funcReg = /\s*function\s*(\S+)\s*\(.*\)\s*{.*/gi
  const m = funcReg.exec(func)
  if (m && m.length >= 1) {
    return m[1]
  } else {
    return 'Anonymous function'
  }
}

function transformRoute (routeOpts) {
  const hooks = getEmptyHookRoute()

  for (const hook of Object.keys(hooks)) {
    if (routeOpts[hook]) {
      if (Array.isArray(routeOpts[hook])) {
        hooks[hook] = routeOpts[hook].map(getFunctionName)
      } else {
        hooks[hook].push(getFunctionName(routeOpts[hook]))
      }
    }
  }

  return {
    method: routeOpts.method,
    url: routeOpts.url,
    prefix: routeOpts.prefix,
    hooks
  }
}

function getEmptyTree (name) {
  return {
    name,
    children: [],
    routes: [],
    decorators: {
      decorate: [],
      decorateRequest: [],
      decorateReply: []
    },
    hooks: {
      ...getEmptyHookRoute(),
      ...getEmptyHookApplication()
    }
  }
}

function getEmptyHookRoute () {
  return {
    onRequest: [],
    preParsing: [],
    preValidation: [],
    preHandler: [],
    preSerialization: [], //
    onError: [], //
    onSend: [],
    onResponse: [],
    onTimeout: [] //
  }
}

function getEmptyHookApplication () {
  return {
    onReady: [],
    onClose: [],
    onRoute: [],
    onRegister: []
  }
}
