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
  type: 'undefined' | 'object' | 'boolean' | 'number' | 'bigint' | 'string' | 'symbol' | 'function' | 'array'
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

export interface Decorators {
  instance?: Record<string, unknown>
  request?: Record<string, unknown>
  reply?: Record<string, unknown>
}

type ExtractDecoratorType<T extends Record<PropertyKey, unknown>, K extends keyof Decorators> = T extends Decorators ? T[K] : T

export interface OverviewStructure<T = {}, D extends Record<PropertyKey, unknown> = {}> {
  id: Number,
  name: string,
  source?: OverviewStructureSource,
  children?: OverviewStructure<T>[],
  decorators?: {
    decorate: (Omit<OverviewStructureDecorator, keyof ExtractDecoratorType<D, 'instance'>> & ExtractDecoratorType<D, 'instance'>)[],
    decorateRequest: (Omit<OverviewStructureDecorator, keyof ExtractDecoratorType<D, 'request'>> & ExtractDecoratorType<D, 'request'>)[],
    decorateReply: (Omit<OverviewStructureDecorator, keyof ExtractDecoratorType<D, 'reply'>> & ExtractDecoratorType<D, 'reply'>)[]
  },
  hooks?: OverviewStructureHooks,
  routes?: (Omit<RouteItem, keyof T> & T)[]
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

  /**
   * Customise which properties of the route options will be included in the overview
   */
  onRouteDefinition?: (routeOptions: RouteOptions & { routePath: string; path: string; prefix: string }) => Record<string, unknown>

  /**
   * Customise which information from decorators should be added to the overview
   */
  onDecorateDefinition?: (type: 'decorate' | 'decorateRequest' | 'decorateReply', name: string, value: unknown) => Record<string, unknown>
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
    overview: <T = {}, D extends Record<PropertyKey, unknown> = {}>(opts?: FastifyOverviewDecoratorOptions) => OverviewStructure<T, D>;
  }
}

export const FastifyOverview: FastifyPluginCallback<FastifyOverviewOptions>
export default FastifyOverview
