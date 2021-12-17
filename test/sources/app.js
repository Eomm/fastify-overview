'use strict'

const fastify = require('fastify')
const plugin = require('../../index')

module.exports = async function buildTheSourceApp () {
  const app = fastify()
  await app.register(plugin, { addSource: true })

  function noop () {}
  function hook1 () {}
  function hook2 () {}

  app.get('/get', noop)
  app.decorate('decorApp', 'decorApp')
  app.decorateRequest('decorApp', 'decorApp')
  app.decorateReply('decorApp', 'decorApp')
  app.addHook('preHandler', function appPreHandlerHook (request, reply, done) {
    done(null)
  })
  // app.post('/post', noop)
  // app.put('/put', noop)
  // app.options('/options', noop)

  // app.register(function register1 (instance, opts, next) {
  //   instance.get('/get', noop)
  //   instance.post('/post', noop)
  //   instance.put('/put', noop)
  //   instance.register(function register3 (sub, opts, next) {
  //     sub.get('/hooks', {
  //       preHandler: [hook1, hook2]
  //     }, noop)
  //     sub.options('/options', {
  //       preHandler: hook1,
  //       preValidation: () => {}
  //     }, noop)

  //     next()
  //   }, { prefix: '/sub' })
  //   next()
  // }, { prefix: '/prefix' })
  app.register(function sibling (instance, opts, next) {
    next()
  })
  return app
}
