import { createSlice } from '@reduxjs/toolkit'

import data from './data'

export const overviewSlice = createSlice({
  name: 'overview',
  initialState: {
    value: data,
    isLoading: false,
    errors: null
  },
  reducers: {
    startLoading: (state) => {
      state.isLoading = true
    },
    load: (state, action) => {
      state.value = action.payload
    },
    loadSuccess: (state, action) => {
      state.value = action.payload
      state.isLoading = false
    },
    loadErrors: (state, action) => {
      state.errors = action.payload
      state.isLoading = false
    }
  }
})

// Actions
export const { startLoading, load, loadSuccess, loadErrors } = overviewSlice.actions

// Selectors
export const selectOverview = (state) => state.overview.value
export const selectOverviewIsLoading = (state) => state.overview.isLoading
export const selectOverviewErrors = (state) => state.overview.errors

export default overviewSlice.reducer
