import './Scatterplot.css'
import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import ScatterplotD3 from './Scatterplot-d3';
import {useSelector} from 'react-redux'

// TODO: import action methods from reducers

function ScatterplotContainer({ setHoveredData }) {
    const data = useSelector(state => state.dataSet);
    const xAttribute = "Temperature";
    const yAttribute = "RentedBikeCount";

    const divContainerRef = useRef(null);
    const scatterplotD3Ref = useRef(null);

    const getCharSize = function() {
        return { width: 1300, height: 400 };
    }

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
            scatterplotD3.renderScatterplot(data, xAttribute, yAttribute, "WindSpeed", "Visibility", {
                handleOnClick: (cellData) => console.log('Clicked:', cellData),
                handleOnMouseEnter: (cellData) => setHoveredData(cellData),
                handleOnMouseLeave: () => setHoveredData(null)
            });
        }
    }, [data]); // Re-render whenever data changes

    return <div ref={divContainerRef} className="scatterplotDivContainer"></div>;
}

export default ScatterplotContainer;