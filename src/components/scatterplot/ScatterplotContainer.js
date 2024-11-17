import './Scatterplot.css';
import { useEffect, useRef } from 'react';
import ScatterplotD3 from './Scatterplot-d3';
import { useSelector, useDispatch } from 'react-redux';
import { setBrushedData } from '../../redux/BrushedDataSlice';

function ScatterplotContainer() {
    const data = useSelector((state) => state.dataSet);
    const xAxis = useSelector((state) => state.config.xAxis);
    const yAxis = useSelector((state) => state.config.yAxis);
    const color = useSelector((state) => state.config.color);
    const size = "Visibility";
    const brushedDataParallelCoords = useSelector((state) => state.brushedDataParallelCoords);
    const dispatch = useDispatch();

    const divContainerRef = useRef(null);
    const scatterplotD3Ref = useRef(null);

    const getCharSize = () => ({
        width: divContainerRef.current.offsetWidth,
        height: divContainerRef.current.offsetHeight,
    });

    useEffect(() => {
        const scatterplotD3 = new ScatterplotD3(divContainerRef.current);
        scatterplotD3.create({ size: getCharSize() });
        scatterplotD3Ref.current = scatterplotD3;

        return () => scatterplotD3Ref.current.clear();
    }, []);

    useEffect(() => {
        if (data && data.length > 0 && xAxis && yAxis && color && size && brushedDataParallelCoords) {
            const scatterplotD3 = scatterplotD3Ref.current;

            const handleOnBrush = (selectedData) => {
                dispatch(setBrushedData(selectedData));
            };
            
            scatterplotD3.renderScatterplot(data, xAxis, yAxis, color, size, 
                brushedDataParallelCoords, {handleOnBrush});
        }
    }, [data, xAxis, yAxis, color, size, brushedDataParallelCoords, dispatch]);

    return <div ref={divContainerRef} className="scatterplotDivContainer" style={{ width: '100%', height: '100%' }}></div>;
}

export default ScatterplotContainer;
