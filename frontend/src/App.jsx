import { Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import Loading from "./components/Loading";
import Graph from "./components/Graph";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/loading" element={<Loading />} />
      <Route path="/results" element={<Graph />} />
    </Routes>
  );
}

export default App;
