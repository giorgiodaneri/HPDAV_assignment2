import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { generateFromConfig } from "../../redux/ConfigSlice";
import "./ControlBar.css";

function ControlBar() {
    const dispatch = useDispatch();

    // Fetch the current configuration from the Redux store
    const genConfig = useSelector((state) => state.config || { xAxis: '', yAxis: '', color: '' });

    // Fetch column names from the data slice
    const data = useSelector((state) => state.dataSet);
    const [columnNames, setColumnNames] = useState([]);

    // Local state for x and y axis selection
    const [selectedXAxis, setSelectedXAxis] = useState(genConfig.xAxis || '');
    const [selectedYAxis, setSelectedYAxis] = useState(genConfig.yAxis || '');
    const [selectedColor , setSelectedColor] = useState(genConfig.color || '');

    // Extract column names when data is loaded
    useEffect(() => {
        if (data.length > 0) {
            const columns = Object.keys(data[0]);
            setColumnNames(columns);
        }
    }, [data]);

    // Update local state when user changes the dropdown selection
    const handleOnChangeXAxis = (event) => {
        setSelectedXAxis(event.target.value);
    };

    const handleOnChangeYAxis = (event) => {
        setSelectedYAxis(event.target.value);
    };

    const handleOnChangeColor = (event) => {
        setSelectedColor(event.target.value);  
    };

    // Dispatch selected x and y axes to the Redux store only on form submit
    const handleOnSubmit = (event) => {
        event.preventDefault();
        
        // Dispatch selected axes to Redux
        dispatch(generateFromConfig({
            xAxis: selectedXAxis,
            yAxis: selectedYAxis,
            color: selectedColor
        }));
    };

    return (
        <>
            <form className="control-bar-form" onSubmit={handleOnSubmit}>
                <div className="input-group">
                    <label htmlFor="xAxis">X-axis</label>
                    <select
                        id="xAxis"
                        name="xAxis"
                        value={selectedXAxis}
                        onChange={handleOnChangeXAxis}
                    >
                        {columnNames.map((name) => (
                            <option key={name} value={name}>
                                {name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="input-group">
                    <label htmlFor="yAxis">Y-axis</label>
                    <select
                        id="yAxis"
                        name="yAxis"
                        value={selectedYAxis}
                        onChange={handleOnChangeYAxis}
                    >
                        {columnNames.map((name) => (
                            <option key={name} value={name}>
                                {name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="input-group">
                    <label htmlFor="color">Color</label>
                    <select
                        id="color"
                        name="color"
                        value={selectedColor}
                        onChange={handleOnChangeColor}
                    >
                        {columnNames.map((name) => (
                            <option key={name} value={name}>
                                {name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="button-container">
                    <button type="submit" className="generate-button">Generate</button>
                </div>
            </form>
        </>
    );
}

export default ControlBar;
