import Header from './components/Header';
import LogoFastify from './components/LogoFastify';
import RadialTree from './components/RadialTree';

function App() {
  return (
    <div className="w-screen h-screen flex-col">
      <Header></Header>
      {/* <LogoFastify className="absolute top-0 left-0 w-16 mt-2 ml-2 text-gray-800" /> */}
      <RadialTree className="w-full shadow-inner h-full" />
      {/* <DetailsBar className="w-4/12 lg:w-4/12" /> */}
    </div>
  );
}

export default App;
