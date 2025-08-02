import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Home() {
  const [url, setUrl] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    navigate("/loading", { state: { url } });

    try {
      const response = await fetch(`/api/crawl?url=${encodeURIComponent(url)}`);
      const data = await response.json();
      navigate("/results", { state: { data } });
    } catch (err) {
      console.error("Failed to fetch data:", err);
      navigate("/error");
    }
  };

  return (
    <div className="bg-dot-grid flex flex-col items-center justify-center h-screen gap-4 text-white">
      <form onSubmit={handleSubmit} className="-mt-70 flex flex-col gap-3">
        <div className="flex flex-col items-center gap-4">
          <h1 className="text-5xl font-semibold">Enter a URL</h1>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="border border-white-300 rounded-lg px-3 py-2 w-100"
          />
        </div>
        <button
          type="submit"
          className="bg-white text-black px-4 py-2 rounded-lg hover:bg-purple-900"
        >
          Submit
        </button>
      </form>
    </div>
  );
}

export default Home;
