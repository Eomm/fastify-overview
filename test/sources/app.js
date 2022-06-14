'use strict'

const fastify = require('fastify')
const plugin = require('../../index')

module.exports = async function buildTheSourceApp (opts) {
  const app = fastify({ exposeHeadRoutes: false })
  await app.register(plugin, opts)

  function hook1 () {}
  function hook2 () {}

  app.get('/get', buildHandler())
  app.decorate('decorApp', 'decorApp')
  app.decorateRequest('decorApp', 'decorApp')
  app.decorateReply('decorApp', 'decorApp')
  app.addHook('preHandler', function appPreHandlerHook (request, reply, done) {
    done(null)
  })
  app.post('/post', {
    handler: buildHandler()
  })
  app.put('/put', buildHandler())
  app.options('/options', buildHandler())

  app.register(function register1 (instance, opts, next) {
    instance.get('/get', buildHandler())
    instance.post('/post', buildHandler())
    instance.put('/put', buildHandler())
    instance.register(function register3 (sub, opts, next) {
      sub.get('/hooks', {
        preHandler: [hook1, hook2]
      }, buildHandler())
      sub.options('/options', {
        preHandler: hook1,
        preValidation: () => {}
      }, buildHandler())

      next()
    }, { prefix: '/sub' })
    next()
  }, { prefix: '/prefix' })
  app.register(function sibling (instance, opts, next) {
    instance.route({
      method: 'DELETE',
      url: '/delete',
      handler: buildHandler()
    })

    next()
  })
  return app
}

function buildHandler () {
  return function noop () {}
}
