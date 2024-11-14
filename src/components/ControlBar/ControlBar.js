import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateAxes, generateFromConfig } from "../../redux/ConfigSlice";
import { getSeoulBikeData, setData } from "../../redux/DataSetSlice";

function ControlBar() {
    const dispatch = useDispatch();
    // Fetch the current configuration from the Redux store, provide default values since 
    // the store may not have been initialized yet
    const genConfig = useSelector(state => state.config || { xAxis: '', yAxis: '' });

    // Fetch column names from the data slice
    const data = useSelector(state => state.dataSet);
    const [columnNames, setColumnNames] = useState([]);

    // Fetch data on component mount
    useEffect(() => {
        dispatch(getSeoulBikeData());
    }, [dispatch]);

    // Extract column names when data is loaded
    useEffect(() => {
        if (data.length > 0) {
            const columns = Object.keys(data[0]); // Get the keys (column names) from the first row
            setColumnNames(columns);
        }
    }, [data]);

    const handleOnChangeXAxis = function (event) {
        // get value of the selected option
        const xAxis = event.target.value;
        console.log("Selected X-axis:", xAxis);
        // print genConfig to console
        console.log("genConfig:", genConfig);
        dispatch(updateAxes({...genConfig, xAxis }));
    }

    const handleOnChangeYAxis = function (event) {
        // get value of the selected option
        const yAxis = event.target.value;
        console.log("Selected Y-axis:", yAxis);
        console.log("genConfig:", genConfig);
        dispatch(updateAxes({...genConfig, yAxis }));
    }

    const handleOnSubmit = (event) => {
        event.preventDefault();
    
        const form = event.target;
        const formData = new FormData(form);
        const formJSON = Object.fromEntries(formData.entries());
    
        // Update both x and y axis in the Redux store
        dispatch(generateFromConfig({
            xAxis: formJSON.xAxis,
            yAxis: formJSON.yAxis
        }));
    };

    return (
        <>
            {console.log("ControlBar rendering")}
            {genConfig && (
                <form onSubmit={handleOnSubmit}>
                    <label>
                        X-axis
                        <select name="xAxis" value={genConfig.xAxis} onChange={handleOnChangeXAxis}>
                            {columnNames.map((name) => (
                                <option key={name} value={name}>
                                    {name}
                                </option>
                            ))}
                        </select>
                    </label>
    
                    <label>
                        Y-axis
                        <select name="yAxis" value={genConfig.yAxis} onChange={handleOnChangeYAxis}>
                            {columnNames.map((name) => (
                                <option key={name} value={name}>
                                    {name}
                                </option>
                            ))}
                        </select>
                    </label>
    
                    <button type="submit">Generate</button>
                </form>
            )}
        </>
    );    
}

export default ControlBar;
