import { MouseEventHandler } from 'react';

export default function PlotterFilterButton({
  active,
  activeColor,
  inactiveColor,
  onClick,
  text,
  kind,
}: {
  activeColor: string;
  inactiveColor: string;
  text: string;
  active: boolean;
  onClick: MouseEventHandler<HTMLButtonElement>;
  kind: 'first' | 'last' | 'middle';
}) {
  return (
    <button
      className={`bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-1 px-4 ${
        kind === 'first' ? 'rounded-l ' : ''
      } ${kind === 'last' ? 'rounded-r ' : ''} text-xs`}
      style={{ backgroundColor: active ? activeColor : inactiveColor }}
      onClick={onClick}
    >
      {active === true ? '✓ ' : ''}
      {text}
    </button>
  );
}
