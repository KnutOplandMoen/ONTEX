import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [trials, setTrials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTrials = async () => {
    setLoading(true);
    setError(null);
    try {
      // The proxy in package.json forwards this to http://localhost:8000/api/v1/trials during development
      // In production, this will hit the relative path on the same domain if served together, 
      // or you might need to configure the base URL via environment variables if separated.
      // For this bare-minimum setup, we assume proxy or direct access.
      const response = await axios.get('/api/v1/trials');
      
      // The backend returns { count: number, result: [...] }
      if (response.data && response.data.result) {
        setTrials(response.data.result);
      } else {
        setTrials([]);
      }
    } catch (err) {
      console.error("Error fetching trials:", err);
      setError("Failed to fetch trials. Please ensure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Pending Clinical Trials for Review</h1>
      </header>
      
      <main className="App-main">
        <div className="controls">
          <button className="fetch-button" onClick={fetchTrials} disabled={loading}>
            {loading ? 'Fetching...' : 'Fetch Pending Trials'}
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        {loading && <div className="loading-message">Loading...</div>}

        {!loading && trials.length > 0 && (
          <div className="table-container">
            <table className="trials-table">
              <thead>
                <tr>
                  <th>NCT ID</th>
                  <th>Trial Title</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {trials.map((trial) => (
                  <tr key={trial.NCTId}>
                    <td>{trial.NCTId}</td>
                    <td>{trial.BriefTitle}</td>
                    <td>
                      <span className={`status-badge ${trial.OverallStatus.toLowerCase()}`}>
                        {trial.OverallStatus}
                      </span>
                    </td>
                    <td>
                      <button className="action-btn approve">Approve</button>
                      <button className="action-btn reject">Reject</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && trials.length === 0 && !error && (
          <p className="no-data">No trials loaded. Click the button to fetch data.</p>
        )}
      </main>
    </div>
  );
}

export default App;

