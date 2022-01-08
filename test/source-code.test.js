'use strict'

const { test } = require('tap')
const buildApp = require('./sources/app')

test('simple app', async t => {
  const app = await buildApp({ addSource: true })
  await app.ready()
  const root = app.overview()

  const structure = JSON.stringify(root, null, 2)
  const removeLocalPath = /(?<="fileName": ").*(?=test\/sources\/app)/gmi
  const removeRandomId = /(?<="id": ).*(?=,)/gmi
  const result = structure
    .replace(removeLocalPath, '')
    .replace(removeRandomId, '42')
  t.same(JSON.parse(result), require('./fixture/app-source.json'))

  t.equal(root.hooks.preHandler.length, 1)
  t.match(root.hooks.preHandler[0].source, {
    stackIndex: 0,
    fileName: /test\/sources\/app\.js$/,
    lineNumber: 17,
    columnNumber: 7,
    functionName: 'buildTheSourceApp',
    typeName: null,
    methodName: null
  })

  t.equal(root.children.length, 2)
  t.equal(root.children[0].name, 'register1')
  t.equal(root.children[1].name, 'sibling')
  t.equal(root.routes.length, 4)

  const reg1 = root.children[0]
  t.same(reg1.routes.length, 3)

  const reg2 = reg1.children[0]
  t.same(reg2.routes.length, 2)
})

test('coverage: simple app', async t => {
  const app = await buildApp({ addSource: false })
  await app.ready()
  const root = app.overview()

  const structure = JSON.stringify(root, null, 2)
  const removeRandomId = /(?<="id": ).*(?=,)/gmi
  const result = structure.replace(removeRandomId, '42')
  t.same(JSON.parse(result), require('./fixture/app-no-source.json'))

  t.equal(root.hooks.preHandler.length, 1)
  t.notOk(root.hooks.preHandler[0].source)
})
