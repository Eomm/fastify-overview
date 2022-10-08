import type { FastifyPluginCallback, RouteOptions } from 'fastify';

export interface FastifyOverviewOptions {
  /**
   * Add a `source` property to each node of the tree.
   * @default false
   */
   addSource?: boolean;

  /**
   * Expose a route that will return the JSON structure.
   * By default the route is exposed at `GET /json-overview`.
   * @default false
   */
   exposeRoute?: boolean;

  /**
   * Customize the route's options when `exposeRoute` is set to `true`
   */
   exposeRouteOptions?: RouteOptions;
}

export interface FastifyOverviewDecoratorOptions {
  /**
   * To keep the structure light and clean, you can hide empty properties
   * @default false
   */
   hideEmpty?: boolean;
}

interface OverviewStructureDecorator {
  name: String;
  source?: OverviewStructureSource,
}

interface OverviewStructureHook {
  name: String;
  hash: String;
  source?: OverviewStructureSource;
}

interface OverviewStructureSource {
  stackIndex: Number;
  fileName: String;
  relativeFileName: String;
  lineNumber: Number;
  columnNumber: Number;
  functionName: String;
  typeName?: String;
  methodName?: String;
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
  onReady?: OverviewStructureHook[],
  onClose?: OverviewStructureHook[],
  onRoute?: OverviewStructureHook[],
  onRegister?: OverviewStructureHook[],
}

export interface OverviewStructure {
  id: Number,
  name: String,
  source?: OverviewStructureSource,
  children?: OverviewStructure[],
  decorators?: {
    decorate: OverviewStructureDecorator[],
    decorateRequest: OverviewStructureDecorator[],
    decorateReply: OverviewStructureDecorator[]
  },
  hooks?: OverviewStructureHooks,
  routes?: {
    method: String,
    url: String,
    prefix: String,
    hooks: OverviewStructureHooks,
    source?: OverviewStructureSource,
  }[]
}

declare module 'fastify' {
  interface FastifyInstance {
    overview: (opts?: FastifyOverviewDecoratorOptions) => OverviewStructure;
  }
}

export const FastifyOverview: FastifyPluginCallback<FastifyOverviewOptions>;
export default FastifyOverview;
