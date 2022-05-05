'use strict'

const fp = require('fastify-plugin')
const getSource = require('./lib/source-code')

const kTrackerMe = Symbol('fastify-overview.track-me')
const kStructure = Symbol('fastify-overview.structure')
const kSourceRegister = Symbol('fastify-overview.source.register')
const kSourceRoute = Symbol('fastify-overview.source.route')

const Static = require('fastify-static')
const { join } = require('path')

const {
  transformRoute,
  getDecoratorNode,
  getPluginNode,
  getHookNode
} = require('./lib/utils')

function fastifyOverview (fastify, options, next) {
  const opts = Object.assign({
    addSource: false
  }, options)

  fastify.register(Static, {
    root: join(__dirname, './static'),
    wildcard: false,
    serve: false
  })

  fastify.get(`${options.graphUrl ?? '/overview'}`, (req, reply) => {
    reply.sendFile('index.html')
  })

  const contextMap = new Map()
  let structure

  fastify.addHook('onRegister', function markInstance (instance) {
    const parent = Object.getPrototypeOf(instance)
    // this is the `avvio` instance
    manInTheMiddle.call(this, instance, parent[kTrackerMe])
  })

  fastify.addHook('onRoute', function markRoute (routeOpts) {
    const routeNode = transformRoute(routeOpts)
    if (opts.addSource) {
      routeNode.source = routeOpts.handler[kSourceRoute]

      // the hooks added using the route options, does not have the `source` property
      // so we can use the same as the route handler
      const hooksKey = Object.keys(routeNode.hooks)
      for (const hookKey of hooksKey) {
        routeNode.hooks[hookKey].forEach(hookNode => {
          hookNode.source = routeNode.source
        })
      }
    }
    this[kStructure].routes.push(routeNode)
  })

  fastify.addHook('onReady', function hook (done) {
    const root = contextMap.get(rootToken)
    structure = root
    contextMap.clear()
    done(null)
  })

  fastify.decorate('overview', function getOverview () {
    if (!structure) {
      throw new Error('Fastify must be in ready status to access the overview')
    }
    return structure
  })

  const rootToken = manInTheMiddle(fastify)
  wrapFastify(fastify, opts)

  if (opts.exposeRoute === true) {
    const routeConfig = Object.assign(
      {
        method: 'GET',
        url: '/json-overview'
      },
      opts.exposeRouteOptions,
      { handler: getJsonOverview })
    fastify.route(routeConfig)
  }

  next()

  function manInTheMiddle (instance, parentId) {
    const trackingToken = Math.random()
    instance[kTrackerMe] = trackingToken

    const trackStructure = getPluginNode(trackingToken, instance.pluginName)
    if (opts.addSource && this) {
      trackStructure.source = this._current.find(loadPipe => loadPipe.func[kSourceRegister] !== undefined).func[kSourceRegister]
    }
    contextMap.set(trackingToken, trackStructure)
    instance[kStructure] = trackStructure

    if (parentId) {
      contextMap.get(parentId).children.push(trackStructure)
    }

    return trackingToken
  }
}

/**
 * this function is executed only once: when the plugin is registered.
 * if it is executed more than once, the output structure will have duplicated
 * entries.
 * this is caused by the fact that the wrapDecorate will call wrapDecorate again and so on.
 * Running the code only the first time relies on the Fastify prototype chain.
 *
 * The key here is to use the this[kStructure] property to get the right structure to update.
 */
function wrapFastify (instance, pluginOpts) {
  // *** decorators
  wrapDecorator(instance, 'decorate', pluginOpts)
  wrapDecorator(instance, 'decorateRequest', pluginOpts)
  wrapDecorator(instance, 'decorateReply', pluginOpts)

  // *** register
  const originalRegister = instance.register
  instance.register = function wrapRegister (pluginFn, opts) {
    if (pluginOpts.addSource) {
      // this Symbol is processed by the `onRegister` hook if necessary
      pluginFn[kSourceRegister] = getSource()[0]
    }
    originalRegister.call(this, pluginFn, opts)
  }

  // *** routes
  ;[
    'delete',
    'get',
    'head',
    'patch',
    'post',
    'put',
    'options',
    'all'
  ].forEach(shortcut => {
    const originalMethod = instance[shortcut]
    instance[shortcut] = function wrapRoute (url, opts, handler) {
      if (pluginOpts.addSource) {
        // this Symbol is processed by the `onRoute` hook
        getRouteHandler(url, opts, handler)[kSourceRoute] = getSource()[0]
      }
      originalMethod.call(this, url, opts, handler)
    }
  })

  const originalRoute = instance.route
  instance.route = function wrapRoute (routeOpts) {
    if (pluginOpts.addSource) {
      // this Symbol is processed by the `onRoute` hook
      routeOpts.handler[kSourceRoute] = getSource()[0]
    }
    originalRoute.call(this, routeOpts)
  }

  // *** hooks
  const originalHook = instance.addHook
  instance.addHook = function wrapAddHook (name, hook) {
    const hookNode = getHookNode(hook)
    if (pluginOpts.addSource) {
      hookNode.source = getSource()[0]
    }
    this[kStructure].hooks[name].push(hookNode)
    return originalHook.call(this, name, hook)
  }
}

function wrapDecorator (instance, type, { addSource }) {
  const originalDecorate = instance[type]
  instance[type] = function wrapDecorate (name, value) {
    const decoratorNode = getDecoratorNode(name)
    if (addSource) {
      decoratorNode.source = getSource()[0]
    }
    this[kStructure].decorators[type].push(decoratorNode)
    return originalDecorate.call(this, name, value)
  }
}

function getRouteHandler (url, options, handler) {
  if (!handler && typeof options === 'function') {
    handler = options
  }
  return handler || (options && options.handler)
}

function getJsonOverview (request, reply) {
  return this.overview()
}

module.exports = fp(fastifyOverview, {
  name: 'fastify-overview',
  fastify: '>=3.x'
})
