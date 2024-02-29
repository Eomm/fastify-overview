import t from 'tap'
import Fastify from 'fastify'
import fastifyOverview from '../index.js'

// See https://github.com/Eomm/fastify-overview/issues/98#issuecomment-1943830833 for more details

t.test('register module namespace object', async t => {
  const app = Fastify()
  await app.register(fastifyOverview, { addSource: true })

  app.register(await import('./sources/module.mjs'))

  try {
    await app.ready()
  } catch (e) {
    t.fail()
  }

  const overview = app.overview()

  t.equal(overview.children.length, 1)

  const child0 = overview.children[0]
  t.ok(child0.source)
  t.match(child0.source.fileName, /test\/sources\/module\.mjs$/)
})

t.test('register promise of module namespace object', async t => {
  let out
  const logger = {
    debug: (msg) => {},
    info: (msg) => {},
    error: (msg) => {},
    fatal: (msg) => {},
    warn: (msg) => { out += msg },
    trace: (msg) => {},
    child: () => logger
  }

  const app = Fastify({ logger })

  await app.register(fastifyOverview)

  app.register(import('./sources/module.mjs'))

  await app.ready()

 t.match(out, /Promise like plugin/)
})
