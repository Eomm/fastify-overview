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

  app.decorate('root-symbol', Symbol('testSymbol'))
  app.decorateReply('root-reply-array', [])
  app.decorateRequest('root-req-boolean', true)

  app.register(function register1 (instance, opts, next) {
    instance.decorateRequest('child-1', 42)
    instance.decorate('child-1-bigint', BigInt(1))
    instance.decorate('child-1-undefined')
    instance.register(function register2 (sub, opts, next) {
      sub.decorateReply('sub', 42)
      next()
    })
    instance.register(function register3 (sub, opts, next) {
      sub.decorate('sub-instance', 50)
      sub.decorateReply('sub', 50)
      sub.decorateRequest('sub-object', {})
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
  t.same(root.decorators.decorate, [{ name: 'root-func', type: 'function' }, { name: 'root-symbol', type: 'symbol' }])
  t.same(root.decorators.decorateRequest, [{ name: 'root-req', type: 'function' }, { name: 'root-req-two', type: 'function' }, { name: 'root-req-boolean', type: 'boolean' }])
  t.same(root.decorators.decorateReply, [{ name: 'root-reply', type: 'function' }, { name: 'root-reply-array', type: 'array' }])

  const reg1 = root.children[0]
  t.same(reg1.decorators.decorate, [{ name: 'child-1-bigint', type: 'bigint' }, { name: 'child-1-undefined', type: 'undefined' }])
  t.same(reg1.decorators.decorateRequest, [{ name: 'child-1', type: 'number' }])
  t.same(reg1.decorators.decorateReply, [])
  t.equal(reg1.children.length, 2)

  const reg2 = reg1.children[0]
  t.same(reg2.decorators.decorate, [])
  t.same(reg2.decorators.decorateRequest, [])
  t.same(reg2.decorators.decorateReply, [{ name: 'sub', type: 'number' }])

  const reg3 = reg1.children[1]
  t.same(reg3.decorators.decorate, [{ name: 'sub-instance', type: 'number' }])
  t.same(reg3.decorators.decorateRequest, [{ name: 'sub-object', type: 'object' }])
  t.same(reg3.decorators.decorateReply, [{ name: 'sub', type: 'number' }])
})

test('onDecorateDefinition', async t => {
  const app = fastify()
  await app.register(plugin, {
    onDecorateDefinition: (type, name, value) => {
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        return {
          recursive: Object.entries(value).map(([key, val]) => {
            return {
              name: key,
              type: Array.isArray(val) ? 'array' : typeof val
            }
          })
        }
      } else {
        return {}
      }
    }
  })

  app.decorate('emptyObj', {})
  app.decorate('obj1', {
    run: () => {}
  })
  app.decorateRequest('emptyObj', {})
  app.decorateReply('obj2', {
    test: 'str'
  })

  app.register(async function child1 (instance) {
    instance.decorate('encapsulatedObj', {
      a: () => {},
      b: 'str',
      c: false,
      d: 42
    })
  })

  await app.ready()

  const root = app.overview()

  t.equal(root.children.length, 1)
  t.same(root.decorators.decorate, [{ name: 'emptyObj', type: 'object', recursive: [] }, { name: 'obj1', type: 'object', recursive: [{ name: 'run', type: 'function' }] }])
  t.same(root.decorators.decorateReply, [{ name: 'obj2', type: 'object', recursive: [{ name: 'test', type: 'string' }] }])
  t.same(root.decorators.decorateRequest, [{ name: 'emptyObj', type: 'object', recursive: [] }])

  t.equal(root.children[0].name, 'child1')
  const child1 = root.children[0]
  t.same(child1.decorators.decorate, [{ name: 'encapsulatedObj', type: 'object', recursive: [{ name: 'a', type: 'function' }, { name: 'b', type: 'string' }, { name: 'c', type: 'boolean' }, { name: 'd', type: 'number' }] }])
  t.equal(child1.decorators.decorateRequest.length, 0)
  t.equal(child1.decorators.decorateReply.length, 0)
})
