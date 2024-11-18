import { createSlice } from '@reduxjs/toolkit'

export const brushedDataSliceSecond = createSlice({
  name: 'brushedDataParallelCoords',
  initialState: {
    brushedDataParallelCoords: []
},
  reducers: {
    setBrushedDataParallelCoords: (state, action) => {
        state.brushedDataParallelCoords = action.payload; 
    },
  }
})

export const { setBrushedDataParallelCoords } = brushedDataSliceSecond.actions

export default brushedDataSliceSecond.reducer