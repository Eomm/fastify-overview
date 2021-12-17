'use strict'

const { test } = require('tap')
const buildApp = require('./sources/app')

test('routes', async t => {
  const app = await buildApp()
  await app.ready()
  const root = app.overview()

  require('fs').writeFileSync('./sources.json', JSON.stringify(root, null, 2))

  t.equal(root.hooks.preHandler.length, 1)
  t.match(root.hooks.preHandler[0].source, {
    stackIndex: 0,
    fileName: /test\/sources\/app\.js$/,
    lineNumber: 18,
    columnNumber: 7,
    functionName: 'buildTheSourceApp',
    typeName: null,
    methodName: null
  })

  // t.equal(root.children.length, 2)
  // t.equal(root.children[0].name, 'register1')
  // t.equal(root.children[1].name, 'sibling')
  // t.equal(root.routes.length, 4)
  // t.same(root.routes, require('./fixture/routes.00.json'))

  // const reg1 = root.children[0]
  // t.same(reg1.routes.length, 3)
  // t.same(reg1.routes, require('./fixture/routes.01.json'))

  // const reg2 = reg1.children[0]
  // t.same(reg2.routes.length, 2)
  // t.same(reg2.routes, require('./fixture/routes.02.json'))
})
