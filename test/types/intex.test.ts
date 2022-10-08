import { expectType } from "tsd";

import fastify,{ RouteOptions } from 'fastify';
import fastifyOverview, { OverviewStructure } from '../../index';


const app = fastify();

app
  .register(fastifyOverview, {
    addSource: true,
    exposeRoute: true,
    exposeRouteOptions: {
      url: '/custom'
    } as RouteOptions
  })
  .after((err) => {
    const data = app.overview();
    expectType<OverviewStructure>(data);
  })
  .ready();
