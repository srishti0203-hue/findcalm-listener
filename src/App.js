// src/App.js
import React, { useEffect, useState, useRef } from "react";
import "./index.css";

const STORAGE_KEY = "findcalm_dashboard_v1";

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
function saveState(obj) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
  } catch {}
}

export default function App() {
  const persisted = loadState();

  const [isOnline, setIsOnline] = useState(persisted?.isOnline ?? false);
  const [minutes, setMinutes] = useState(persisted?.minutes ?? 0);
  const [onlineMinutes, setOnlineMinutes] = useState(persisted?.onlineMinutes ?? 0);
  const [leaves, setLeaves] = useState(persisted?.leaves ?? 0);
  const [violationCount, setViolationCount] = useState(persisted?.violationCount ?? 0);
  const [blockedUntil, setBlockedUntil] = useState(persisted?.blockedUntil ?? null);

  const [showNotif, setShowNotif] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);

  const [notifications, setNotifications] = useState(persisted?.notifications ?? []);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifPanel, setShowNotifPanel] = useState(false);

  const [status, setStatus] = useState(persisted?.status ?? "🌼 Feeling calm and open for reflective conversations tonight.");
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [tempStatus, setTempStatus] = useState(status);

  const minuteTimerRef = useRef(null);
  const onlineTimerRef = useRef(null);

  const allowedLeaves = 4;
  const extraLeaves = Math.max(0, leaves - allowedLeaves);
  const leavePenalty = extraLeaves * 100;

  let violationPenalty = 0;
  let accountBlocked = false;
  if (violationCount === 1) violationPenalty = 2500;
  else if (violationCount === 2) violationPenalty = 5000;
  else if (violationCount >= 3) {
    violationPenalty = 10000;
    accountBlocked = true;
  }
  const totalPenalty = leavePenalty + violationPenalty;

  const isAvailable = minutes >= 60 || onlineMinutes >= 180;

  // Circle math
  const circleRadius = 50;
  const circumference = 2 * Math.PI * circleRadius;
  const progressCycle = (minutes % 60) / 60;
  const dashOffset = circumference - progressCycle * circumference;

  // blocked check
  useEffect(() => {
    if (!blockedUntil) return;
    const now = Date.now();
    if (now >= blockedUntil) {
      setBlockedUntil(null);
      setViolationCount(0);
    } else {
      const t = setTimeout(() => {
        setBlockedUntil(null);
        setViolationCount(0);
      }, blockedUntil - now + 1000);
      return () => clearTimeout(t);
    }
  }, [blockedUntil]);

  // persist state
  useEffect(() => {
    saveState({
      isOnline,
      minutes,
      onlineMinutes,
      leaves,
      violationCount,
      blockedUntil,
      notifications,
      status,
    });
  }, [isOnline, minutes, onlineMinutes, leaves, violationCount, blockedUntil, notifications, status]);

  // timers
  useEffect(() => {
    if (blockedUntil && Date.now() < blockedUntil) {
      setIsOnline(false);
      return;
    }

    if (isOnline) {
      if (!minuteTimerRef.current) {
        minuteTimerRef.current = setInterval(() => {
          setMinutes((m) => m + 1);
        }, 60000);
      }
      if (!onlineTimerRef.current) {
        onlineTimerRef.current = setInterval(() => {
          setOnlineMinutes((om) => om + 1);
        }, 60000);
      }
    } else {
      if (minuteTimerRef.current) {
        clearInterval(minuteTimerRef.current);
        minuteTimerRef.current = null;
      }
      if (onlineTimerRef.current) {
        clearInterval(onlineTimerRef.current);
        onlineTimerRef.current = null;
      }
    }

    return () => {
      if (minuteTimerRef.current) {
        clearInterval(minuteTimerRef.current);
        minuteTimerRef.current = null;
      }
      if (onlineTimerRef.current) {
        clearInterval(onlineTimerRef.current);
        onlineTimerRef.current = null;
      }
    };
  }, [isOnline, blockedUntil]);

  const handleToggleOnline = () => {
    if (blockedUntil && Date.now() < blockedUntil) return;

    if (isOnline) {
      if (!(minutes >= 60 || onlineMinutes >= 180)) {
        setLeaves((l) => l + 1);
        setNotifications((n) => [`Auto: Marked a leave (insufficient time)`, ...n]);
      }
    }
    setIsOnline((s) => !s);
  };

  const openLeaveModal = () => setShowLeaveModal(true);
  const confirmLeave = () => {
    setLeaves((l) => l + 1);
    setShowLeaveModal(false);
    setNotifications((n) => [
      {
        type: "leave_request",
        message: "🌼 Leave requested",
        time: Date.now(),
      },
      ...n,
    ]);
    setUnreadCount((c) => c + 1);
  };

  const addViolation = () => {
    const next = violationCount + 1;
    setViolationCount(next);
    if (next >= 3) {
      const until = Date.now() + 72 * 3600 * 1000; // 72h
      setBlockedUntil(until);
      setNotifications((n) => [`Violation #${next}: Account blocked until ${new Date(until).toLocaleString()}`, ...n]);
      setIsOnline(false);
    } else {
      setNotifications((n) => [`Violation #${next} recorded`, ...n]);
    }
  };

  const handleOpenNotifications = () => {
    setShowNotifPanel(true);
    setUnreadCount(0);
  };

  const toggleEditStatus = () => {
    if (isEditingStatus) setStatus(tempStatus);
    setIsEditingStatus(!isEditingStatus);
  };

  const addFiveMinutes = () => setMinutes((m) => m + 5);
  const addOneHourToOnline = () => setOnlineMinutes((om) => om + 60);

  return (
    <div className="dashboard">
      <header className="header">
        <div>
          <h2>FindCalm Listener</h2>
          <p className="subtitle">Gentle space for listening — mobile-first</p>
        </div>

        <div className="header-right">
        <div className="notif-icon" onClick={handleOpenNotifications}>
  🔔 {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
</div>
         <div className="profile">
            <img alt="profile" src="https://cdn-icons-png.flaticon.com/512/706/706830.png" />
          </div>
        </div>
      </header>

      {/* popup small notif (optional) */}
      {showNotif && (
        <div className="notif-popup">
          {notifications.map((n, i) => (
            <p key={i}>{typeof n === "string" ? n : n.message}</p>
          ))}
        </div>
      )}

      {/* Notification panel (inside return) */}
      {showNotifPanel && (
        <div className="notif-panel">
          <h4>Notifications</h4>
          {notifications.length === 0 ? (
            <p className="empty">No new notifications</p>
          ) : (
            notifications.map((n, i) => (
              <div key={i} className="notif-item">
                <div className="notif-msg">{typeof n === "string" ? n : n.message}</div>
                <div className="notif-time">{(n && n.time) ? new Date(n.time).toLocaleString() : ""}</div>
              </div>
            ))
          )}
          <button onClick={() => setShowNotifPanel(false)}>Close</button>
        </div>
      )}

      <section className="status-card">
        <div className="status-header">
          <h3>Today’s Status</h3>
          <button className="edit-btn" onClick={toggleEditStatus}>
            {isEditingStatus ? "Save" : "Edit Status"}
          </button>
        </div>

        {isEditingStatus ? (
          <textarea className="status-input" value={tempStatus} onChange={(e) => setTempStatus(e.target.value)} />
        ) : (
          <p className="status-text">{status}</p>
        )}
      </section>

      <section className="earnings">
        <div className="card">
          <h4>Today’s Earnings</h4>
          <p className="value">₹870</p>
        </div>
        <div className="card">
          <h4>This Month</h4>
          <p className="value">₹4,620</p>
        </div>
      </section>

      <section className="hours-section">
        {/* circle + status */}
        <div className="circle-wrapper">
          <svg width="140" height="140" viewBox="0 0 140 140">
            <g transform="translate(20,20)">
              <circle cx="50" cy="50" r={circleRadius} stroke="#111519" strokeWidth="10" fill="none" />
              <circle
                cx="50"
                cy="50"
                r={circleRadius}
                stroke="#4dd6a1"
                strokeWidth="10"
                strokeLinecap="round"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                style={{ transition: "stroke-dashoffset 0.8s linear" }}
              />
            </g>
          </svg>

          <div className="circle-center">
            <div className="center-minutes">
              {minutes} <span className="min-label">min</span>
            </div>
            <div className="center-hours subtle">{Math.floor(onlineMinutes / 60)}h {onlineMinutes % 60}m</div>
          </div>
        </div>

        {/* details */}
        <div className="details">
          <h4>Total Hours Today</h4>
          <p className="value">{Math.floor(onlineMinutes / 60)}h {onlineMinutes % 60}m</p>
          <p className="attendance">Attendance: {isAvailable ? "Present" : "On Leave"}</p>

          <p className="penalty">⚠ Leave penalty: ₹{leavePenalty} (extra leaves: {extraLeaves})</p>
          <p className="penalty">💥 Violation penalty: ₹{violationPenalty}</p>
          <p className="total-penalty"><strong>Total penalty:</strong> ₹{totalPenalty}</p>

          {accountBlocked && blockedUntil && Date.now() < blockedUntil && (
            <div className="block-warning">❌ Account blocked until {new Date(blockedUntil).toLocaleString()}</div>
          )}
        </div>

        {/* actions */}
        <div className="actions-section">
          <div className="actions-row">
            <button className="btn leave-btn" onClick={openLeaveModal}>🪴 Apply for Leave</button>
            <button
              className={`btn online-toggle ${isOnline ? "online-active" : "offline-active"}`}
              onClick={() => {
                if (blockedUntil && Date.now() < blockedUntil) {
                  alert("Your account is still blocked until " + new Date(blockedUntil).toLocaleString());
                  return;
                }
                const newStatus = !isOnline;
              // Remove notifications for online/offline toggle
setIsOnline(newStatus);

            >
              {isOnline ? "Online" : "Offline"}
            </button>
          </div>

          <div className="tiny-actions">
            <button className="ghost" onClick={addFiveMinutes}>+5 min (test)</button>
            <button className="ghost" onClick={addOneHourToOnline}>+1 h online (test)</button>
            <button className="ghost" onClick={addViolation}>⚠ Add Violation (test)</button>
          </div>
        </div>
      </section>

      {/* Leave modal */}
      {showLeaveModal && (
        <div className="modal">
          <div className="modal-card">
            <h3>Apply for Leave</h3>
            <p>You have {Math.max(0, allowedLeaves - leaves)} free leaves remaining this month.</p>
            <p>Extra leaves cost ₹100 each.</p>
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button className="btn" onClick={confirmLeave}>Confirm Leave</button>
              <button className="btn ghost" onClick={() => setShowLeaveModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* status/footer always outside modal */}
      <footer className="status-bar">
        <div className="left-status">
          <span className={`status-dot ${isOnline ? "online-dot" : "offline-dot"}`}></span>
          <span>{isOnline ? "Online" : "Offline"}</span>
        </div>
        <div className="footer-right"><small>FindCalm • Phase 1</small></div>
      </footer>
    </div>
  );
}
