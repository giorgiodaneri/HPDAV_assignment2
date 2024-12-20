import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { generateFromConfigRight } from "../../redux/ConfigSliceRight";
import "./ControlBarRight.css";

function ControlBarRight() {
    const dispatch = useDispatch();

    // Fetch the current configuration from the Redux store
    const genConfig = useSelector((state) => state.configRight || { firstAxis: 'Temperature', secondAxis: 'RentedBikeCount', color: 'Humidity' });

    // Fetch column names from the data slice in order to display them in the dropdown menus
    const data = useSelector((state) => state.dataSet);
    const [columnNames, setColumnNames] = useState([]);

    // Local state for user selections
    const [selectedFirstAxis, setSelectedFirstAxis] = useState(genConfig.firstAxis || '');
    const [selectedSecondAxis, setSelectedSecondAxis] = useState(genConfig.secondAxis || '');
    const [selectedColor, setSelectedColor] = useState(genConfig.color || '');

    // Local state for checkboxes useful to invert axes to better visualize the data patterns
    const [invertX, setInvertX] = useState(false);
    const [invertY, setInvertY] = useState(false);

    // Extract column names when data is loaded so that they are properly displayed 
    useEffect(() => {
        if (data.length > 0) {
            const columns = Object.keys(data[0]).filter((name) => name !== "index");
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

    const handleOnChangeColor = (event) => {
        setSelectedColor(event.target.value);
    };

    // Handlers for invert checkboxes
    const handleInvertXChange = () => setInvertX(!invertX);
    const handleInvertYChange = () => setInvertY(!invertY);

    // Dispatch selected x and y axes to the Redux store when the user clicks on the button
    const handleOnSubmit = (event) => {
        event.preventDefault();
        dispatch(generateFromConfigRight({
            firstAxis: selectedFirstAxis,
            secondAxis: selectedSecondAxis,
            color: selectedColor,
            invertX: invertX,
            invertY: invertY}));
    };

    return (
        <>
            <form className="control-bar-right-form" onSubmit={handleOnSubmit}>
                <div className="first-row">
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
                        Color
                        <select name="Color" value={selectedColor} onChange={handleOnChangeColor}>
                            {columnNames.map((name) => (
                                <option key={name} value={name}>
                                    {name}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>

                <div className="second-row">
                    <label className="invert-axis-label">Invert axis:</label>
                    <label className="invert-checkbox">
                        <input type="checkbox" checked={invertX} onChange={handleInvertXChange} /> X
                    </label>
                    <label className="invert-checkbox">
                        <input type="checkbox" checked={invertY} onChange={handleInvertYChange} /> Y
                    </label>
                    <button type="submit" className="generate-button">Generate</button>
                </div>

            </form>
        </>
    );
}

export default ControlBarRight;