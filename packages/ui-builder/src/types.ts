// Fastify Overview data types
export const NODE = Symbol('node');
export const HOOKTYPE = Symbol('hookType');
export const HOOK = Symbol('hook');
export const DECORATOR = Symbol('decorator');
export const DECORATORTYPE = Symbol('decoratorType');
export const ROUTE = Symbol('route');
export const CONNECTION = Symbol('connection');

export interface DataNode {
  name: string;
  children: DataNode[];
  routes: Route[];
  decorators: Decorators;
  hooks: Hooks;
}

export interface Decorators {
  decorate: string[];
  decorateRequest: string[];
  decorateReply: string[];
}

export interface Hooks {
  onRequest: string[];
  preParsing: string[];
  preValidation: string[];
  preHandler: string[];
  preSerialization: string[];
  onError: string[];
  onSend: string[];
  onResponse: string[];
  onTimeout: string[];
  onReady: string[];
  onClose: string[];
  onRoute: string[];
  onRegister: string[];
}

export interface Route {
  method: string;
  url: string;
  prefix: string;
  hooks: Hooks;
}

// Charts data types

export interface ChartNode {
  name: string;
  type:
    | typeof NODE
    | typeof HOOKTYPE
    | typeof HOOK
    | typeof DECORATORTYPE
    | typeof DECORATOR
    | typeof ROUTE;
  children: ChartNode[];
}

export interface ChartNodeFilters {
  showDecorators: boolean;
  showRoutes: boolean;
  showHooks: boolean;
}

// // convert all properties in object inside childs
// export function convertDataNode(node: DataNode): ChartNode {
//     return {
//         name: node.name,
//         type: 'node',
//         children: [
//             { type: 'nodes', name: 'nodes', children: node.children.map(convertDataNode) },
//             convertHooks(node.hooks || {}),
//             convertDecorators(node.decorators || {}),
//             convertRoutes(node.routes || [])
//         ].filter(e => e?.children?.length)
//     } as ChartNode
// }

// export function convertDataNodeCompact(node: DataNode): ChartNode {
//     return {
//         name: node.name,
//         type: 'node',
//         children: [
//             ...node.children.map(convertDataNodeCompact),
//             ...convertHooksCompact(node.hooks || {}),
//             ...convertDecoratorsCompact(node.decorators || {}),
//             ...convertRoutesCompact(node.routes || [])
//         ]
//     } as ChartNode
// }

// export function filterChartNode(node: ChartNode, options: { showDecorators: boolean, showRoutes: boolean, showHooks: boolean }): ChartNode | null {
//     if (['node', 'nodes'].includes(node.type)) {
//         return {
//             ...node, children: node.children.map(child => filterChartNode(child, options)).filter(e => e !== null) as ChartNode[]
//         }
//     }

//     if (['route', 'routes'].includes(node.type) && options.showRoutes) {
//         return {
//             ...node, children: node.children.map(child => filterChartNode(child, options)).filter(e => e !== null) as ChartNode[]
//         }
//     }

//     if (['hooks', 'hookType', 'hook'].includes(node.type) && options.showHooks) {
//         return {
//             ...node, children: node.children.map(child => filterChartNode(child, options)).filter(e => e !== null) as ChartNode[]
//         }
//     }

//     if (['decorator', 'decorators', 'decoratorType'].includes(node.type) && options.showDecorators) {
//         return {
//             ...node, children: node.children
//         }
//     }

//     return null
// }

// function convertHooks(hooks: Hooks) {
//     return {
//         type: 'hooks',
//         name: 'hooks',
//         children: Object.keys(hooks).map(key => ({
//             type: 'hookType',
//             name: key,
//             children: (hooks[key as keyof Hooks]).map(name => ({
//                 type: 'hook',
//                 name,
//                 children: []
//             }))
//         })).filter(node => node.children.length > 0)
//     }
// }

// function convertHooksCompact(hooks: Hooks) {
//     return Object.keys(hooks).map(key => ({
//         type: 'hookType',
//         name: key,
//         children: (hooks[key as keyof Hooks]).map(name => ({
//             type: 'hook',
//             name,
//             children: []
//         }))
//     })).filter(node => node.children.length > 0)
// }

// function convertDecorators(decorators: Decorators) {
//     return {
//         type: 'decorators',
//         name: 'decorators',
//         children: Object.keys(decorators).map(key => ({
//             type: 'decoratorType',
//             name: key,
//             children: (decorators[key as keyof Decorators]).map(name => ({
//                 type: 'decorator',
//                 name,
//                 children: []
//             }))
//         })).filter(node => node.children.length > 0)
//     }
// }

// function convertDecoratorsCompact(decorators: Decorators) {
//     return Object.keys(decorators).map(key => ({
//         type: 'decoratorType',
//         name: key,
//         children: (decorators[key as keyof Decorators]).map(name => ({
//             type: 'decorator',
//             name,
//             children: []
//         }))
//     })).filter(node => node.children.length > 0)
// }

// function convertRoutes(routes: Route[]) {
//     return {
//         type: 'routes',
//         name: 'routes',
//         children: routes.map(route => ({
//             type: 'route',
//             name: route.url,
//             children: [
//                 convertHooks(route.hooks),
//             ].filter(e => e.children.length)
//         }))
//     }
// }

// function convertRoutesCompact(routes: Route[]) {
//     return routes.map(route => ({
//         type: 'route',
//         name: route.url,
//         children: [
//             ...convertHooksCompact(route.hooks),
//         ]
//     }))

// }

// // string shorting
// export function shorten(str: string, maxLength: number): string {
//     if (!str) return ''
//     if (str.length <= maxLength) {
//         return str
//     }
//     return str.substring(0, maxLength / 2) + '...' + str.substring(str.length - maxLength / 2)
// }

// export function calculateChartWidth(node: ChartNode): number {
//     if (node.children.length === 0) {
//         return 1
//     }
//     return node.children.map(calculateChartWidth).reduce((a, b) => a + b)
// }
