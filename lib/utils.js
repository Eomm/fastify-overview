'use strict'

const hash = require('object-hash')

module.exports = {
  transformRoute,
  getPluginNode,
  getHookNode,
  getDecoratorNode
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
        hooks[hook] = routeOpts[hook].map(getHookNode)
      } else {
        hooks[hook].push(getHookNode(routeOpts[hook]))
      }
    }
  }

  return {
    method: routeOpts.method,
    url: routeOpts.url,
    prefix: routeOpts.prefix,
    hooks,
    source: undefined
  }
}

function getPluginNode (id, name) {
  return {
    id,
    name,
    children: [],
    routes: [],
    source: undefined,
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

function getHookNode (hookFunction) {
  return {
    name: getFunctionName(hookFunction),
    hash: hash(hookFunction),
    source: undefined
  }
}

function getDecoratorNode (decoratorName) {
  return {
    name: decoratorName,
    source: undefined
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
