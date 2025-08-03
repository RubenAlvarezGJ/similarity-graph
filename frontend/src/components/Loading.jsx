import { useLocation } from "react-router-dom";
import UrlPreviewBox from "./UrlPreviewBox";

function Loading() {
  const location = useLocation();
  const url = location.state?.url || "No URL provided";

  return (
    <div className="bg-dot-grid-glow flex flex-col items-center justify-center h-screen text-white">
      <div className="-mt-65 flex flex-col items-center gap-5">
        <h1 className="text-5xl font-semibold">Fetching URLs</h1>
        <UrlPreviewBox url={url} />
      </div>
    </div>
  );
}

export default Loading;
