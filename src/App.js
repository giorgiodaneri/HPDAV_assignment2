import './App.css';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { getSeoulBikeData } from './redux/DataSetSlice';
import ScatterplotContainer from './components/scatterplot/ScatterplotContainer';
import ParallelCoordinatesContainer from './components/parallel_coordinates/ParallelCoordinatesContainer';

// here import other dependencies

// a component is a piece of code which render a part of the user interface
function App() {
  const dispatch = useDispatch();
  const [hoveredData, setHoveredData] = useState(null);  // Store hovered data
  
  useEffect(()=>{
    console.log("App useEffect");
  })
  
  const handleOnBrush = (selectedData) => {
    // Adding unique ids to each object in the brushed data
    const brushedDataWithId = selectedData.map((d, index) => ({
        ...d, // Keep all existing properties
        id: index  // Generate a unique ID by using the index of the element
    }));
    
    setBrushedData(brushedDataWithId);  // Store the modified data with unique IDs
    console.log("Brushed Data:", brushedDataWithId);
  };
  
  const [brushedData, setBrushedData] = useState([]);   // Store data from brushed area
  
  // called once the component did mount
  useEffect(() => {
    dispatch(getSeoulBikeData());
  }, [dispatch]);

  return (
    <div className="App">
        {console.log("App rendering")}
        <div id="view-container" className="row">
          {/* Step 3: Display hovered data below the scatter plot */}
          <div style={{ marginTop: '0px', padding: '5px', border: '1px solid #ccc' }}>
          <h3 style={{ fontSize: '14px', marginBottom: '5px' }}>Hovered Data:</h3>
          {hoveredData ? (
            <div>
              {/* First row with the first set of attributes */}
              <p style={{ fontSize: '12px', margin: 0 }}>
                <strong>"RentedBikeCount"</strong>: {hoveredData.RentedBikeCount}, 
                <strong>"Hour"</strong>: {hoveredData.Hour}, 
                <strong>"Temperature"</strong>: {hoveredData.Temperature}, 
                <strong>"Humidity"</strong>: {hoveredData.Humidity}, 
                <strong>"WindSpeed"</strong>: {hoveredData.WindSpeed}, 
                <strong>"Visibility"</strong>: {hoveredData.Visibility}
              </p>

              {/* Second row with the second set of attributes */}
              <p style={{ fontSize: '12px', margin: 0 }}>
                <strong>"DewPointTemperature"</strong>: {hoveredData.DewPointTemperature}, 
                <strong>"SolarRadiation"</strong>: {hoveredData.SolarRadiation}, 
                <strong>"Rainfall"</strong>: {hoveredData.Rainfall}, 
                <strong>"Snowfall"</strong>: {hoveredData.Snowfall}, 
                <strong>"Seasons"</strong>: {hoveredData.Seasons}, 
                <strong>"Holiday"</strong>: {hoveredData.Holiday}, 
                <strong>"FunctioningDay"</strong>: {hoveredData.FunctioningDay}
              </p>
            </div>
          ) : (
            <div>
              <p style={{ fontSize: '12px', margin: 0 }}>Hover over a point in the scatter plot</p>
              <p style={{ fontSize: '12px', margin: 0 }}>or a line in the parallel coordinates plot to see the data here.</p>
            </div>
          )}
        </div>
          <div id="scatterplot-container" className="scatterplotDivContainer">
            {/* Step 2: Pass setHoveredData to the ScatterplotContainer */}
            <ScatterplotContainer setHoveredData={setHoveredData} brushedData={handleOnBrush} />
          </div>
          <div id="parallel-coords-container" className="parallelCoordinatesDivContainer">
            {<ParallelCoordinatesContainer brushedData={brushedData} />}
          </div>
        </div>
    </div>
  );
}

export default App;
