import { useState } from 'react';
import { useSelector } from 'react-redux';

import { DataNode } from '../types';
// import DetailsBar from './components/DetailsBar';
import Header from './components/Header';
import RadialTree from './components/RadialTree';
import useGraphData from './hooks/useGraphData';
import { selectOverview } from './store/overviewSlice';

function App() {
  const data: DataNode = useSelector(selectOverview);
  const { chartData, filters, setFilters } = useGraphData(data);
  const [currentNode, setCurrentNode] = useState('');

  return (
    <div className="w-screen h-screen flex-col">
      <Header {...{ filters, setFilters, currentNode }}></Header>
      {/* <DetailsBar className="w-4/12 lg:w-4/12" /> */}
      <RadialTree
        {...{ chartData, currentNode, setCurrentNode }}
        className="w-full shadow-inner h-full"
      />
    </div>
  );
}

export default App;
