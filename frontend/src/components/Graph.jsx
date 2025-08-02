import { useLocation, useNavigate } from "react-router-dom";

function Results() {
  const location = useLocation();
  const navigate = useNavigate();
  const data = location.state?.data;

  if (!data) {
    navigate("/");
    return null;
  }

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Results</h2>
      <ul>
        {data.map((item, index) => (
          <li key={index}>
            <strong>URL:</strong> {item.url} — <strong>Score:</strong>{" "}
            {item.score}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Results;
