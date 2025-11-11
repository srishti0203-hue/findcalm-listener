import React, { useState } from "react";
import "./index.css";

function App() {
  const [status, setStatus] = useState("🌼 Feeling calm and open for reflective conversations tonight.");
  const [editing, setEditing] = useState(false);
  const [newStatus, setNewStatus] = useState(status);

  const handleEdit = () => setEditing(!editing);
  const handleSave = () => {
    setStatus(newStatus);
    setEditing(false);
  };

  const todayEarnings = 870;
  const monthEarnings = 4620;
  const totalHours = 3;
  const minutes = 60;
  const penalty = 100;
  const nextPayout = "1st Dec";

  return (
    <div className="dashboard">
      <header className="header">
        <div>
          <h2>Listener Dashboard</h2>
        </div>
        <div className="profile-pic">
          <img
            src="https://cdn-icons-png.flaticon.com/512/706/706830.png"
            alt="Profile"
          />
        </div>
      </header>

      <section className="status-card">
        <div className="status-header">
          <h3>Today’s Status</h3>
          <button onClick={handleEdit} className="edit-btn">
            {editing ? "Save" : "Edit Status"}
          </button>
        </div>
        {editing ? (
          <textarea
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            className="status-input"
          />
        ) : (
          <p className="status-text">{status}</p>
        )}
      </section>

      <section className="earnings-section">
        <div className="card small-card">
          <h4>Today’s Earnings</h4>
          <p className="value">₹{todayEarnings}</p>
        </div>
        <div className="card small-card">
          <h4>This Month</h4>
          <p className="value">₹{monthEarnings}</p>
        </div>
      </section>

      <section className="time-section">
        <div className="circular">
          <svg width="120" height="120">
            <circle
              cx="60"
              cy="60"
              r="50"
              stroke="#1f2b2d"
              strokeWidth="10"
              fill="none"
            />
            <circle
              cx="60"
              cy="60"
              r="50"
              stroke="#4dd6a1"
              strokeWidth="10"
              fill="none"
              strokeDasharray="314"
              strokeDashoffset="120"
              strokeLinecap="round"
            />
          </svg>
          <div className="circle-text">
            <p className="minutes">{minutes}</p>
            <p>min</p>
          </div>
        </div>

        <div className="hours-card">
          <h4>Total Hours Today</h4>
          <p className="value">{totalHours}h</p>
          <p className="penalty">⚠️ Penalty applied – ₹{penalty} deducted</p>
          <p className="next-payout">Next Payout: {nextPayout}</p>
          <button className="leave-btn">🍃 Apply for Leave</button>
        </div>
      </section>

      <footer className="footer">
        <div className="online-status">
          <span className="dot"></span> Online
        </div>
        <div className="notifications">
          🔔 <span className="badge">1</span>
        </div>
      </footer>
    </div>
  );
}

export default App;

  
