import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { generateFromConfigRight } from "../../redux/ConfigSliceRight";
import "./ControlBarRight.css"; // Import the CSS file

function ControlBarRight() {
    const dispatch = useDispatch();

    // Fetch the current configuration from the Redux store
    const genConfig = useSelector((state) => state.configRight || { firstAxis: 'Temperature', secondAxis: 'RentedBikeCount', third: 'Rainfall' });

    // Fetch column names from the data slice
    const data = useSelector((state) => state.dataSet);
    const [columnNames, setColumnNames] = useState([]);

    // Local state for x and y axis selection
    const [selectedFirstAxis, setSelectedFirstAxis] = useState(genConfig.firstAxis || '');
    const [selectedSecondAxis, setSelectedSecondAxis] = useState(genConfig.secondAxis || '');
    const [selectedThirdAxis, setSelectedThirdAxis] = useState(genConfig.third || '');

    // Extract column names when data is loaded
    useEffect(() => {
        if (data.length > 0) {
            const columns = Object.keys(data[0]);
            setColumnNames(columns);
        }
    }, [data]);

    // Update local state when user changes the dropdown selection
    const handleOnChangeFirstAxis = (event) => {
        setSelectedFirstAxis(event.target.value);
    };

    const handleOnChangeSecondAxis = (event) => {
        setSelectedSecondAxis(event.target.value);
    };

    const handleOnChangeThirdAxis = (event) => {
        setSelectedThirdAxis(event.target.value);
    };

    // Dispatch selected x and y axes to the Redux store only on form submit
    const handleOnSubmit = (event) => {
        event.preventDefault();
        
        // Dispatch selected axes to Redux
        dispatch(generateFromConfigRight({
            firstAxis: selectedFirstAxis,
            secondAxis: selectedSecondAxis,
            thirdAxis: selectedThirdAxis}));
    };

    return (
        <>
            <form className="control-bar-right-form" onSubmit={handleOnSubmit}>
                <label className="form-label">
                    First axis
                    <select name="firstAxis" value={selectedFirstAxis} onChange={handleOnChangeFirstAxis}>
                        {columnNames.map((name) => (
                            <option key={name} value={name}>
                                {name}
                            </option>
                        ))}
                    </select>
                </label>

                <label className="form-label">
                    Second axis
                    <select name="secondAxis" value={selectedSecondAxis} onChange={handleOnChangeSecondAxis}>
                        {columnNames.map((name) => (
                            <option key={name} value={name}>
                                {name}
                            </option>
                        ))}
                    </select>
                </label>

                <label className="form-label">
                    Third axis
                    <select name="thirdAxis" value={selectedThirdAxis} onChange={handleOnChangeThirdAxis}>
                        {columnNames.map((name) => (
                            <option key={name} value={name}>
                                {name}
                            </option>
                        ))}
                    </select>
                </label>

                <button type="submit" className="generate-button">Generate</button>
            </form>
        </>
    );
}

export default ControlBarRight;