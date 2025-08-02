import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Home() {
  const [url, setUrl] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    navigate("/loading");

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
    <form onSubmit={handleSubmit} className="centered">
      <h2>Enter a URL</h2>
      <input
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://example.com"
      />
      <button type="submit">Submit</button>
    </form>
  );
}

export default Home;
