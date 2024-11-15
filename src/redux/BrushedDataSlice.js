import { createSlice } from '@reduxjs/toolkit'

export const brushedDataSlice = createSlice({
  name: 'brushedData',
  initialState: {
    brushedData: []
},
  reducers: {
    setBrushedData: (state, action) => {
        state.brushedData = action.payload; // Append new data to the existing array
    },
  }
})

// Action creators are generated for each case reducer function
export const { setBrushedData } = brushedDataSlice.actions

export default brushedDataSlice.reducer