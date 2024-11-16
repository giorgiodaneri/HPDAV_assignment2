import './App.css';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { getSeoulBikeData } from './redux/DataSetSlice';
import ScatterplotContainer from './components/scatterplot/ScatterplotContainer';
import ParallelCoordinatesContainer from './components/parallel_coordinates/ParallelCoordinatesContainer';
import ControlBar from './components/ControlBar/ControlBar';
import ControlBarRight from './components/ControlBarRight/ControlBarRight';

// Component that renders the main user interface
function App() {
  const dispatch = useDispatch();
  // const [hoveredData, setHoveredData] = useState(null);  // Store hovered data
  // const [brushedData, setBrushedData] = useState([]);    // Store data from brushed area
  // const [brushedDataParallelCoords, setBrushedDataParallelCoords] = useState([]);    // Store data from brushed area

  useEffect(() => {
    dispatch(getSeoulBikeData());
  }, [dispatch]);

  // const handleOnBrush = (selectedData) => {
  //   // Add unique ids to each object in the brushed data
  //   const brushedDataWithId = selectedData.map((d, index) => ({
  //     ...d,
  //     id: index  // Unique ID using index
  //   }));
    
  //   setBrushedData(brushedDataWithId);
  //   // console.log("Brushed Data:", brushedDataWithId);
  // };

  // const handleOnBrushParallelCoords = (selectedData) => {
  //   // Add unique ids to each object in the brushed data
  //   const brushedDataWithId = selectedData.map((d, index) => ({
  //     ...d,
  //     id: index  // Unique ID using index
  //   }));
    
  //   setBrushedDataParallelCoords(brushedDataWithId);
  //   console.log("Brushed Data Parallel coords:", brushedDataWithId);
  // };

  return (
    <div className="App">
      <div id="view-container" className="row">
        {/* <div id="control-bar-container">
          <ControlBar />
        </div> */}
        <div id="control-container" className="controlRow">
          {/* ControlBar on the left */}
          <div id="control-bar-container" className="controlBar">
            <ControlBar />
          </div>
          {/* ControlBarRight on the right */}
          <div id="control-bar-right-container" className="controlBarRight">
            <ControlBarRight />
          </div>
        </div>
        <div id="visualization-container" className="visualizationRow">
          {/* ScatterplotContainer on the left */}
          <div id="scatterplot-container" className="scatterplotDivContainer">
            <ScatterplotContainer />
          </div>
          {/* ParallelCoordinatesContainer on the right */}
          <div id="parallel-coords-container" className="parallelCoordinatesDivContainer">
            <ParallelCoordinatesContainer />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
