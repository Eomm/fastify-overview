'use strict'

const hash = require('object-hash')

module.exports = {
  transformRoute,
  getPluginNode,
  getHookNode,
  getDecoratorNode,
  filterStructure,
  handleRoutes
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
    hooks
  }
}

function getPluginNode (id, name) {
  return {
    id,
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

function getHookNode (hookFunction) {
  return {
    name: getFunctionName(hookFunction),
    hash: hash(hookFunction)
  }
}

function getDecoratorNode (decoratorName, decoratedValue) {
  return {
    name: decoratorName,
    type: Array.isArray(decoratedValue) ? 'array' : typeof decoratedValue
  }
}

// https://github.com/fastify/fastify/blob/main/lib/hooks.js
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
    onTimeout: [], //
    onRequestAbort: []
  }
}

function getEmptyHookApplication () {
  return {
    onListen: [],
    onReady: [],
    preClose: [],
    onClose: [],
    onRoute: [],
    onRegister: []
  }
}

function filterStructure (structure, opts) {
  const filterStructure = JSON.stringify(structure, (key, value) => {
    switch (key) {
      case 'decorators':
      case 'hooks':
        if (opts.hideEmpty && Object.entries(value).every(([, v]) => {
          return Array.isArray(v) && v.length === 0
        })) {
          return undefined
        }
        break
      case 'routes':
        return handleRoutes(value, opts)
      default:
        if (opts.hideEmpty && Array.isArray(value) && value.length === 0) {
          return undefined
        }
    }

    return value
  })
  return JSON.parse(filterStructure)
}

function handleRoutes (value, opts) {
  if (opts.routesFilter) {
    const routesFiltered = value.filter(opts.routesFilter)
    if (opts.hideEmpty && routesFiltered.length === 0) {
      return undefined
    }
    return routesFiltered
  }
  if (opts.hideEmpty && value.length === 0) {
    return undefined
  }
  return value
}
