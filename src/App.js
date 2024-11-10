import './App.css';
import { useEffect} from 'react';
import { useDispatch } from 'react-redux';
import { getSeoulBikeData } from './redux/DataSetSlice';
import ScatterplotContainer from './components/scatterplot/ScatterplotContainer';
import ParallelCoordinatesContainer from './components/parallel_coordinates/ParallelCoordinatesContainer';

// here import other dependencies

// a component is a piece of code which render a part of the user interface
function App() {
  const dispatch = useDispatch();
  useEffect(()=>{
    console.log("App useEffect");
  })

  // called once the component did mount
  useEffect(() => {
    dispatch(getSeoulBikeData());
  }, [dispatch]);

  return (
    <div className="App">
        {console.log("App rendering")}
        <div id="view-container" className="row">
          <div id="scatterplot-container" className="scatterplotDivContainer">
            {<ScatterplotContainer/>}
          </div>
          <div id="parallel-coords-container" className="parallelCoordinatesDivContainer">
            {<ParallelCoordinatesContainer/>}
          </div>
        </div>
        
    </div>
  );
}

export default App;
