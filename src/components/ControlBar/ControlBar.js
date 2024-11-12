import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateNbRowsAndCols } from "../../redux/ConfigSlice";
import { getSeoulBikeData, setSelectedAxes } from "../../redux/DataSetSlice";

function ControlBar() {
    const dispatch = useDispatch();
    const genConfig = useSelector(state => state.config);
    const matrixSync = useSelector(state => state.matrixSync);

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

    const handleOnSubmit = (event) => {
        // Prevent the browser from reloading the page
        event.preventDefault();
    
        // Get the form data and transform it in JSON format
        const form = event.target;
        const formData = new FormData(form);
        const formJSON = Object.fromEntries(formData.entries());

        console.log("Form JSON:", formJSON);
    }

    return (
        <>
            {console.log("ControlBar rendering")}
            <form onSubmit={handleOnSubmit}>
                <label>
                    X-axis
                    <select name="xAxis">
                        {columnNames.map((name) => (
                            <option key={name} value={name}>
                                {name}
                            </option>
                        ))}
                    </select>
                </label>

                <label>
                    Y-axis
                    <select name="yAxis">
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
