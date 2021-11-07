'use strict'

const { test } = require('tap')
const fastify = require('fastify')
const plugin = require('../index')

test('basic test', async t => {
  const app = fastify()
  await app.register(plugin)

  app.decorate('test', function testFunction () {})
  app.decorate('testObject', {})
  app.decorate('testArray', [])

  app.addHook('onRequest', function hook1 () {})
  app.addHook('preParsing', function hook2 () {})
  app.addHook('preValidation', function hook3 () {})
  app.addHook('preHandler', function hook4 () {})
  app.addHook('preSerialization', function hook5 () {})
  app.addHook('onError', function hook6 () {})
  app.addHook('onSend', function hook7 () {})
  app.addHook('onResponse', function hook8 () {})
  app.addHook('onTimeout', function hook9 () {})

  app.register(function (instance, opts, next) { next() })
  app.register(async function (instance, opts) { })
  app.register(async function (instance, opts) { })

  try {
    app.overview()
    t.fail('it must throw')
  } catch (error) {
    t.match(error.message, 'must be in ready status')
  }

  await app.ready()
  const structure = app.overview()
  t.equal(structure.children.length, 3)
  t.same(structure.decorators.decorate, ['test', 'testObject', 'testArray'])
  t.equal(structure.hooks.onRequest.length, 1)
  t.equal(structure.hooks.preParsing.length, 1)
  t.equal(structure.hooks.preValidation.length, 1)
  t.equal(structure.hooks.preHandler.length, 1)
  t.equal(structure.hooks.preSerialization.length, 1)
  t.equal(structure.hooks.onError.length, 1)
  t.equal(structure.hooks.onSend.length, 1)
  t.equal(structure.hooks.onResponse.length, 1)
  t.equal(structure.hooks.onTimeout.length, 1)
})

test('register', async t => {
  const app = fastify()
  app.register(plugin)

  app.register(function register1 (instance, opts, next) {
    instance.addHook('onRequest', function hook1 () {})
    instance.register(function register2 (sub, opts, next) {
      sub.addHook('onRequest', function hook2 () {})
      next()
    })
    instance.register(function register3 (instance, opts, next) {
      next()
    })
    next()
  })

  await app.ready()
  const root = app.overview()
  t.equal(root.children.length, 1)
  t.equal(root.children[0].name, 'register1')
  t.same(root.decorators.decorate, [])
  t.equal(root.hooks.onRequest.length, 0)
  t.equal(root.hooks.preParsing.length, 0)
  t.equal(root.hooks.preValidation.length, 0)
  t.equal(root.hooks.preHandler.length, 0)
  t.equal(root.hooks.preSerialization.length, 0)
  t.equal(root.hooks.onError.length, 0)
  t.equal(root.hooks.onSend.length, 0)
  t.equal(root.hooks.onResponse.length, 0)
  t.equal(root.hooks.onTimeout.length, 0)

  const reg1 = root.children[0]
  t.equal(reg1.children.length, 2)
  t.equal(reg1.children[0].name, 'register2')
  t.equal(reg1.children[1].name, 'register3')
  t.equal(reg1.hooks.onRequest.length, 1)
})
