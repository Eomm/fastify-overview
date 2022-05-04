import { configureStore } from '@reduxjs/toolkit'

import overviewReducer from './overviewSlice'

export default configureStore({
  reducer: {
    overview: overviewReducer
  }
})
