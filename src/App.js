import React from "react";
import "./index.css";

function App() {
  return (
    <div className="app-container">
      <header className="app-header">
        <h1>🌿 FindCalm Listener Dashboard</h1>
        <p>Welcome! Your React app is live and running perfectly.</p>
      </header>

      <main>
        <div className="status-card">
          <p>Status: <strong>Online</strong></p>
        </div>
        <div className="earnings">
          <div className="card">
            <h3>Today's Earnings</h3>
            <p>₹500</p>
          </div>
          <div className="stats">
            <h3>Total Calls</h3>
            <p>8</p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
