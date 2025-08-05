import { useLocation, useNavigate } from "react-router-dom";

function Error() {
  const location = useLocation();
  const navigate = useNavigate();

  const error = location.state?.error || "Something went wrong.";
  const url = location.state?.url;

  const handleRetry = () => {
    if (url) {
      navigate("/loading", { state: { url } });
    } else {
      // fallback
      navigate("/");
    }
  };

  return (
    <div className="bg-dot-grid flex flex-col items-center justify-center h-screen text-white">
      <h1 className="text-5xl font-semibold mb-3">An Error Occurred</h1>
      <p className="text-lg mb-6 max-w-md text-center">{error}</p>
      <div className="flex gap-4">
        {url && (
          <button
            onClick={handleRetry}
            className="bg-gray-300 text-black px-4 py-2 rounded-lg hover:bg-gray-500"
          >
            Retry
          </button>
        )}
        <button
          onClick={() => navigate("/")}
          className="bg-gray-300 text-black px-4 py-2 rounded-lg hover:bg-gray-500"
        >
          Home
        </button>
      </div>
    </div>
  );
}

export default Error;
