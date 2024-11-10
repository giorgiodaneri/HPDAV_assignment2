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

export const dataSetSlice = createSlice({
  name: 'dataSet',
  initialState: [],
  reducers: {
      // add reducer if needed
  },
  extraReducers: builder => {
    builder.addCase(getSeoulBikeData.fulfilled, (state, action) => {
      // Add any fetched house to the array
      return action.payload
    })
  }
})

// Action creators are generated for each case reducer function
export const { updateSelectedItem } = dataSetSlice.actions

export default dataSetSlice.reducer