import React from 'react';

import IconDecorator from './IconDecorator';
import IconHook from './IconHook';
import IconRoutes from './IconRoutes';
import IconSave from './IconSave';
import IconSun from './IconSun';
import LogoFastify from './LogoFastify';

export default function Header() {
  return (
    <header className={' shadow bg-white-300 z-10 filter drop-shadow-2xl'}>
      <nav className={'text-gray-900 flex justify-between p-4 items-center'}>
        <LogoFastify className={'h-8 text-gray-900 '}></LogoFastify>

        <div>
          <div className={'flex justify-end'}>
            <button
              className={
                'rounded-lg border border-gray-100 px-3 py-2 shadow font-bold text-sm uppercase mr-3 flex items-center'
              }>
              <IconSun />
            </button>
            <button
              className={
                'rounded-lg border border-gray-100 px-3 py-2 shadow font-bold text-sm uppercase flex items-center'
              }>
              <IconSave />
            </button>
          </div>
        </div>
      </nav>
      <nav className={'border-t border-gray-100 p-4'}>
        <div className={'flex justify-end'}>
          <button
            className={
              'rounded-lg border border-gray-100 px-3 py-2 shadow font-bold text-sky-600 text-sm uppercase mr-2 flex items-center hover:opacity-50'
            }>
            <IconHook /> Hooks
          </button>
          <button
            className={
              'rounded-lg border border-gray-100 px-3 py-2 shadow font-bold text-lime-600 text-sm uppercase mr-2 flex items-center hover:opacity-50'
            }>
            <span className={'opacity-30 flex'}>
              <IconDecorator /> Decorators
            </span>
          </button>
          <button
            className={
              'rounded-lg border border-gray-100 px-3 py-2 shadow font-bold text-rose-600 text-sm uppercase  flex items-center hover:opacity-50'
            }>
            <IconRoutes /> Routes
          </button>
        </div>
      </nav>
    </header>
  );
}
