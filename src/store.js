// store.js
import { configureStore } from '@reduxjs/toolkit';
import configReducer from './redux/ConfigSlice'; // Update the path based on your folder structure
import dataSetReducer from './redux/DataSetSlice'; // Update the path based on your folder structure

const store = configureStore({
    reducer: {
        config: configReducer,
        dataSet: dataSetReducer,
    },
});

export default store;
