import ParallelCoordinates from './ParallelCoordinates-d3';
import { useSelector } from 'react-redux';
import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

function ParallelCoordinatesContainer( brushedData) {
    const data = useSelector(state => state.dataSet);

    // convert brushedData to an array
    brushedData = brushedData ? Object.values(brushedData) : [];

    const parallelContainerRef = useRef(null);

    useEffect(() => {
        // Check if data is loaded before rendering
        if (data.length > 0) {
            // Clear the previous plot by removing child nodes
            d3.select(parallelContainerRef.current).selectAll("*").remove();

            // Create a new parallel coordinates plot with the updated brushed data
            new ParallelCoordinates(parallelContainerRef.current, data, brushedData);
        }
    }, [data, brushedData]); // Dependency array includes `brushedData` to listen for changes


    return <div ref={parallelContainerRef} id="parallelCoordinatesContainer"></div>;
}

export default ParallelCoordinatesContainer;
