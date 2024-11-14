import './Scatterplot.css';
import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import ScatterplotD3 from './Scatterplot-d3';
import { useSelector, useDispatch } from 'react-redux';
import { updateBrushedData } from '../../redux/DataSetSlice';

function ScatterplotContainer({ setHoveredData, brushedData }) {
    const data = useSelector((state) => state.dataSet);
    const xAxis = useSelector((state) => state.config.xAxis);  // Updated: Retrieve xAxis from config
    const yAxis = useSelector((state) => state.config.yAxis);  // Updated: Retrieve yAxis from config
    const dispatch = useDispatch();

    const divContainerRef = useRef(null);
    const scatterplotD3Ref = useRef(null);

    const getCharSize = function(){
        // getting size from parent item
        let width;// = 800;
        let height;// = 100;
        if(divContainerRef.current!==undefined){
            width=divContainerRef.current.offsetWidth;
            // width = '100%';
            height=divContainerRef.current.offsetHeight;
            // height = '100%';
        }
        return {width:width,height:height};
    }
    // Initial scatterplot setup
    useEffect(() => {
        const scatterplotD3 = new ScatterplotD3(divContainerRef.current);
        scatterplotD3.create({ size: getCharSize() });
        scatterplotD3Ref.current = scatterplotD3;

        return () => scatterplotD3Ref.current.clear();
    }, []);

    // Render scatterplot with selected x and y axes when data or axes change
    useEffect(() => {
        if (data && data.length > 0 && xAxis && yAxis) {
            const scatterplotD3 = scatterplotD3Ref.current;
            const handleOnBrush = (selectedData) => {
                dispatch(updateBrushedData(selectedData));
            };
            scatterplotD3.renderScatterplot(data, xAxis, yAxis, "WindSpeed", "Visibility", {
                handleOnClick: (cellData) => console.log('Clicked:', cellData),
                handleOnMouseEnter: (cellData) => setHoveredData(cellData),
                handleOnMouseLeave: () => setHoveredData(null),
                handleOnBrush,
            });
        }
    }, [data, xAxis, yAxis, dispatch, setHoveredData]);

    return <div ref={divContainerRef} className="scatterplotDivContainer"></div>;
}

export default ScatterplotContainer;
