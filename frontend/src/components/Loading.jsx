import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import UrlPreviewBox from "./UrlPreviewBox";

function Loading() {
  const location = useLocation();
  const navigate = useNavigate();
  const url = location.state?.url;

  useEffect(() => {
    if (!url) {
      navigate("/error", { state: { error: "No URL provided." } });
      return;
    }

    const fetchData = async () => {
      try {
        const response = await fetch(
          `/api/crawl?url=${encodeURIComponent(url)}`
        );
        const data = await response.json();

        if (!response.ok) {
          navigate("/error", { state: { error: data.error, url } });
          return;
        }

        navigate("/results", { state: { data } });
      } catch (err) {
        console.error("Fetch error:", err);
        navigate("/error", { state: { error: "Unexpected error.", url } });
      }
    };

    fetchData();
  }, [url, navigate]);

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
