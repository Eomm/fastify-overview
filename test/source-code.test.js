'use strict'

const { test } = require('node:test')
const os = require('os')

const buildApp = require('./sources/app')
const buildAutoload = require('./sources/autoload')

const isWindows = os.platform() === 'win32'

test('simple app', async t => {
  const app = await buildApp({ addSource: true })
  await app.ready()
  const root = app.overview()

  const structure = JSON.stringify(root, null, 2)
  const removeLocalPath = /(?<="fileName": ").*(?=test\/sources\/app)/gmi
  const removeRelativePath = /(?<="relativeFileName": ").*(?=test\/sources\/app)/gmi
  const removeRandomId = /(?<="id": ).*(?=,)/gmi
  const result = structure
    .replace(removeLocalPath, '')
    .replace(removeRelativePath, '')
    .replace(removeRandomId, '42')

  t.assert.deepStrictEqual(root.hooks.preHandler.length, 1)

  if (!isWindows) {
    t.assert.deepStrictEqual(JSON.parse(result), require('./fixture/app-source.json'))
    t.assert.deepStrictEqual(root.hooks.preHandler[0].source.stackIndex, 0)
    t.assert.match(root.hooks.preHandler[0].source.fileName, /test\/sources\/app\.js$/)
    t.assert.deepStrictEqual(root.hooks.preHandler[0].source.lineNumber, 17)
    t.assert.deepStrictEqual(root.hooks.preHandler[0].source.columnNumber, 7)
    t.assert.deepStrictEqual(root.hooks.preHandler[0].source.functionName, 'buildTheSourceApp')
    t.assert.deepStrictEqual(root.hooks.preHandler[0].source.typeName, null)
    t.assert.deepStrictEqual(root.hooks.preHandler[0].source.methodName, null)
  }

  t.assert.deepStrictEqual(root.children.length, 2)
  t.assert.deepStrictEqual(root.children[0].name, 'register1')
  t.assert.deepStrictEqual(root.children[1].name, 'sibling')
  t.assert.deepStrictEqual(root.routes.length, 4)

  const reg1 = root.children[0]
  t.assert.deepStrictEqual(reg1.routes.length, 3)

  const reg2 = reg1.children[0]
  t.assert.deepStrictEqual(reg2.routes.length, 2)
})

test('coverage: simple app', async t => {
  const app = await buildApp({ addSource: false })
  await app.ready()
  const root = app.overview()

  const structure = JSON.stringify(root, null, 2)
  const removeRandomId = /(?<="id": ).*(?=,)/gmi
  const result = structure.replace(removeRandomId, '42')

  if (!isWindows) {
    t.assert.deepStrictEqual(JSON.parse(result), require('./fixture/app-no-source.json'))
  }

  t.assert.deepStrictEqual(root.hooks.preHandler.length, 1)
  t.assert.ok(!root.hooks.preHandler[0].source)
})

test('autoload', async t => {
  const app = await buildAutoload({ addSource: true })
  await app.ready()
  const root = app.overview()

  const structure = JSON.stringify(root, null, 2)
  const removeLocalPath = /(?<="fileName": ").*(?=test\/sources\/.*\.js)/gmi
  const removeRelativePath = /(?<="relativeFileName": ").*(?=test\/sources\/.*\.js)/gmi
  const removeRandomId = /(?<="id": ).*(?=,)/gmi
  const removeLocalName = /(?<="name": ").*(?=\/.*\.js)/gmi
  const result = structure
    .replace(removeLocalPath, '')
    .replace(removeRelativePath, '')
    .replace(removeLocalName, '')
    .replace(removeRandomId, '42')
  if (!isWindows) {
    t.assert.deepStrictEqual(JSON.parse(result), require('./fixture/autoload.json'))
  }
})
