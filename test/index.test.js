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
  app.addHook('onRequestAbort', async function hookAbort (request) { })

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
  t.type(structure.id, 'number')
  t.equal(structure.children.length, 3)
  t.same(structure.decorators.decorate, [
    { name: 'test' },
    { name: 'testObject' },
    { name: 'testArray' }
  ])
  t.same(structure.hooks, require('./fixture/index.00.json'))
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
    }).register(function register4 (instance, opts, next) {
      next()
    })
    next()
  })

  await app.ready()
  const root = app.overview()

  t.equal(root.children.length, 1)
  t.equal(root.children[0].name, 'register1')
  t.same(root.decorators.decorate, [{ name: 'foo-bar' }])
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
  t.type(reg1.id, 'number')
  t.equal(reg1.children.length, 3)
  t.equal(reg1.children[0].name, 'register2')
  t.equal(reg1.children[1].name, 'register3')
  t.equal(reg1.children[2].name, 'register4')
  t.equal(reg1.hooks.onRequest.length, 1)
})

test('hide empty', async t => {
  const app = fastify()
  await app.register(plugin)

  app.decorate('emptyObject', {})
  app.decorate('emptyArray', [])
  app.decorateRequest('oneReqDecor', [])

  app.addHook('onRequest', function hook1 () {})
  app.addHook('preParsing', function hook2 () {})
  app.addHook('preValidation', function hook3 () {})
  app.addHook('onError', function hookSix () {})

  app.register(function (instance, opts, next) { next() })
  app.register(async function (instance, opts) {
    instance.register(async function (instance, opts) {
      instance.decorateReply('oneRep', {})
    })
  })

  await app.ready()
  const structure = app.overview({ hideEmpty: true })

  t.strictSame(structure.decorators, {
    decorate: [
      { name: 'emptyObject' },
      { name: 'emptyArray' }
    ],
    decorateRequest: [
      { name: 'oneReqDecor' }
    ]
  })

  t.strictSame(structure.hooks, {
    onRequest: [{ name: 'hook1', hash: '31d31d981f412085927efb5e9f36be8ba905516a' }],
    preParsing: [{ name: 'hook2', hash: '07f8fc52f2a92adc80881b4c11ee61ab56ea42d1' }],
    preValidation: [{ name: 'hook3', hash: '92b002434cd5d8481e7e5562b51df679e2f8d586' }],
    onError: [{ name: 'hookSix', hash: '9398f5df01879094095221d86a544179e62cee12' }]
  })

  t.equal(structure.children.length, 2)

  delete structure.children[0].id
  t.same(structure.children[0], {
    name: 'function (instance, opts, next) { next() }'
  }, 'should have only the name')

  t.strictSame(structure.children[1].children[0].decorators, {
    decorateReply: [
      { name: 'oneRep' }
    ]
  })
})
