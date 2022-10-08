import { expectType } from 'tsd'

import fastify from 'fastify'
import fastifyOverview, { OverviewStructure } from '../../index'

const app = fastify()

app
  .register(fastifyOverview, {
    addSource: true,
    exposeRoute: true,
    exposeRouteOptions: {
      url: '/custom'
    }
  })
  .after((_) => {
    const data = app.overview()
    expectType<OverviewStructure>(data)
  })
  .ready()
