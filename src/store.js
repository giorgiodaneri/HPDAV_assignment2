import { configureStore } from '@reduxjs/toolkit';
import configReducer from './redux/ConfigSlice'; 
import dataSetReducer from './redux/DataSetSlice'; 
import brushDataReducer from './redux/BrushedDataSlice'; 
import configReducerRight from './redux/ConfigSliceRight'; 
import brushDataReducerSecond from './redux/BrushedDataSliceSecond'; 

const store = configureStore({
    reducer: {
        config: configReducer,
        configRight: configReducerRight,
        dataSet: dataSetReducer,
        brushedData: brushDataReducer,
        brushedDataParallelCoords: brushDataReducerSecond,
    },
});

export default store;
