import { expectAssignable, expectError, expectType } from 'tsd'

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

app
  .register(fastifyOverview, {
    onDecorateDefinition: (type, name, value) => {
      if (typeof value === 'object' && !Array.isArray(value)) {
        return {
          embedded: Object.keys(value ?? {})
        }
      } else {
        return {}
      }
    }
  })
  .after((_) => {
    const data = app.overview<{}, { embedded: string[] }>()

    expectType<OverviewStructure<{}, { embedded: string[] }>>(data)
    expectAssignable<{ type: string, name: string, embedded: string[] }>(data.decorators!.decorate[0]!)
    expectAssignable<{ type: string, name: string, embedded: string[] }>(data.decorators!.decorateRequest[0]!)
    expectAssignable<{ type: string, name: string, embedded: string[] }>(data.decorators!.decorateReply[0]!)
  })
  .ready()

app
  .register(fastifyOverview, {
    onDecorateDefinition: (type, name, value) => {
      if (type === 'decorate') {
        if (typeof value === 'object' && !Array.isArray(value)) {
          return {
            embedded: Object.keys(value ?? {})
          }
        } else {
          return {}
        }
      } else if (type === 'decorateRequest') {
        if (typeof value === 'object' && !Array.isArray(value)) {
          return {
            recursiveNum: Object.keys(value ?? {}).length
          }
        } else {
          return {}
        }
      } else {
        return {}
      }
    }
  })
  .after((_) => {
    const data = app.overview<{}, { instance: { embedded: string[] }, request: { recursiveNum: number } }>()

    expectType<OverviewStructure<{}, { instance: { embedded: string[] }, request: { recursiveNum: number } }>>(data)

    expectAssignable<{ type: string, name: string, embedded: string[] }>(data.decorators!.decorate[0]!)
    expectError<{ type: string, name: string, embedded: string[] }>(data.decorators!.decorateRequest[0]!)
    expectError<{ type: string, name: string, embedded: string[] }>(data.decorators!.decorateReply[0]!)

    expectAssignable<{ type: string, name: string, recursiveNum: number }>(data.decorators!.decorateRequest[0]!)
    expectError<{ type: string, name: string, recursiveNum: number }>(data.decorators!.decorate[0]!)
    expectError<{ type: string, name: string, recursiveNum: number }>(data.decorators!.decorateReply[0]!)
  })
  .ready()
