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

    // Local state for invert checkboxes
    const [invertX, setInvertX] = useState(false);
    const [invertY, setInvertY] = useState(false);
    const [invertZ, setInvertZ] = useState(false);   

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

    // Handlers for invert checkboxes
    const handleInvertXChange = () => setInvertX(!invertX);
    const handleInvertYChange = () => setInvertY(!invertY);
    const handleInvertZChange = () => setInvertZ(!invertZ);

    // Dispatch selected x and y axes to the Redux store only on form submit
    const handleOnSubmit = (event) => {
        event.preventDefault();
        
        // Dispatch selected axes to Redux
        dispatch(generateFromConfigRight({
            firstAxis: selectedFirstAxis,
            secondAxis: selectedSecondAxis,
            thirdAxis: selectedThirdAxis, 
            invertX: invertX,
            invertY: invertY,
            invertZ: invertZ}));
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
                        Third axis
                        <select name="thirdAxis" value={selectedThirdAxis} onChange={handleOnChangeThirdAxis}>
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
                    <label className="invert-checkbox">
                        <input type="checkbox" checked={invertZ} onChange={handleInvertZChange} /> Z
                    </label>
                    <button type="submit" className="generate-button">Generate</button>
                </div>

            </form>
        </>
    );
}

export default ControlBarRight;