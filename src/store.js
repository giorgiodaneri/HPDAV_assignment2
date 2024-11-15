// store.js
import { configureStore } from '@reduxjs/toolkit';
import configReducer from './redux/ConfigSlice'; // Update the path based on your folder structure
import dataSetReducer from './redux/DataSetSlice'; // Update the path based on your folder structure
import brushDataReducer from './redux/BrushedDataSlice'; // Update the path based on your folder structure
import configReducerRight from './redux/ConfigSliceRight'; // Update the path based on your folder structure
import { brush } from 'd3';

const store = configureStore({
    reducer: {
        config: configReducer,
        configRight: configReducerRight,
        dataSet: dataSetReducer,
        brushedData: brushDataReducer
    },
});

export default store;
