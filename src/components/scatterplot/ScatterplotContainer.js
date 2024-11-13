import './Scatterplot.css'
import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import ScatterplotD3 from './Scatterplot-d3';
import {useSelector, useDispatch} from 'react-redux'
import { updateBrushedData } from '../../redux/DataSetSlice';

function ScatterplotContainer({ setHoveredData, brushedData }) {
    const data = useSelector(state => state.dataSet);
    const xAxis = useSelector((state) => state.dataSet.xAxis);
    const yAxis = useSelector((state) => state.dataSet.yAxis);
    // print to console 
    console.log("ScatterplotContainer xAxis:", xAxis, "yAxis:", yAxis); 
    const dispatch = useDispatch();
    // if xAxis and yAxis are empty, set them to default values
    const xAttribute = xAxis || "Temperature";
    const yAttribute = yAxis || "RentedBikeCount";

    const divContainerRef = useRef(null);
    const scatterplotD3Ref = useRef(null);

    const getCharSize = function() {
        return { width: 1000, height: 400 };
    }

    // did mount
    useEffect(() => {
        const scatterplotD3 = new ScatterplotD3(divContainerRef.current);
        scatterplotD3.create({ size: getCharSize() });
        scatterplotD3Ref.current = scatterplotD3;

        return () => {
            const scatterplotD3 = scatterplotD3Ref.current;
            scatterplotD3.clear();
        };
    }, []);

    useEffect(() => {
        if (data && data.length > 0) {
            const scatterplotD3 = scatterplotD3Ref.current;
            const handleOnBrush = function (selectedData) {
                // Dispatch selected data to the Redux store on brush event
                dispatch(updateBrushedData(selectedData));
            }
            scatterplotD3.renderScatterplot(data, xAttribute, yAttribute, "WindSpeed", "Visibility", {
                handleOnClick: (cellData) => console.log('Clicked:', cellData),
                handleOnMouseEnter: (cellData) => setHoveredData(cellData),
                handleOnMouseLeave: () => setHoveredData(null),
                handleOnBrush: handleOnBrush
            });
        }
    }, [data, dispatch, setHoveredData]);
    return <div ref={divContainerRef} className="scatterplotDivContainer"></div>;
}

export default ScatterplotContainer;