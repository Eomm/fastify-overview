export const NODE = Symbol('node')
export const HOOKTYPE = Symbol('hookType')
export const HOOK = Symbol('hook')
export const DECORATOR = Symbol('decorator')
export const DECORATORTYPE = Symbol('decoratorType')
export const ROUTE = Symbol('route')
export const CONNECTION = Symbol('connection')

export function transformData (data, filters) {
  return filterChartNode(convertDataNodeToChartNode(data), filters)
}

function convertDataNodeToChartNode (node) {
  return {
    name: node.name,
    type: NODE,
    children: [
      ...node.children.map(convertDataNodeToChartNode),
      ...convertHooks(node.hooks || {}),
      ...convertDecorators(node.decorators || {}),
      ...convertRoutes(node.routes || [])
    ]
  }
}

function convertHooks (hooks) {
  return Object.keys(hooks)
    .map((key) => ({
      type: HOOKTYPE,
      name: key,
      children: hooks[key].map((name) => ({
        type: HOOK,
        name: name.name ?? name, // Victim of current data structure: Hooks are returned as array of strings and array of objects
        children: []
      }))
    }))
    .filter((node) => node.children.length > 0)
}

function convertDecorators (decorators) {
  return Object.keys(decorators)
    .map((key) => ({
      type: DECORATORTYPE,
      name: key,
      children: decorators[key].map((name) => ({
        type: DECORATOR,
        name: name.name ?? name,
        children: []
      }))
    }))
    .filter((node) => node.children.length > 0)
}

function convertRoutes (routes) {
  return routes.map((route) => ({
    type: ROUTE,
    name: route.url,
    children: [...convertHooks(route.hooks)]
  }))
}

function filterChartNode (node, filters) {
  if ([NODE].includes(node.type)) {
    return {
      ...node,
      children: node.children
        .map((child) => filterChartNode(child, filters))
        .filter((e) => e !== null)
    }
  }

  if ([ROUTE].includes(node.type) && filters.showRoutes) {
    return {
      ...node,
      children: node.children
        .map((child) => filterChartNode(child, filters))
        .filter((e) => e !== null)
    }
  }

  if ([HOOK, HOOKTYPE].includes(node.type) && filters.showHooks) {
    return {
      ...node,
      children: node.children
        .map((child) => filterChartNode(child, filters))
        .filter((e) => e !== null)
    }
  }

  if (
    [DECORATOR, DECORATORTYPE].includes(node.type) &&
    filters.showDecorators
  ) {
    return {
      ...node,
      children: node.children
    }
  }

  return null
}
