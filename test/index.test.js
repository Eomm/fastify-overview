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
  app.addHook('onError', function hookSix () {})
  // not standard naming.
  // eslint-disable-next-line
  app.addHook('onSend', function hook_7 () {})
  app.addHook('onResponse', async function hook8 () {})
  app.addHook('onTimeout', () => {})

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
  t.same(structure.hooks.onRequest, ['hook1'])
  t.same(structure.hooks.preParsing, ['hook2'])
  t.same(structure.hooks.preValidation, ['hook3'])
  t.same(structure.hooks.preHandler, ['hook4'])
  t.same(structure.hooks.preSerialization, ['hook5'])
  t.same(structure.hooks.onError, ['hookSix'])
  t.same(structure.hooks.onSend, ['hook_7'])
  t.same(structure.hooks.onResponse, ['hook8'])
  t.same(structure.hooks.onTimeout, ['Anonymous function'])
})

test('register', async t => {
  const app = fastify()
  await app.register(plugin)

  app.addHook('onSend', function hookRoot () {})
  app.decorate('foo-bar', function testFunction () {})

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
  t.same(root.decorators.decorate, ['foo-bar'])
  t.equal(root.hooks.onRequest.length, 0)
  t.equal(root.hooks.preParsing.length, 0)
  t.equal(root.hooks.preValidation.length, 0)
  t.equal(root.hooks.preHandler.length, 0)
  t.equal(root.hooks.preSerialization.length, 0)
  t.equal(root.hooks.onError.length, 0)
  t.equal(root.hooks.onSend.length, 1)
  t.equal(root.hooks.onResponse.length, 0)
  t.equal(root.hooks.onTimeout.length, 0)

  const reg1 = root.children[0]
  t.equal(reg1.children.length, 2)
  t.equal(reg1.children[0].name, 'register2')
  t.equal(reg1.children[1].name, 'register3')
  t.equal(reg1.hooks.onRequest.length, 1)
})
