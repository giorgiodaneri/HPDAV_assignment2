import { createSlice } from '@reduxjs/toolkit'

export const configSlice = createSlice({
  name: 'config',
  initialState: {
    xAxis : "Temperature",
    yAxis : "RentedBikeCount",
  },
  reducers: {
    updateAxes: (state, action) => {
      console.log("updateAxes:", action.payload);
      return {...state, xAxis:action.payload.xAxis, yAxis:action.payload.yAxis};
    },
    generateFromConfig: (state, action) => {
      // Update both xAxis and yAxis with the selected values
      state.xAxis = action.payload.xAxis;
      state.yAxis = action.payload.yAxis;
    }
  }
})

// Action creators are generated for each case reducer function
export const { updateAxes, generateFromConfig } = configSlice.actions

export default configSlice.reducer