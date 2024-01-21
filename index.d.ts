import type { FastifyPluginCallback, RouteOptions, HTTPMethods } from 'fastify'

interface OverviewStructureSource {
  stackIndex: number,
  fileName: string,
  relativeFileName: string,
  lineNumber: number,
  columnNumber: number,
  functionName: string,
  typeName?: string,
  methodName?: string,
}

interface OverviewStructureDecorator {
  name: string;
  source?: OverviewStructureSource,
}

interface OverviewStructureHook {
  name: string;
  hash: string;
  source?: OverviewStructureSource;
}

interface OverviewStructureHooks {
  onRequest?: OverviewStructureHook[],
  preParsing?: OverviewStructureHook[],
  preValidation?: OverviewStructureHook[],
  preHandler?: OverviewStructureHook[],
  preSerialization?: OverviewStructureHook[],
  onError?: OverviewStructureHook[],
  onSend?: OverviewStructureHook[],
  onResponse?: OverviewStructureHook[],
  onTimeout?: OverviewStructureHook[],
  onListen?: OverviewStructureHook[],
  onReady?: OverviewStructureHook[],
  preClose?: OverviewStructureHook[],
  onClose?: OverviewStructureHook[],
  onRoute?: OverviewStructureHook[],
  onRegister?: OverviewStructureHook[],
  onRequestAbort?: OverviewStructureHook[],
}

interface RouteItem {
  method: HTTPMethods | HTTPMethods[],
  url: string,
  prefix: string,
  hooks: OverviewStructureHooks,
  source?: OverviewStructureSource,
}

export interface OverviewStructure {
  id: Number,
  name: string,
  source?: OverviewStructureSource,
  children?: OverviewStructure[],
  decorators?: {
    decorate: OverviewStructureDecorator[],
    decorateRequest: OverviewStructureDecorator[],
    decorateReply: OverviewStructureDecorator[]
  },
  hooks?: OverviewStructureHooks,
  routes?: RouteItem[]
}

export interface FastifyOverviewOptions {
  /**
   * Add a `source` property to each node of the tree.
   * @default false
   */
   addSource?: boolean,

  /**
   * Expose a route that will return the JSON structure.
   * By default the route is exposed at `GET /json-overview`.
   * @default false
   */
   exposeRoute?: boolean,

  /**
   * Customize the route's options when `exposeRoute` is set to `true`
   */
   exposeRouteOptions?: Partial<RouteOptions>,
}

export interface FastifyOverviewDecoratorOptions {
  /**
   * Filters routes based on the provided predicate
   */
   routesFilter?: (routeItem: RouteItem) => boolean,
  /**
   * To keep the structure light and clean, you can hide empty properties
   * @default false
   */
   hideEmpty?: boolean,
}

declare module 'fastify' {
  export interface FastifyInstance {
    overview: (opts?: FastifyOverviewDecoratorOptions) => OverviewStructure;
  }
}

export const FastifyOverview: FastifyPluginCallback<FastifyOverviewOptions>
export default FastifyOverview
