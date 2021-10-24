'use strict'

const fp = require('fastify-plugin')
const trackerMe = Symbol('fastify-overview.track-me')

function fastifyOverview (fastify, opts, next) {
  const contextMap = new Map()
  let structure

  fastify.addHook('onRegister', function hook (instance, opts) {
    const parent = Object.getPrototypeOf(instance)
    manInTheMiddle(instance, parent[trackerMe])
  })

  // fastify.addHook('onReady', function hook (done) {
  //   const root = contextMap.get(this)
  //   structure = root
  //   contextMap.clear()
  //   done(null)
  // })

  fastify.decorate('overview', function getOverview () {
    if (!structure) {
      const root = contextMap.get(rootTrack)
      structure = root
      contextMap.clear()
    }

    return structure
  })

  const rootTrack = manInTheMiddle(fastify)

  next()

  function manInTheMiddle (instance, parentId) {
    const trackingToken = Math.random()
    instance[trackerMe] = trackingToken

    const trackStructure = getEmptyTree()
    if (parentId) {
      contextMap.get(parentId).children.push(trackStructure)
    }

    contextMap.set(trackingToken, trackStructure)

    const originalDecorate = instance.decorate
    // const originalDecorateRequest = instance.decorateRequest // TODO
    // const originalDecorateReply = instance.decorateReply // TODO
    instance.decorate = function wrapDecorate (name, value) {
      contextMap.get(trackingToken).decorators.decorate.push(name)
      return originalDecorate.call(this, name, value)
    }

    const originalHook = instance.addHook
    instance.addHook = function wrapAddHook (name, hook) {
      contextMap.get(trackingToken).hooks[name].push(hook.toString())
      return originalHook.call(this, name, hook)
    }

    return trackingToken
  }
}

module.exports = fp(fastifyOverview, {
  name: 'fastify-overview'
})

function getEmptyTree (nodeFunction) {
  return {
    name: nodeFunction.name,
    children: [],
    decorators: {
      decorate: []
    },
    hooks: {
      onRequest: [],
      preParsing: [],
      preValidation: [],
      preHandler: [],
      preSerialization: [],
      onError: [],
      onSend: [],
      onResponse: [],
      onTimeout: [],
      onReady: [],
      onClose: [],
      onRoute: [],
      onRegister: []
    }
  }
}
