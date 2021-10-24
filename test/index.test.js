'use strict'

const { test } = require('tap')
const fastify = require('fastify')
const plugin = require('../index')

// test('basic test', async t => {
//   const app = fastify()
//   await app.register(plugin)

//   app.decorate('test', function testFunction () {})
//   app.decorate('testObject', {})
//   app.decorate('testArray', [])

//   app.addHook('onRequest', function hook1 () {})
//   app.addHook('preParsing', function hook2 () {})
//   app.addHook('preValidation', function hook3 () {})
//   app.addHook('preHandler', function hook4 () {})
//   app.addHook('preSerialization', function hook5 () {})
//   app.addHook('onError', function hook6 () {})
//   app.addHook('onSend', function hook7 () {})
//   app.addHook('onResponse', function hook8 () {})
//   app.addHook('onTimeout', function hook9 () {})

//   // const structure = app.overview()
//   // t.same(structure, {}) // todo
// })

test('register', async t => {
  const app = fastify()
  await app.register(plugin)

  app.register(function register1 (instance, opts, next) {
    instance.register(function register2 (instance, opts, next) {
      next()
    })
    instance.register(function register3 (instance, opts, next) {
      next()
    })
    next()
  })

  await app.ready()
  const structure = app.overview()
  t.same(structure, {}) // todo
})
