import { createSlice } from '@reduxjs/toolkit'

export const configSliceRight = createSlice({
  name: 'configRight',
  initialState: {
    firstAxis : "Temperature",
    secondAxis : "RentedBikeCount",
    third : "Rainfall",
    invertX : false,
    invertY : false,
    invertZ : false
  },
  reducers: {
    generateFromConfigRight: (state, action) => {
      // Update both xAxis and yAxis with the selected values
        state.firstAxis = action.payload.firstAxis;
        state.secondAxis = action.payload.secondAxis;
        state.thirdAxis = action.payload.thirdAxis;
        state.invertX = action.payload.invertX;
        state.invertY = action.payload.invertY;
        state.invertZ = action.payload.invertZ;
    }
  }
})

// Action creators are generated for each case reducer function
export const { generateFromConfigRight } = configSliceRight.actions

export default configSliceRight.reducer