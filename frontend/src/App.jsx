
import { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [owner, setOwner] = useState("DeepanshuChandola29");
  const [repo, setRepo] = useState("ai-driven-cicd-pipeline");
  const [base, setBase] = useState("");
  const [head, setHead] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    if (!owner || !repo || !base || !head) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/github-analyze",
        { owner, repo, base, head }
      );

      setResult(response.data);
    } catch (err) {
      setError(
        err.response?.data?.detail || "Unable to analyze repository."
      );
    } finally {
      setLoading(false);
    }
  };

  const risk = result?.risk_analysis;
  const ml = result?.ml_prediction;
  const impact = result?.impact_analysis;

  return (
    <div className="container">

      <header>
        <h1>AI Release Risk Assistant</h1>
        <p>Analyze your GitHub repository before deployment.</p>
      </header>

      <section className="panel">
        <h2>GitHub Repository Analysis</h2>

        <label>GitHub Owner</label>
        <input value={owner}
          onChange={(e) => setOwner(e.target.value)} />

        <label>Repository Name</label>
        <input value={repo}
          onChange={(e) => setRepo(e.target.value)} />

        <label>Base Commit SHA</label>
        <input value={base}
          onChange={(e) => setBase(e.target.value)}
          placeholder="Enter older commit SHA" />

        <label>Head Commit SHA</label>
        <input value={head}
          onChange={(e) => setHead(e.target.value)}
          placeholder="Enter latest commit SHA" />

        <button onClick={analyze} disabled={loading}>
          {loading ? "Analyzing..." : "Analyze Release"}
        </button>

        {error && <p className="error">{error}</p>}
      </section>

      {result && (
        <>
          <h2>Release Risk Overview</h2>

          <div className="cards">
            <div className="card">
              <h3>Risk Score</h3>
              <h2>{risk?.risk_score ?? "N/A"}%</h2>
              <p>{risk?.risk_level ?? "Unknown"} Risk</p>
            </div>

            <div className="card">
              <h3>ML Failure Probability</h3>
              <h2>{ml?.failure_probability ?? "N/A"}%</h2>
              <p>{ml?.prediction_level ?? "Unknown"}</p>
            </div>

            <div className="card">
              <h3>Files Changed</h3>
              <h2>{result.analysis?.files_changed ?? 0}</h2>
              <p>Modified Files</p>
            </div>

            <div className="card">
              <h3>Impact Score</h3>
              <h2>{impact?.impact_score ?? "N/A"}</h2>
              <p>{impact?.impact_level ?? "Unknown"}</p>
            </div>
          </div>

          <section className="panel">
            <h2>Risk Reasons</h2>
            <ul>
              {risk?.risk_reasons?.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="panel">
            <h2>Impacted Components</h2>
            <ul>
              {impact?.impacted_components?.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="panel recommendation">
            <h2>Deployment Recommendation</h2>
            <p>{risk?.recommendation || "No recommendation available."}</p>
            <p>
              ML Prediction:{" "}
              {ml?.predicted_failure
                ? "Possible Failure"
                : "No Failure Predicted"}
            </p>
          </section>
        </>
      )}

      <footer>AI Release Risk Assistant | B.Tech Final Year Project</footer>
    </div>
  );
}

export default App;
