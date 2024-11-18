import { createSlice } from '@reduxjs/toolkit'

export const brushedDataSlice = createSlice({
  name: 'brushedData',
  initialState: {
    brushedData: []
},
  reducers: {
    setBrushedData: (state, action) => {
        state.brushedData = action.payload; 
    },
  }
})

export const { setBrushedData } = brushedDataSlice.actions

export default brushedDataSlice.reducer