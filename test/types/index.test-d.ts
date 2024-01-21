import { expectType } from 'tsd'

import fastify, { HTTPMethods } from 'fastify'
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
    expectType<HTTPMethods | HTTPMethods[]>(data.routes![0].method)
  })
  .ready()
