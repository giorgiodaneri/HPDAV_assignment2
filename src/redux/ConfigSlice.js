import { createSlice } from '@reduxjs/toolkit'

export const configSlice = createSlice({
  name: 'config',
  initialState: {
    xAxis : "Temperature",
    yAxis : "RentedBikeCount",
    color : "WindSpeed"
  },
  reducers: {
    generateFromConfig: (state, action) => {
      // clear the state
      // Update both xAxis and yAxis with the selected values
      state.xAxis = action.payload.xAxis;
      state.yAxis = action.payload.yAxis;
      state.color = action.payload.color;
    }
  }
})

// Action creators are generated for each case reducer function
export const { generateFromConfig } = configSlice.actions

export default configSlice.reducer