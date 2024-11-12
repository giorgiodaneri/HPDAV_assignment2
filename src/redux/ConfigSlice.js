import { createSlice } from '@reduxjs/toolkit'

export const configSlice = createSlice({
  name: 'config',
  initialState: {
    nbRows: 4,
    nbCols: 4,
  },
  reducers: {
    updateNbRowsAndCols: (state, action) => {
      return {...state, nbRows:action.payload.nbRows, nbCols:action.payload.nbCols};
    },
  }
})

// Action creators are generated for each case reducer function
export const { updateNbRowsAndCols} = configSlice.actions

export default configSlice.reducer