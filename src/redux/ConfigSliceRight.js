import { createSlice } from '@reduxjs/toolkit'

export const configSliceRight = createSlice({
  name: 'configRight',
  initialState: {
    firstAxis : "Temperature",
    secondAxis : "RentedBikeCount",
    color : "Humidity",
    invertX : false,
    invertY : false
  },
  reducers: {
    generateFromConfigRight: (state, action) => {
        state.firstAxis = action.payload.firstAxis;
        state.secondAxis = action.payload.secondAxis;
        state.color = action.payload.color;
        state.invertX = action.payload.invertX;
        state.invertY = action.payload.invertY;
    }
  }
})

export const { generateFromConfigRight } = configSliceRight.actions

export default configSliceRight.reducer