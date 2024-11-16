import ParallelCoordinates from './ParallelCoordinates-d3';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useRef } from 'react';

function ParallelCoordinatesContainer() {
    const data = useSelector(state => state.dataSet);
    const firstAxis = useSelector(state => state.configRight.firstAxis);
    const secondAxis = useSelector(state => state.configRight.secondAxis);
    const thirdAxis = useSelector(state => state.configRight.thirdAxis);
    const brushedData = useSelector(state => state.brushedData); 
    const dispatch = useDispatch();

    const parallelContainerRef = useRef(null); // Ref for the container
    const parallelCoordinatesRef = useRef(null); // Ref for the ParallelCoordinates instance

    useEffect(() => {
        if (data.length > 0) {
            // Clear any existing SVG elements in the container
            // parallelContainerRef.current.innerHTML = '';

            // Create a new ParallelCoordinates instance, passing the dispatch function
            parallelCoordinatesRef.current = new ParallelCoordinates(
                parallelContainerRef.current, 
                data, 
                brushedData, 
                firstAxis, 
                secondAxis, 
                thirdAxis,
                dispatch // Pass the dispatch function
            );
        }
    }, [data, brushedData, firstAxis, secondAxis, thirdAxis, dispatch]);

    useEffect(() => {
        if (firstAxis && secondAxis && thirdAxis) {
            const parallelCoordinatesD3 = parallelCoordinatesRef.current;
        
            parallelCoordinatesD3.drawParallelCoordinates(firstAxis, secondAxis, thirdAxis);
        }
    }, [firstAxis, secondAxis, thirdAxis, dispatch]);

    return (
        <div
            ref={parallelContainerRef}
            id="parallelCoordinatesContainer"
            style={{ width: '100%', height: '100%' }}
        ></div>
    );
}

export default ParallelCoordinatesContainer;
