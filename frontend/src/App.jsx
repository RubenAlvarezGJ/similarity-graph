import { Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import Loading from "./components/Loading";
import Graph from "./components/Graph";
import Error from "./components/Error";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/loading" element={<Loading />} />
      <Route path="/results" element={<Graph />} />
      <Route path="/error" element={<Error />} />
    </Routes>
  );
}

export default App;
