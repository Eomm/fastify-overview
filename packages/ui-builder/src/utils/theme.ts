import {
  ChartNode,
  CONNECTION,
  DECORATOR,
  DECORATORTYPE,
  HOOK,
  HOOKTYPE,
  NODE,
  ROUTE,
} from '../types';

export const colors = {
  [HOOK]: '#BF616A',
  [HOOKTYPE]: '#BF616A',
  [DECORATOR]: '#A3BE8C',
  [DECORATORTYPE]: '#A3BE8C',
  [ROUTE]: '#5E81AC',
  [NODE]: '#334155',
  [CONNECTION]: '#CBD5E1',
} as const;

// COLOR AND STYLE
export function getColor(node: ChartNode) {
  return colors[node.type || NODE];
}
