import { createSlice } from '@reduxjs/toolkit'

export const configSlice = createSlice({
  name: 'config',
  initialState: {
    xAxis : "Temperature",
    yAxis : "RentedBikeCount",
    color : "WindSpeed",
    size : "Humidity"
  },
  reducers: {
    generateFromConfig: (state, action) => {
      state.xAxis = action.payload.xAxis;
      state.yAxis = action.payload.yAxis;
      state.color = action.payload.color;
      state.size = action.payload.size;
    }
  }
})

export const { generateFromConfig } = configSlice.actions

export default configSlice.reducer