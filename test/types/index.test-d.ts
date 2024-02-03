import { expectError, expectType } from 'tsd'

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

app
  .register(fastifyOverview, {
    onRouteDefinition: (routeOptions) => {
      return {
        bodySchema: routeOptions.schema?.body,
        headerNames: Object.keys(routeOptions.schema?.headers ?? {})
      }
    }
  })
  .after((_) => {
    const data = app.overview<{ bodySchema: {}, headerNames: string[] }>()
    expectType<OverviewStructure<{ bodySchema: {}, headerNames: string[] }>>(data)
  })
  .ready()

app
  .register(fastifyOverview, {
    onRouteDefinition: (routeOptions) => {
      return {
        url: routeOptions.url.length
      }
    }
  })
  .after((_) => {
    const data = app.overview<{ url: number }>()
    expectType<OverviewStructure<{ url: number }>>(data)
    expectType<number>(data.routes![0].url)
  })
  .ready()
