import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import Papa from "papaparse"

// get the data in asyncThunk
export const getSeoulBikeData = createAsyncThunk('seoulBikeData/fetchData', async () => {
  const response = await fetch('data/SeoulBikeData.csv');
  const responseText = await response.text();
  console.log("loaded file length:" + responseText.length);
  const responseJson = Papa.parse(responseText, { header: true, dynamicTyping: true });
  // filter out entries where Date is null or empty 
  // otherwise the corresponding points are badly positioned in the scatterplot
  const filteredData = responseJson.data
      .filter(item => item.Date && item.Date.trim() !== "")
      .map((item, i) => ({ ...item, index: i }));

  return filteredData;
})

function generateUpdatedPlot(dataset, xAxis, yAxis)
 {
  console.log("generateUpdatedPlot with x:", xAxis, "y:", yAxis);
  return {xAxis : xAxis, yAxis : yAxis};
 }
export const dataSetSlice = createSlice({
  // name of the slice
  name: 'dataSet',
  initialState: {
    data: [], // Initial empty array for data
    // selectedAxes: { xAxis: 'Temperature', yAxis: 'RentedBikeCount' } // Default selected axes
    xAxis : "Temperature",
    yAxis : "RentedBikeCount"
  },
  
  reducers: {
    setData: (state, action) => {
      state.data = action.payload;
      state.xAxis = action.payload.xAxis;
      state.yAxis = action.payload.yAxis;
    },
    updateBrushedData: (state, action) => {
      const selectedData = action.payload.map(cellData => {
        if (cellData.index === action.payload.index) {
        return {...cellData,selected:!cellData.selected};
        } else {
        return cellData;
        }
    })
      // state.brushedData = action.payload; // Update brushed data
      return {...state, selectedData};
    },
    generateFromConfig: (state, action) => {
      // print the selectedAxes to console
      console.log("generateFromConfig payload:", action.payload.xAxis, action.payload.yAxis);
      return {...state, xAxis: action.payload.xAxis, yAxis: action.payload.yAxis};
      // return generateUpdatedPlot(state.data, action.payload.selectedAxes.xAxis, action.payload.selectedAxes.yAxis);
    }
  },
  extraReducers: builder => {
    builder.addCase(getSeoulBikeData.fulfilled, (state, action) => {
      // Add any fetched house to the array
      return action.payload
    })
  }
})

// Action creators are generated for each case reducer function
export const { setData, updateBrushedData, generateFromConfig } = dataSetSlice.actions;

export default dataSetSlice.reducer;