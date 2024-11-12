import ParallelCoordinates from './ParallelCoordinates-d3';
import { useSelector } from 'react-redux';
import { useEffect, useRef } from 'react';

function ParallelCoordinatesContainer() {
    const data = useSelector(state => state.dataSet);

    const parallelContainerRef = useRef(null);

    useEffect(() => {
        if (data.length > 0) {
            new ParallelCoordinates(parallelContainerRef.current, data);
        }
    }, [data]);

    return <div ref={parallelContainerRef} id="parallelCoordinatesContainer"></div>;
}

export default ParallelCoordinatesContainer;