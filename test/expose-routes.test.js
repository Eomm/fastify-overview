'use strict'

const { test } = require('tap')
const fastify = require('fastify')
const plugin = require('../index')

test('expose the route to the the json', async t => {
  const app = fastify()
  await app.register(plugin, { exposeRoute: true })

  const response = await app.inject('/json-overview')
  t.hasStrict(response.json(), {
    name: 'fastify -> fastify-overview',
    children: [],
    routes: [
      {
        method: 'GET',
        url: '/json-overview',
        prefix: '',
        hooks: {
          onRequest: [],
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
    ],
    decorators: {
      decorate: [],
      decorateRequest: [],
      decorateReply: []
    },
    hooks: {
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
      onRegister: []
    }
  })
})

test('expose the route within more options', async t => {
  t.plan(2)
  const app = fastify()
  await app.register(plugin,
    {
      exposeRoute: true,
      exposeRouteOptions: {
        url: '/foo',
        preHandler: function hook (request, reply, done) {
          t.pass('preHandler hook called')
          done(null)
        }
      }
    })

  const response = await app.inject('/foo')
  t.hasStrict(response.json(), {
    name: 'fastify -> fastify-overview',
    children: [],
    routes: [
      {
        method: 'GET',
        url: '/foo',
        prefix: '',
        hooks: {
          onRequest: [],
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
    ],
    decorators: {
      decorate: [],
      decorateRequest: [],
      decorateReply: []
    },
    hooks: {
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
      onRegister: []
    }
  })
})
