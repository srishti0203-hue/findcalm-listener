import React from "react";
import "./index.css";

function App() {
  return (
    <div className="app-container">
      <header className="app-header">
        <h1>FindCalm — Listener Dashboard</h1>
      </header>

      <main>
        <section className="status-card">
          <p>🌼 Feeling calm and open for reflective conversations tonight.</p>
          <button className="status-btn">Edit Status</button>
        </section>

        <section className="earnings">
          <div className="card">
            <h3>Today's Earnings</h3>
            <p>₹870</p>
          </div>
          <div className="card">
            <h3>This Month</h3>
            <p>₹4,620</p>
          </div>
        </section>

        <section className="stats">
          <h3>Total Hours Today</h3>
          <p>3h</p>
          <small>Next Payout: 1st Dec</small>
        </section>
      </main>
    </div>
  );
}

export default App;
