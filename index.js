'use strict'

const fp = require('fastify-plugin')
const kTrackerMe = Symbol('fastify-overview.track-me')
const kStructure = Symbol('fastify-overview.structure')

const {
  getFunctionName,
  transformRoute,
  getEmptyTree
} = require('./lib/utils')

function fastifyOverview (fastify, opts, next) {
  const contextMap = new Map()
  let structure

  fastify.addHook('onRegister', function markInstance (instance) {
    const parent = Object.getPrototypeOf(instance)
    manInTheMiddle(instance, parent[kTrackerMe])
  })

  fastify.addHook('onRoute', function markRoute (routeOptions) {
    this[kStructure].routes.push(transformRoute(routeOptions))
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
  wrapFastify(fastify)

  next()

  function manInTheMiddle (instance, parentId) {
    const trackingToken = Math.random()
    instance[kTrackerMe] = trackingToken

    const trackStructure = getEmptyTree(instance.pluginName)
    if (parentId) {
      contextMap.get(parentId).children.push(trackStructure)
    }

    contextMap.set(trackingToken, trackStructure)
    instance[kStructure] = trackStructure

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
function wrapFastify (instance) {
  wrapDecorator(instance, 'decorate')
  wrapDecorator(instance, 'decorateRequest')
  wrapDecorator(instance, 'decorateReply')

  const originalHook = instance.addHook
  instance.addHook = function wrapAddHook (name, hook) {
    this[kStructure].hooks[name].push(getFunctionName(hook.toString()))
    return originalHook.call(this, name, hook)
  }
}

function wrapDecorator (instance, type) {
  const originalDecorate = instance[type]
  instance[type] = function wrapDecorate (name, value) {
    this[kStructure].decorators[type].push(name)
    return originalDecorate.call(this, name, value)
  }
}

module.exports = fp(fastifyOverview, {
  name: 'fastify-overview',
  fastify: '>=3.x'
})
