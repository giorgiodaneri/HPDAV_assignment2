import ParallelCoordinates from './ParallelCoordinates-d3';
import { useSelector } from 'react-redux';
import { useEffect, useRef } from 'react';

function ParallelCoordinatesContainer() {
    const data = useSelector(state => state.dataSet);
    const brushedData = useSelector(state => state.dataSet.brushedData); 
    const parallelContainerRef = useRef(null);

    useEffect(() => {
        if (data.length > 0) {
            // Clear any existing SVG elements in the container
            parallelContainerRef.current.innerHTML = '';

            // Create a new ParallelCoordinates instance
            new ParallelCoordinates(parallelContainerRef.current, data, brushedData);
        }
    }, [data, brushedData]);

    return <div ref={parallelContainerRef} id="parallelCoordinatesContainer" style={{ width: '100%', height: '100%' }}></div>;
}

export default ParallelCoordinatesContainer;
