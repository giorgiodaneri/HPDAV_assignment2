import './App.css';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { getSeoulBikeData } from './redux/DataSetSlice';
import ScatterplotContainer from './components/scatterplot/ScatterplotContainer';
import ParallelCoordinatesContainer from './components/parallel_coordinates/ParallelCoordinatesContainer';
import ControlBar from './components/ControlBar/ControlBar';
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
          <div id="control-bar-container">
            <ControlBar/>
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
