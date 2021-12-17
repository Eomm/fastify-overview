'use strict'

const fp = require('fastify-plugin')
const getSource = require('./lib/source-code')

const kTrackerMe = Symbol('fastify-overview.track-me')
const kStructure = Symbol('fastify-overview.structure')

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

  const contextMap = new Map()
  let structure

  fastify.addHook('onRegister', function markInstance (instance) {
    const parent = Object.getPrototypeOf(instance)
    manInTheMiddle(instance, parent[kTrackerMe])
  })

  fastify.addHook('onRoute', function markRoute (routeOptions) {
    const routeNode = transformRoute(routeOptions)
    // TODO the onRoute hook is executed by Fastify
    // if (opts.addSource) {
    //   routeNode.souce = getSource()
    // }
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

  next()

  function manInTheMiddle (instance, parentId) {
    const trackingToken = Math.random()
    instance[kTrackerMe] = trackingToken

    const trackStructure = getPluginNode(trackingToken, instance.pluginName)
    if (opts.addSource) {
      trackStructure.source = getSource()
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
  wrapDecorator(instance, 'decorate', pluginOpts)
  wrapDecorator(instance, 'decorateRequest', pluginOpts)
  wrapDecorator(instance, 'decorateReply', pluginOpts)

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
      decoratorNode.souce = getSource()[0]
    }
    this[kStructure].decorators[type].push(decoratorNode)
    return originalDecorate.call(this, name, value)
  }
}

module.exports = fp(fastifyOverview, {
  name: 'fastify-overview',
  fastify: '>=3.x'
})
