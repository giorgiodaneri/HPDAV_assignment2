import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { generateFromConfig } from "../../redux/ConfigSlice";
import { getSeoulBikeData } from "../../redux/DataSetSlice";

function ControlBar() {
    const dispatch = useDispatch();

    // Fetch the current configuration from the Redux store
    const genConfig = useSelector((state) => state.config || { xAxis: '', yAxis: '' });

    // Fetch column names from the data slice
    const data = useSelector((state) => state.dataSet);
    const [columnNames, setColumnNames] = useState([]);

    // Local state for x and y axis selection
    const [selectedXAxis, setSelectedXAxis] = useState(genConfig.xAxis || '');
    const [selectedYAxis, setSelectedYAxis] = useState(genConfig.yAxis || '');

    // Fetch data on component mount
    useEffect(() => {
        dispatch(getSeoulBikeData());
    }, [dispatch]);

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

    // Dispatch selected x and y axes to the Redux store only on form submit
    const handleOnSubmit = (event) => {
        event.preventDefault();
        
        // Dispatch selected axes to Redux
        dispatch(generateFromConfig({
            xAxis: selectedXAxis,
            yAxis: selectedYAxis
        }));
    };

    return (
        <>
            <form onSubmit={handleOnSubmit}>
                <label>
                    X-axis
                    <select name="xAxis" value={selectedXAxis} onChange={handleOnChangeXAxis}>
                        {columnNames.map((name) => (
                            <option key={name} value={name}>
                                {name}
                            </option>
                        ))}
                    </select>
                </label>

                <label>
                    Y-axis
                    <select name="yAxis" value={selectedYAxis} onChange={handleOnChangeYAxis}>
                        {columnNames.map((name) => (
                            <option key={name} value={name}>
                                {name}
                            </option>
                        ))}
                    </select>
                </label>

                <button type="submit">Generate</button>
            </form>
        </>
    );
}

export default ControlBar;
