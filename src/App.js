import React, { useState } from "react";
import "./index.css";

function App() {
  const [status, setStatus] = useState("🌼 Feeling calm and open for reflective conversations tonight.");
  const [isEditing, setIsEditing] = useState(false);
  const [tempStatus, setTempStatus] = useState(status);

  const handleStatusEdit = () => {
    if (isEditing) setStatus(tempStatus);
    setIsEditing(!isEditing);
  };

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="header">
        <h2>Listener Dashboard</h2>
        <div className="profile">
          <img
            src="https://cdn-icons-png.flaticon.com/512/706/706830.png"
            alt="Profile"
          />
        </div>
      </header>

      {/* Status Card */}
      <div className="status-card">
        <div className="status-header">
          <h3>Today’s Status</h3>
          <button className="edit-btn" onClick={handleStatusEdit}>
            {isEditing ? "Save" : "Edit Status"}
          </button>
        </div>

        {isEditing ? (
          <textarea
            className="status-input"
            value={tempStatus}
            onChange={(e) => setTempStatus(e.target.value)}
          />
        ) : (
          <p className="status-text">{status}</p>
        )}
      </div>

      {/* Earnings */}
      <div className="earnings">
        <div className="card">
          <h4>Today’s Earnings</h4>
          <p className="value">₹870</p>
        </div>
        <div className="card">
          <h4>This Month</h4>
          <p className="value">₹4,620</p>
        </div>
      </div>

      {/* Hours + Penalty */}
      <div className="hours-section">
        <div className="circle">
          <div className="circle-inner">
            <p className="minutes">60</p>
            <p className="label">min</p>
          </div>
        </div>

        <div className="details">
          <h4>Total Hours Today</h4>
          <p className="value">3h</p>
          <p className="penalty">⚠️ Penalty applied – ₹100 deducted</p>
          <p className="next">Next Payout: 1st Dec</p>
          <button className="leave-btn">🍃 Apply for Leave</button>
        </div>
      </div>

      {/* Footer */}
      <footer className="footer">
        <div className="online">
          <span className="dot"></span> Online
        </div>
        <div className="notif">
          🔔 <span className="badge">1</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
