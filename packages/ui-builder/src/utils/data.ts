import {
  ChartNode,
  ChartNodeFilters,
  DataNode,
  DECORATOR,
  Decorators,
  DECORATORTYPE,
  HOOK,
  Hooks,
  HOOKTYPE,
  NODE,
  ROUTE,
  Route,
} from '../types';

export function transformData(
  data: DataNode,
  filters: ChartNodeFilters,
): ChartNode | null {
  return filterChartNode(convertDataNodeToChartNode(data), filters);
}

function convertDataNodeToChartNode(node: DataNode): ChartNode {
  return {
    name: node.name,
    type: NODE,
    children: [
      ...node.children.map(convertDataNodeToChartNode),
      ...convertHooks(node.hooks || {}),
      ...convertDecorators(node.decorators || {}),
      ...convertRoutes(node.routes || []),
    ],
  } as ChartNode;
}

function convertHooks(hooks: Hooks) {
  return Object.keys(hooks)
    .map((key) => ({
      type: HOOKTYPE,
      name: key,
      children: hooks[key as keyof Hooks].map((name) => ({
        type: HOOK,
        name: name.name ?? name, // Victim of current data structure: Hooks are returned as array of strings and array of objects
        children: [],
      })),
    }))
    .filter((node) => node.children.length > 0);
}

function convertDecorators(decorators: Decorators) {
  return Object.keys(decorators)
    .map((key) => ({
      type: DECORATORTYPE,
      name: key,
      children: decorators[key as keyof Decorators].map((name) => ({
        type: DECORATOR,
        name: name.name ?? name,
        children: [],
      })),
    }))
    .filter((node) => node.children.length > 0);
}

function convertRoutes(routes: Route[]) {
  return routes.map((route) => ({
    type: ROUTE,
    name: route.url,
    children: [...convertHooks(route.hooks)],
  }));
}

function filterChartNode(node: ChartNode, filters: ChartNodeFilters): ChartNode | null {
  if ([NODE].includes(node.type)) {
    return {
      ...node,
      children: node.children
        .map((child) => filterChartNode(child, filters))
        .filter((e) => e !== null) as ChartNode[],
    };
  }

  if ([ROUTE].includes(node.type) && filters.showRoutes) {
    return {
      ...node,
      children: node.children
        .map((child) => filterChartNode(child, filters))
        .filter((e) => e !== null) as ChartNode[],
    };
  }

  if ([HOOK, HOOKTYPE].includes(node.type) && filters.showHooks) {
    return {
      ...node,
      children: node.children
        .map((child) => filterChartNode(child, filters))
        .filter((e) => e !== null) as ChartNode[],
    };
  }

  if ([DECORATOR, DECORATORTYPE].includes(node.type) && filters.showDecorators) {
    return {
      ...node,
      children: node.children,
    };
  }

  return null;
}
