'use strict'

const { test } = require('tap')
const fastify = require('fastify')
const plugin = require('../index')

test('decorator', async t => {
  const app = fastify()
  await app.register(plugin)

  app.decorate('root-func', function testFunction () {})
  app.decorateRequest('root-req', function () {})
  app.decorateRequest('root-req-two', function () {})
  app.decorateReply('root-reply', function () {})

  app.register(function register1 (instance, opts, next) {
    instance.decorateRequest('child-1', 42)
    instance.register(function register2 (sub, opts, next) {
      sub.decorateReply('sub', 42)
      next()
    })
    instance.register(function register3 (sub, opts, next) {
      sub.decorate('sub-instance', 50)
      sub.decorateReply('sub', 50)
      next()
    })
    next()
  })
  app.register(function sibling (instance, opts, next) {
    next()
  })

  await app.ready()
  const root = app.overview()

  t.equal(root.children.length, 2)
  t.equal(root.children[0].name, 'register1')
  t.equal(root.children[1].name, 'sibling')
  t.same(root.decorators.decorate, ['root-func'])
  t.same(root.decorators.decorateRequest, ['root-req', 'root-req-two'])
  t.same(root.decorators.decorateReply, ['root-reply'])

  const reg1 = root.children[0]
  t.same(reg1.decorators.decorate, [])
  t.same(reg1.decorators.decorateRequest, ['child-1'])
  t.same(reg1.decorators.decorateReply, [])
  t.equal(reg1.children.length, 2)

  const reg2 = reg1.children[0]
  t.same(reg2.decorators.decorate, [])
  t.same(reg2.decorators.decorateRequest, [])
  t.same(reg2.decorators.decorateReply, ['sub'])

  const reg3 = reg1.children[1]
  t.same(reg3.decorators.decorate, ['sub-instance'])
  t.same(reg3.decorators.decorateRequest, [])
  t.same(reg3.decorators.decorateReply, ['sub'])
})
