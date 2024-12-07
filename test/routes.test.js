'use strict'

const { test } = require('node:test')
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
  app.route({
    method: ['GET', 'POST', 'PROPPATCH'],
    url: '/array',
    handler () {}
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

  t.assert.deepEqual(root.children.length, 3)
  t.assert.deepEqual(root.children[0].name, 'register1')
  t.assert.deepEqual(root.children[1].name, 'sibling')
  t.assert.deepEqual(root.children[2].name, 'routes')
  t.assert.deepEqual(root.routes.length, 9)
  t.assert.deepStrictEqual(root.routes, require('./fixture/routes.00.json'))

  const reg1 = root.children[0]
  t.assert.deepStrictEqual(reg1.routes.length, 7)
  t.assert.deepStrictEqual(reg1.routes, require('./fixture/routes.01.json'))

  const reg2 = reg1.children[0]
  t.assert.deepStrictEqual(reg2.routes.length, 2)
  t.assert.deepStrictEqual(reg2.routes, require('./fixture/routes.02.json'))

  const reg3 = root.children[2]
  t.assert.deepStrictEqual(reg3.routes.length, 9)
  t.assert.deepStrictEqual(reg3.routes, require('./fixture/routes.03.json'))
})

test('custom onRouteDefinition', async t => {
  const app = fastify({ exposeHeadRoutes: false })

  await app.register(plugin, {
    onRouteDefinition: (opts) => {
      return {
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

  t.assert.deepEqual(root.children.length, 1)
  t.assert.deepEqual(root.routes.length, 2)
  t.assert.deepEqual(root.routes, require('./fixture/routes.04.json'))

  t.assert.deepEqual(root.children[0].routes.length, 1)
  t.assert.deepEqual(root.children[0].children.length, 1)
  t.assert.deepEqual(root.children[0].routes, require('./fixture/routes.05.json'))

  t.assert.deepEqual(root.children[0].children[0].routes.length, 1)
  t.assert.deepEqual(root.children[0].children[0].children.length, 0)
  t.assert.deepEqual(root.children[0].children[0].routes, require('./fixture/routes.06.json'))
})

test('custom onRouteDefinition with overriding', async t => {
  const app = fastify({ exposeHeadRoutes: false })

  await app.register(plugin, {
    onRouteDefinition: (opts) => {
      return {
        url: 'static url',
        method: opts.method + opts.method
      }
    }
  })

  app.get('/get', noop)
  app.post('/post', { schema: { body: { test: { type: 'string' } } } }, noop)

  await app.ready()

  const root = app.overview()

  t.assert.deepEqual(root.children.length, 0)
  t.assert.deepEqual(root.routes.length, 2)
  t.assert.deepStrictEqual(root.routes, require('./fixture/routes.07.json'))
})
