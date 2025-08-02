import { useLocation, useNavigate } from "react-router-dom";
import UrlPreviewBox from "./UrlPreviewBox";

function Graph() {
  const location = useLocation();
  const navigate = useNavigate();
  const data = location.state?.data;

  // if (!data) {
  //   navigate("/");
  //   return null;
  // }

  return (
    <div className="bg-dot-grid flex flex-col items-center justify-center h-screen">
      <h2 className="text-white">Results</h2>
    </div>
  );
}

export default Graph;
