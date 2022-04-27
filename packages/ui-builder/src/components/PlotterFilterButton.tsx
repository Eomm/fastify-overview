import { MouseEventHandler } from 'react';

export default function PlotterFilterButton({
  active,
  onClick,
  color,
  children,
}: {
  color: string;
  active: boolean;
  onClick: MouseEventHandler<HTMLButtonElement>;
}) {
  return (
    <button
      className={`rounded-lg border border-gray-100 px-3 py-2 shadow font-bold text-sm uppercase mr-2 flex items-center hover:opacity-50 
      ${color} ${active ? '' : 'opacity-30'}`}
      onClick={onClick}>
      {children}
    </button>
  );
}
