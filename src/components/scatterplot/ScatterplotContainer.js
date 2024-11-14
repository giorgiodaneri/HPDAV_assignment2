import './Scatterplot.css';
import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import ScatterplotD3 from './Scatterplot-d3';
import { useSelector, useDispatch } from 'react-redux';
import { updateBrushedData } from '../../redux/DataSetSlice';

function ScatterplotContainer({ setHoveredData, brushedData }) {
    const data = useSelector(state => state.dataSet);
    const xAxis = useSelector(state => state.dataSet.xAxis);
    const yAxis = useSelector(state => state.dataSet.yAxis);
    const dispatch = useDispatch();

    const xAttribute = xAxis || "Temperature";
    const yAttribute = yAxis || "RentedBikeCount";

    const divContainerRef = useRef(null);
    const scatterplotD3Ref = useRef(null);

    // Resize handler to adapt the scatter plot size to the container's dimensions
    const updateChartSize = () => {
        const container = divContainerRef.current;
        return {
            width: container.offsetWidth,
            height: container.offsetHeight
        };
    };

    // Initialize and create the scatter plot
    useEffect(() => {
        const scatterplotD3 = new ScatterplotD3(divContainerRef.current);
        scatterplotD3.create({ size: updateChartSize() });
        scatterplotD3Ref.current = scatterplotD3;

        // Clear on unmount
        return () => scatterplotD3.clear();
    }, []);

    // Update scatter plot data or dimensions on relevant state changes
    useEffect(() => {
        console.log('Data scatterplotContainer:', data);
        if (data && data.length > 0) {
            // Clear any existing SVG elements in the container
            scatterplotD3Ref.current.innerHTML = '';   
            const scatterplotD3 = scatterplotD3Ref.current;
            const handleOnBrush = selectedData => dispatch(updateBrushedData(selectedData));

            // Re-render the scatter plot with new data and attributes
            scatterplotD3.renderScatterplot(data, xAttribute, yAttribute, "WindSpeed", "Visibility", {
                handleOnClick: cellData => console.log('Clicked:', cellData),
                handleOnMouseEnter: cellData => setHoveredData(cellData),
                handleOnMouseLeave: () => setHoveredData(null),
                handleOnBrush
            });
        }
    }, [data, xAttribute, yAttribute, dispatch, setHoveredData]);

    return <div ref={divContainerRef} className="scatterplotDivContainer" style={{ width: '100%', height: '100%' }}></div>;
}

export default ScatterplotContainer;
