import React from 'react'

import { DECORATOR, HOOK, ROUTE } from '../utils/data'
import { colors } from '../utils/theme'
import IconDecorator from './IconDecorator'
import IconHook from './IconHook'
import IconRoutes from './IconRoutes'
import IconSave from './IconSave'
import IconSun from './IconSun'
import LogoFastify from './LogoFastify'
import PlotterFilterButton from './PlotterFilterButton'

export default function Header ({ filters, setFilters }) {
  return (
    <header className=' shadow bg-white-300 z-10 filter drop-shadow-2xl'>
      <nav className='text-gray-900 flex justify-between p-4 items-center'>
        <LogoFastify className='h-8 text-gray-900 ' />
        <div>
          <div className='flex justify-end'>
            <button
              className='rounded-lg border border-gray-100 px-3 py-2 shadow font-bold text-sm uppercase mr-3 flex items-center'
            >
              <IconSun />
            </button>
            <button
              className='rounded-lg border border-gray-100 px-3 py-2 shadow font-bold text-sm uppercase flex items-center'
            >
              <IconSave />
            </button>
          </div>
        </div>
      </nav>
      <nav className='border-t border-gray-100 p-4'>
        <div className='flex justify-end'>
          <PlotterFilterButton
            color={colors[HOOK]}
            active={filters.showHooks}
            onClick={() =>
              setFilters({ ...filters, showHooks: !filters.showHooks })}
          >
            <IconHook /> Hooks
          </PlotterFilterButton>
          <PlotterFilterButton
            color={colors[DECORATOR]}
            active={filters.showDecorators}
            onClick={() =>
              setFilters({
                ...filters,
                showDecorators: !filters.showDecorators
              })}
          >
            <IconDecorator /> Decorators
          </PlotterFilterButton>
          <PlotterFilterButton
            color={colors[ROUTE]}
            active={filters.showRoutes}
            onClick={() =>
              setFilters({ ...filters, showRoutes: !filters.showRoutes })}
          >
            <IconRoutes /> Routes
          </PlotterFilterButton>
        </div>
      </nav>
    </header>
  )
}
