import ParallelCoordinates from './ParallelCoordinates-d3';
import { useSelector } from 'react-redux';
import { useEffect, useRef } from 'react';

function ParallelCoordinatesContainer() {
    const data = useSelector(state => state.dataSet);
    const firstAxis = useSelector(state => state.configRight.firstAxis);
    const secondAxis = useSelector(state => state.configRight.secondAxis);
    const thirdAxis = useSelector(state => state.configRight.thirdAxis);
    const brushedData = useSelector(state => state.brushedData); 

    const parallelContainerRef = useRef(null); // Ref for the container
    const parallelCoordinatesRef = useRef(null); // Ref for the ParallelCoordinates instance

    useEffect(() => {
        if (data.length > 0) {
            // Clear any existing SVG elements in the container
            parallelContainerRef.current.innerHTML = '';

            // print brushedData to console
            console.log("Brushed Data: " , brushedData);

            // Create a new ParallelCoordinates instance
            parallelCoordinatesRef.current = new ParallelCoordinates(
                parallelContainerRef.current, 
                data, 
                brushedData, 
                firstAxis, 
                secondAxis, 
                thirdAxis
            );
        }
    }, [data, brushedData, firstAxis, secondAxis, thirdAxis]);

    useEffect(() => {
        if (parallelCoordinatesRef.current) {
            // Call drawParallelCoordinates on the ParallelCoordinates instance
            parallelCoordinatesRef.current.drawParallelCoordinates(firstAxis, secondAxis, thirdAxis);
        }
    }, [firstAxis, secondAxis, thirdAxis]);

    return (
        <div
            ref={parallelContainerRef}
            id="parallelCoordinatesContainer"
            style={{ width: '100%', height: '100%' }}
        ></div>
    );
}

export default ParallelCoordinatesContainer;
