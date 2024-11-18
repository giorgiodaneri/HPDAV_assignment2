import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import Papa from "papaparse"

// Get the data in asyncThunk
export const getSeoulBikeData = createAsyncThunk('seoulBikeData/fetchData', async () => {
  const response = await fetch('data/SeoulBikeData.csv');
  const responseText = await response.text();
  console.log("loaded file length:" + responseText.length);
  const responseJson = Papa.parse(responseText, { header: true, dynamicTyping: true });
  // Filter out entries where Date is null or empty 
  // Otherwise the corresponding points are badly positioned in the scatterplot
  const filteredData = responseJson.data
      .filter(item => item.Date && item.Date.trim() !== "")
      .map((item, i) => ({ ...item, index: i }));

  return filteredData;
})

export const dataSetSlice = createSlice({
  name: 'dataSet',
  initialState: {
    data: [], 
    brushedData: [],
  },
  
  reducers: {
    setData: (state, action) => {
      state.data = action.payload;
    },
    setBrushedData: (state, action) => {
      return action.payload.brushedData;
    }
  },
  extraReducers: builder => {
    builder.addCase(getSeoulBikeData.fulfilled, (state, action) => {
      return action.payload
    })
  }
})

export const { setData, setBrushedData } = dataSetSlice.actions;

export default dataSetSlice.reducer;