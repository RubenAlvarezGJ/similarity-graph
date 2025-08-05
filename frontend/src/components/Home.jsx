import { useState } from "react";
import { useNavigate } from "react-router-dom";

function isValidUrl(str) {
  try {
    const url = new URL(str);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (_) {
    return false;
  }
}

function Home() {
  const [url, setUrl] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isValidUrl(url)) {
      alert("Please enter a valid URL.");
      return;
    }

    navigate("/loading", { state: { url } });
  };

  return (
    <div className="bg-dot-grid flex flex-col items-center justify-center h-screen text-white">
      <form onSubmit={handleSubmit} className="-mt-70 flex flex-col gap-3">
        <div className="flex flex-col items-center gap-3">
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
          className="bg-gray-300 text-black px-3 py-2 rounded-lg hover:bg-gray-500"
        >
          Submit
        </button>
      </form>
    </div>
  );
}

export default Home;
