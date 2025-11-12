import React, { useEffect, useState, useRef } from "react";
import "./index.css";

/**
 * Phase-1 Dashboard
 * - Auto timer while Online (adds 1 minute every real minute)
 * - Minutes progress circle (0..60)
 * - 3-hour online rule (180 minutes)
 * - 4 free leaves/month, extra leaves ₹100 each (local only)
 * - Violation escalation: 1->2500, 2->5000, 3+->10000 + blocked 72h
 * - Notifications popup & online/offline toggle
 * - LocalStorage persistence
 */

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
  // load persisted state
  const persisted = loadState();

  // core states
  const [isOnline, setIsOnline] = useState(persisted?.isOnline ?? false);
  const [minutes, setMinutes] = useState(persisted?.minutes ?? 0); // listening minutes
  const [onlineMinutes, setOnlineMinutes] = useState(persisted?.onlineMinutes ?? 0); // total online duration minutes
  const [leaves, setLeaves] = useState(persisted?.leaves ?? 0);
  const [violationCount, setViolationCount] = useState(persisted?.violationCount ?? 0);
  const [blockedUntil, setBlockedUntil] = useState(persisted?.blockedUntil ?? null);

  const [showNotif, setShowNotif] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [notifications, setNotifications] = useState(
    persisted?.notifications ?? ["Missed call from user #102"]
  );

  // status edit (small)
  const [status, setStatus] = useState(persisted?.status ?? "🌼 Feeling calm and open for reflective conversations tonight.");
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [tempStatus, setTempStatus] = useState(status);

  // refs for timers
  const minuteTimerRef = useRef(null);
  const onlineTimerRef = useRef(null);

  // compute derived values
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
  const attendanceStatus = isAvailable ? "Present" : "On Leave";

  // circle progress (minutes/60)
 // circle progress (looping every 60 minutes, continues counting in backend)
const circleRadius = 50;
const circumference = 2 * Math.PI * circleRadius;

// Make the progress bar reset every 60 mins visually (1 cycle = 60 min)
const progressCycle = (minutes % 60) / 60;
const dashOffset = circumference - progressCycle * circumference;

  // blocked check (in case blockedUntil persisted)
  useEffect(() => {
    if (!blockedUntil) return;
    const now = Date.now();
    if (now >= blockedUntil) {
      setBlockedUntil(null);
      setViolationCount(0); // optionally reset violations after block period ends (you can change this)
    } else {
      // set timer to auto-unblock when time passes
      const t = setTimeout(() => {
        setBlockedUntil(null);
        setViolationCount(0);
      }, blockedUntil - now + 1000);
      return () => clearTimeout(t);
    }
  }, [blockedUntil]);

  // persist state anytime relevant values change
  useEffect(() => {
    saveState({
      isOnline,
      minutes,
      onlineMinutes,
      leaves,
      violationCount,
      blockedUntil,
      notifications,
      status
    });
  }, [isOnline, minutes, onlineMinutes, leaves, violationCount, blockedUntil, notifications, status]);

  // start/stop timers when online changes
  useEffect(() => {
    // if blocked, don't allow going online
    if (blockedUntil && Date.now() < blockedUntil) {
      setIsOnline(false);
      return;
    }

    if (isOnline) {
      // minute-by-minute "listening" increment
      // minuteTimerRef handles listening minutes (assume listening while online)
      if (!minuteTimerRef.current) {
        minuteTimerRef.current = setInterval(() => {
          setMinutes((m) => m + 1);
        }, 60000); // 60000ms = 1 minute
      }
      // online duration timer
      if (!onlineTimerRef.current) {
        onlineTimerRef.current = setInterval(() => {
          setOnlineMinutes((om) => om + 1);
        }, 60000);
      }
    } else {
      // clear timers
      if (minuteTimerRef.current) {
        clearInterval(minuteTimerRef.current);
        minuteTimerRef.current = null;
      }
      if (onlineTimerRef.current) {
        clearInterval(onlineTimerRef.current);
        onlineTimerRef.current = null;
      }
    }

    // cleanup on unmount
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline, blockedUntil]);

  // when user toggles offline, check attendance and apply leave if needed
  const handleToggleOnline = () => {
    // if currently blocked, prevent toggle
    if (blockedUntil && Date.now() < blockedUntil) return;

    if (isOnline) {
      // going offline now: evaluate whether this day/session counts as leave
      // if neither condition satisfied -> mark as leave
      if (!(minutes >= 60 || onlineMinutes >= 180)) {
        setLeaves((l) => l + 1);
        setNotifications((n) => [`Auto: Marked a leave (insufficient time)`, ...n]);
      }
    }
    setIsOnline((s) => !s);
  };

  // manual "Apply for Leave" (Option A)
  const openLeaveModal = () => setShowLeaveModal(true);
  const confirmLeave = () => {
    setLeaves((l) => l + 1);
    setShowLeaveModal(false);
    setNotifications((n) => ["Leave requested (local) — counted", ...n]);
    // TODO: POST /api/leaves in Phase 2
  };

  // Add violation (test/admin button)
  const addViolation = () => {
    const next = violationCount + 1;
    setViolationCount(next);
    if (next >= 3) {
      const until = Date.now() + 72 * 3600 * 1000; // 72 hours
      setBlockedUntil(until);
      setNotifications((n) => [`Violation #${next}: Account blocked until ${new Date(until).toLocaleString()}`, ...n]);
      setIsOnline(false);
    } else {
      setNotifications((n) => [`Violation #${next} recorded`, ...n]);
    }
  };

  // Save edited status
  const toggleEditStatus = () => {
    if (isEditingStatus) {
      setStatus(tempStatus);
    }
    setIsEditingStatus(!isEditingStatus);
  };

  // quick debug helpers (only for preview — you can remove later)
  // NOTE: Do not ship debug auto-increment in production. For now we keep minute timer real-time.
  const addFiveMinutes = () => setMinutes((m) => m + 5);
  const addOneHourToOnline = () => setOnlineMinutes((om) => om + 60);

  // render
  return (
    <div className="dashboard">
      <header className="header">
        <div>
          <h2>FindCalm Listener</h2>
          <p className="subtitle">Gentle space for listening — mobile-first</p>
        </div>

        <div className="header-right">
          <div className="notif" onClick={() => setShowNotif((s) => !s)}>
            🔔 <span className="badge">{notifications.length}</span>
          </div>
          <div className="profile">
            <img alt="profile" src="https://cdn-icons-png.flaticon.com/512/706/706830.png" />
          </div>
        </div>
      </header>

      {showNotif && (
        <div className="notif-popup">
          {notifications.map((n, i) => (
            <p key={i}>{n}</p>
          ))}
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
        <div className="circle-wrapper">
         <svg width="140" height="140" viewBox="0 0 140 140">
  <g transform="translate(20,20)">
    <circle
      cx="50"
      cy="50"
      r={circleRadius}
      stroke="#111519"
      strokeWidth="10"
      fill="none"
    />
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
      style={{ transition: "stroke-dashoffset 1s linear" }}
    />
  </g>
</svg>

<div className="circle-center">
<div className="center-minutes">
  {Math.floor(onlineMinutes / 60)}h {onlineMinutes % 60}m
</div>
<div className="center-hours subtle">
  ({onlineMinutes} min)
</div>
</div>

        </div>

        <div className="details">
          <h4>Total Hours Today</h4>
          <p className="value">{Math.floor(onlineMinutes / 60)}h {onlineMinutes % 60}m</p>
          <p className={`attendance ${isAvailable ? "present" : "leave"}`}>{isAvailable ? "Present" : "On Leave"}</p>

          <p className="penalty">⚠️ Leave penalty: ₹{leavePenalty} (extra leaves: {extraLeaves})</p>
          <p className="penalty">🚨 Violation penalty: ₹{violationPenalty}</p>

          <p className="total-penalty"><strong>Total penalty: ₹{totalPenalty}</strong></p>

          {accountBlocked && blockedUntil && Date.now() < blockedUntil && (
            <div className="block-warning">
              ❌ Account blocked until {new Date(blockedUntil).toLocaleString()}
            </div>
          )}

          <div className="actions-row">
            <button className="btn leave-btn" onClick={openLeaveModal}>🍃 Apply for Leave</button>
           className={`btn online-toggle ${isOnline ? "online" : "offline"}`}
  onClick={() => {
    if (blockedUntil && Date.now() < blockedUntil) return;
    setIsOnline((prev) => {
      const newStatus = !prev;
      if (newStatus) {
        setNotifications((n) => ["You are now Online", ...n]);
      } else {
        setNotifications((n) => ["You went Offline", ...n]);
      }
      return newStatus;
    });
  }}
>
  {isOnline ? "Go Offline" : "Go Online"}
</button>

          </div>

          <div className="tiny-actions">
            <button className="ghost" onClick={addFiveMinutes}>+5 min (test)</button>
            <button className="ghost" onClick={addOneHourToOnline}>+1h online (test)</button>
            <button className="ghost" onClick={addViolation}>⚠️ Add Violation (test)</button>
          </div>
        </div>
      </section>

      {/* Leave modal (local only) */}
      {showLeaveModal && (
        <div className="modal">
          <div className="modal-card">
            <h3>Apply for Leave</h3>
            <p>You have {Math.max(0, allowedLeaves - leaves)} free leaves remaining this month.</p>
            <p>Extra leaves cost ₹100 each.</p>
            <div style={{display:"flex", gap:8, marginTop:12}}>
              <button className="btn" onClick={confirmLeave}>Confirm Leave</button>
              <button className="btn ghost" onClick={() => setShowLeaveModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <footer className="footer">
        <div>
          <span className={`status-dot ${isOnline ? "online-dot" : "offline-dot"}`} />
          {isOnline ? "Online" : "Offline"}
        </div>

        <div className="credits">
          <small>FindCalm • Phase 1</small>
        </div>
      </footer>
    </div>
  );
}
