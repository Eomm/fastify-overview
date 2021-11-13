'use strict'

const { test } = require('tap')
const fastify = require('fastify')
const plugin = require('../index')

function noop () {}

function hook1 () {}
function hook2 () {}

test('routes', async t => {
  const app = fastify()
  await app.register(plugin)

  app.get('/get', noop)
  app.post('/post', noop)
  app.put('/put', noop)
  app.options('/options', noop)

  app.register(function register1 (instance, opts, next) {
    instance.get('/get', noop)
    instance.post('/post', noop)
    instance.put('/put', noop)
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

  await app.ready()
  const root = app.overview()

  t.equal(root.children.length, 2)
  t.equal(root.children[0].name, 'register1')
  t.equal(root.children[1].name, 'sibling')
  t.equal(root.routes.length, 4)
  t.same(root.routes, require('./fixture/routes.00.json'))

  const reg1 = root.children[0]
  t.same(reg1.routes.length, 3)
  t.same(reg1.routes, require('./fixture/routes.01.json'))

  const reg2 = reg1.children[0]
  t.same(reg2.routes.length, 2)
  t.same(reg2.routes, require('./fixture/routes.02.json'))
})
