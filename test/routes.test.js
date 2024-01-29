'use strict'

const { test } = require('tap')
const fastify = require('fastify')
const plugin = require('../index')

function noop () {}

function hook1 () {}
function hook2 () {}

test('routes', async t => {
  const app = fastify({ exposeHeadRoutes: false })
  await app.register(plugin)

  app.get('/get', noop)
  app.post('/post', noop)
  app.put('/put', noop)
  app.options('/options', noop)
  app.get('/get-chain', noop).post('/post-chain', noop)
  app.route({
    method: 'GET',
    url: '/route-get-chain',
    handler: noop
  }).route({
    method: 'POST',
    url: '/route-post-chain',
    handler: noop
  })

  app.register(function register1 (instance, opts, next) {
    instance.get('/get', noop)
    instance.post('/post', noop)
    instance.put('/put', noop)
    instance.get('/get-chain', noop).post('/post-chain', noop)
    instance.route({
      method: 'GET',
      url: '/route-get-chain',
      handler: noop
    }).route({
      method: 'POST',
      url: '/route-post-chain',
      handler: noop
    })

    instance.register(function register3 (sub, opts, next) {
      sub.get('/hooks', {
        preHandler: [hook1, hook2]
      }, noop)
      sub.options('/options', {
        preHandler: hook1,
        preValidation: () => {}
      }, noop)

      next()
    }, { prefix: '/sub' })
    next()
  }, { prefix: '/prefix' })
  app.register(function sibling (instance, opts, next) {
    next()
  })
  app.register(function routes (instance, opts, next) {
    ['propfind', 'proppatch', 'mkcol', 'copy', 'move', 'lock', 'unlock', 'trace', 'search'].forEach(method => {
      instance.route({
        method,
        url: '/test',
        handler () {}
      })
    })

    next()
  }, { prefix: '/api' })

  await app.ready()
  const root = app.overview()

  t.equal(root.children.length, 3)
  t.equal(root.children[0].name, 'register1')
  t.equal(root.children[1].name, 'sibling')
  t.equal(root.children[2].name, 'routes')
  t.equal(root.routes.length, 8)
  t.same(root.routes, require('./fixture/routes.00.json'))

  const reg1 = root.children[0]
  t.same(reg1.routes.length, 7)
  t.same(reg1.routes, require('./fixture/routes.01.json'))

  const reg2 = reg1.children[0]
  t.same(reg2.routes.length, 2)
  t.same(reg2.routes, require('./fixture/routes.02.json'))

  const reg3 = root.children[2]
  t.same(reg3.routes.length, 9)
  t.same(reg3.routes, require('./fixture/routes.03.json'))
})

test('custom transformRouteOptions', async t => {
  const app = fastify({ exposeHeadRoutes: false })

  await app.register(plugin, {
    transformRouteOptions: (opts) => {
      return {
        url: opts.url,
        prefix: opts.prefix,
        method: opts.method,
        bodySchema: opts.schema ? opts.schema.body : undefined
      }
    }
  })

  app.get('/get', noop)
  app.post('/post', { schema: { body: { test: { type: 'string' } } } }, noop)

  app.register(async (instance) => {
    instance.put('/plugin', { schema: { querystring: { size: { type: 'integer' } } } }, noop)

    instance.register(async function (instance2) {
      instance2.patch('/patch/:param', {
        schema: {
          params: {
            param: {
              type: 'string'
            }
          },
          body: {
            text: {
              type: 'boolean'
            }
          }
        }
      }, noop)
    })
  }, { prefix: 'api' })

  await app.ready()

  const root = app.overview()

  t.equal(root.children.length, 1)
  t.equal(root.routes.length, 2)
  t.same(root.routes, require('./fixture/routes.04.json'))

  t.equal(root.children[0].routes.length, 1)
  t.equal(root.children[0].children.length, 1)
  t.same(root.children[0].routes, require('./fixture/routes.05.json'))

  t.equal(root.children[0].children[0].routes.length, 1)
  t.equal(root.children[0].children[0].children.length, 0)
  t.same(root.children[0].children[0].routes, require('./fixture/routes.06.json'))
})
