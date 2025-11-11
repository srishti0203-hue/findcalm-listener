import React from "react";
import "./index.css";

function App() {
  return (
    <div className="main-wrapper">
      <header className="header">
        <h1>FindCalm Listener</h1>
        <p className="subtitle">A gentle space to listen, support, and grow 🌿</p>
      </header>

      <section className="listener-panel">
        <div className="status-box">
          <h3>Current Status</h3>
          <p className="online">🟢 Online & Available</p>
        </div>

        <div className="session-box">
          <h3>Today’s Reflection</h3>
          <p>“I am here to listen, not to judge.”</p>
        </div>

        <div className="earnings-box">
          <h3>Today’s Earnings</h3>
          <p>₹500</p>
        </div>

        <div className="call-stats">
          <h3>Calls Completed</h3>
          <p>8</p>
        </div>
      </section>

      <footer className="footer">
        <p>FindCalm © 2025 | Designed for emotional support listeners 💬</p>
      </footer>
    </div>
  );
}

export default App;
