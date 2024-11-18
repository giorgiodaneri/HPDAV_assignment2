import ParallelCoordinates from './ParallelCoordinates-d3';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useRef } from 'react';

function ParallelCoordinatesContainer() {
    const data = useSelector(state => state.dataSet);
    const firstAxis = useSelector(state => state.configRight.firstAxis);
    const secondAxis = useSelector(state => state.configRight.secondAxis);
    const color = useSelector(state => state.configRight.color);
    const invertX = useSelector(state => state.configRight.invertX);
    const invertY = useSelector(state => state.configRight.invertY);
    const brushedData = useSelector(state => state.brushedData); 
    const dispatch = useDispatch();

    // Get a reference to the container div and the ParallelCoordinates instance
    const parallelContainerRef = useRef(null); 
    const parallelCoordinatesRef = useRef(null);

    useEffect(() => {
        if (data.length > 0) {
            // Create a new ParallelCoordinates instance
            parallelCoordinatesRef.current = new ParallelCoordinates(
                parallelContainerRef.current, 
                data, 
                brushedData, 
                firstAxis, 
                secondAxis, 
                color,
                invertX,
                invertY,
                dispatch 
            );
        }
    }, [data, brushedData, firstAxis, secondAxis, color, invertX, invertY, dispatch]);

    useEffect(() => {
        if (firstAxis && secondAxis && color && invertX && invertY) {
            // Draw the updated chart
            const parallelCoordinatesD3 = parallelCoordinatesRef.current;
            parallelCoordinatesD3.drawParallelCoordinates(firstAxis, secondAxis, color, invertX, invertY); 
        }
    }, [firstAxis, secondAxis, color, invertX, invertY, dispatch]);

    return (
        <div ref={parallelContainerRef} id="parallelCoordinatesContainer" style={{ width: '100%', height: '100%' }} ></div>
    );
}

export default ParallelCoordinatesContainer;
