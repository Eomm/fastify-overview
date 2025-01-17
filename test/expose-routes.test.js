'use strict'

const { test } = require('node:test')
const fastify = require('fastify')
const plugin = require('../index')

test('expose the route to the the json', async t => {
  const app = fastify()
  await app.register(plugin, { exposeRoute: true })

  const response = await app.inject('/json-overview')
  const responseContent = response.json()

  t.assert.deepStrictEqual(responseContent.name, 'fastify -> fastify-overview')
  t.assert.deepStrictEqual(responseContent.children, [])
  t.assert.deepEqual(responseContent.routes, [
    {
      method: 'GET',
      url: '/json-overview',
      prefix: '',
      hooks: {
        onRequest: [],
        onRequestAbort: [],
        preParsing: [],
        preValidation: [],
        preHandler: [],
        preSerialization: [],
        onError: [],
        onSend: [],
        onResponse: [],
        onTimeout: []
      }
    }
  ])
  t.assert.deepStrictEqual(responseContent.decorators, {
    decorate: [],
    decorateRequest: [],
    decorateReply: []
  })
  t.assert.deepEqual(responseContent.hooks, {
    onClose: [],
    onError: [],
    onListen: [],
    onReady: [],
    onRegister: [],
    onRequest: [],
    onRequestAbort: [],
    onResponse: [],
    onRoute: [],
    onSend: [],
    onTimeout: [],
    preClose: [],
    preHandler: [],
    preParsing: [],
    preSerialization: [],
    preValidation: []
  })
})

test('expose the route within more options', async t => {
  t.plan(7)
  const app = fastify()
  await app.register(plugin,
    {
      exposeRoute: true,
      exposeRouteOptions: {
        url: '/foo',
        preHandler: function hook (request, reply, done) {
          t.assert.ok(true, 'preHandler hook registered')
          done(null)
        }
      }
    })

  const response = await app.inject('/foo')
  const responseContent = response.json()

  t.assert.deepStrictEqual(responseContent.name, 'fastify -> fastify-overview')
  t.assert.deepStrictEqual(responseContent.children, [])
  t.assert.strictEqual(responseContent.routes.length, 1)
  delete responseContent.routes[0].hooks.preHandler[0].hash
  t.assert.deepStrictEqual(responseContent.routes[0], {
    method: 'GET',
    url: '/foo',
    prefix: '',
    hooks: {
      onError: [],
      onRequest: [],
      onRequestAbort: [],
      onResponse: [],
      onSend: [],
      onTimeout: [],
      preHandler: [{ name: 'hook' }],
      preParsing: [],
      preSerialization: [],
      preValidation: []
    }
  })
  t.assert.deepStrictEqual(responseContent.decorators, {
    decorate: [],
    decorateRequest: [],
    decorateReply: []
  })
  t.assert.deepStrictEqual(responseContent.hooks, {
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
    onRegister: [],
    onListen: [],
    onRequestAbort: [],
    preClose: []
  })
})
