'use strict'

const { test } = require('tap')
const fastify = require('fastify')
const plugin = require('../index')

test('should track all the application hooks', {
  skip: process.platform === 'win32' && process.version.startsWith('v16')
}, async t => {
  const app = fastify()
  await app.register(plugin)

  app.addHook('onReady', function onReady (done) {
    done()
  })
  app.addHook('onReady', async function onReadyAsync () { })

  app.addHook('onClose', function onClose (app, done) {
    done()
  })
  app.addHook('onClose', async function onCloseAsync (app) { })

  app.addHook('onRoute', function onRoute (routeOptions) { })
  app.addHook('onRegister', function onRegister (app, opts) { })

  app.addHook('preClose', function preClose (done) { done() })
  app.addHook('preClose', async function preCloseAsync () { })

  await app.ready()
  const structure = app.overview({ hideEmpty: true })

  t.same(structure.hooks, require('./fixture/app-hooks.json').hooks)
})
