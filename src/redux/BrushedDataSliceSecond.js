import { createSlice } from '@reduxjs/toolkit'

export const brushedDataSliceSecond = createSlice({
  name: 'brushedDataParallelCoords',
  initialState: {
    brushedDataParallelCoords: []
},
  reducers: {
    setBrushedDataParallelCoords: (state, action) => {
        state.brushedDataParallelCoords = action.payload; // Append new data to the existing array
    },
  }
})

// Action creators are generated for each case reducer function
export const { setBrushedDataParallelCoords } = brushedDataSliceSecond.actions

export default brushedDataSliceSecond.reducer