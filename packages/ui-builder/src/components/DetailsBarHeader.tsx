import React, { DetailedHTMLProps } from 'react';

interface DetailsBarHeaderPops {
  title: string;
}

export default function DetailsBarHeader({ title }: DetailsBarHeaderPops) {
  return (
    <h3
      className={
        'bg-gray-600 text-gray-100 p-4 m-2 rounded text-sm uppercase font-semibold'
      }
    >
      {title}
    </h3>
  );
}
