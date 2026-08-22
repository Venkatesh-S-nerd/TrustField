import { useEffect, useState } from "react";

const API = "http://127.0.0.1:8000";

function Dashboard() {
  const [alerts, setAlerts] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [backendConnected, setBackendConnected] = useState(false);

  const loadDashboard = async () => {
    setLoading(true);

    try {
      const [alertsRes, incidentsRes, logsRes] = await Promise.all([
        fetch(`${API}/alerts/detect`),
        fetch(`${API}/incidents/`),
        fetch(`${API}/logs/`),
      ]);

      if (!alertsRes.ok || !incidentsRes.ok || !logsRes.ok) {
        throw new Error("Backend request failed");
      }

      const alertsData = await alertsRes.json();
      const incidentsData = await incidentsRes.json();
      const logsData = await logsRes.json();

      setAlerts(alertsData.detections || []);
      setIncidents(incidentsData || []);
      setLogs(logsData || []);

      setBackendConnected(true);
    } catch (error) {
      console.error("Dashboard API error:", error);
      setBackendConnected(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const criticalCount = alerts.filter(
    (alert) => alert.risk_level === "CRITICAL"
  ).length;

  const highCount = alerts.filter(
    (alert) => alert.risk_level === "HIGH"
  ).length;

  const mediumCount = alerts.filter(
    (alert) => alert.risk_level === "MEDIUM"
  ).length;

  const lowCount = alerts.filter(
    (alert) => alert.risk_level === "LOW"
  ).length;

  const mlAnomalies = alerts.filter(
    (alert) =>
      alert.ml_prediction === true ||
      alert.ml_anomaly === true ||
      alert.ml_prediction === "anomaly"
  ).length;

  const suspiciousCount = alerts.filter(
    (alert) => alert.suspicious === true
  ).length;

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-header">
          <div>
            <span className="breadcrumb">TrustField / Dashboard</span>
            <h1>Dashboard</h1>
          </div>
        </div>

        <div className="loading-card">
          Loading security data...
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">

      {/* HEADER */}
      <div className="dashboard-header">
        <div>
          <span className="breadcrumb">TrustField / Dashboard</span>
          <h1>Dashboard</h1>
        </div>

        <div className="dashboard-actions">
          <div className="connection-status">
            <span
              className={`status-dot ${
                backendConnected ? "connected" : "disconnected"
              }`}
            ></span>

            {backendConnected
              ? "Backend connected"
              : "Backend disconnected"}
          </div>

          <button className="refresh-button" onClick={loadDashboard}>
            ↻ Refresh
          </button>
        </div>
      </div>

      {/* CONNECTION ERROR */}
      {!backendConnected && (
        <div className="error-banner">
          <strong>Backend connection error</strong>
          <p>
            Unable to connect to the TrustField backend.
            Make sure FastAPI is running on port 8000.
          </p>
        </div>
      )}

      {/* HERO */}
      <div className="dashboard-hero">
        <div>
          <span className="hero-label">SECURITY OVERVIEW</span>

          <h2>
            Privilege Escalation
            <br />
            Detection Center
          </h2>

          <p>
            Monitor suspicious privilege activity and
            machine-learning detected anomalies in real time.
          </p>
        </div>

        <div className="protection-status">
          <div className="protection-icon">⬡</div>

          <strong>PROTECTED</strong>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="stats-grid">

        <div className="stat-card">
          <span className="stat-label">TOTAL LOGS</span>
          <strong>{logs.length}</strong>
          <span className="stat-description">
            Recorded activities
          </span>
        </div>

        <div className="stat-card suspicious-card">
          <span className="stat-label">SUSPICIOUS</span>
          <strong>{suspiciousCount}</strong>
          <span className="stat-description">
            Suspicious activities
          </span>
        </div>

        <div className="stat-card critical-card">
          <span className="stat-label">CRITICAL</span>
          <strong>{criticalCount}</strong>
          <span className="stat-description">
            Critical threats
          </span>
        </div>

        <div className="stat-card ml-card">
          <span className="stat-label">ML ANOMALIES</span>
          <strong>{mlAnomalies}</strong>
          <span className="stat-description">
            AI detected anomalies
          </span>
        </div>

      </div>

      {/* LOWER GRID */}
      <div className="dashboard-grid">

        {/* RISK DISTRIBUTION */}
        <div className="dashboard-card">
          <div className="card-header">
            <div>
              <h3>Risk Distribution</h3>
              <p>Detected threat severity</p>
            </div>
          </div>

          <div className="risk-list">

            <RiskBar
              label="Critical"
              count={criticalCount}
              total={alerts.length}
            />

            <RiskBar
              label="High"
              count={highCount}
              total={alerts.length}
            />

            <RiskBar
              label="Medium"
              count={mediumCount}
              total={alerts.length}
            />

            <RiskBar
              label="Low"
              count={lowCount}
              total={alerts.length}
            />

          </div>
        </div>

        {/* SYSTEM STATUS */}
        <div className="dashboard-card">
          <div className="card-header">
            <div>
              <h3>Detection Systems</h3>
              <p>Current security services</p>
            </div>
          </div>

          <div className="system-list">

            <SystemStatus
              name="Rule-Based Detection"
              active={backendConnected}
            />

            <SystemStatus
              name="Machine Learning Detection"
              active={backendConnected}
            />

            <SystemStatus
              name="Privilege Analysis"
              active={backendConnected}
            />

            <SystemStatus
              name="Incident Generation"
              active={backendConnected}
            />

          </div>
        </div>

      </div>

      {/* RECENT THREATS */}
      <div className="dashboard-card recent-threats">

        <div className="card-header">
          <div>
            <h3>Recent Suspicious Activity</h3>
            <p>Highest priority detections</p>
          </div>

          <span className="threat-count">
            {alerts.length} detected
          </span>
        </div>

        {alerts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">✓</div>
            <h3>No suspicious activity detected.</h3>
            <p>
              The system currently has nothing requiring attention.
            </p>
          </div>
        ) : (
          <div className="threat-table">

            <div className="table-header">
              <span>RISK</span>
              <span>USER</span>
              <span>ACTION</span>
              <span>RESOURCE</span>
              <span>STATUS</span>
              <span>ML</span>
              <span>SCORE</span>
            </div>

            {alerts.slice(0, 5).map((alert, index) => (

              <div className="table-row" key={alert.log_id || index}>

                <span>
                  <RiskBadge level={alert.risk_level} />
                </span>

                <span className="user-cell">
                  <strong>{alert.username || "Unknown"}</strong>
                  <small>
                    ID: {alert.user_id ?? "-"}
                  </small>
                </span>

                <span>
                  <code>{alert.action || "-"}</code>
                </span>

                <span>
                  {alert.resource_type || "-"}
                </span>

                <span>
                  <span
                    className={`status-badge ${
                      alert.status === "denied"
                        ? "denied"
                        : "success"
                    }`}
                  >
                    {alert.status || "-"}
                  </span>
                </span>

                <span>
                  <span className="ml-badge">
                    ANOMALY
                  </span>
                </span>

                <strong>
                  {alert.risk_score ?? 0}
                </strong>

              </div>

            ))}

          </div>
        )}

      </div>

      {/* INCIDENT SUMMARY */}
      <div className="dashboard-card incident-summary">

        <div className="card-header">
          <div>
            <h3>Incident Overview</h3>
            <p>Generated security incidents</p>
          </div>

          <strong className="incident-count">
            {incidents.length}
          </strong>
        </div>

        <p className="incident-text">
          TrustField has generated{" "}
          <strong>{incidents.length}</strong>{" "}
          security incidents based on detected privilege
          escalation activity.
        </p>

      </div>

    </div>
  );
}


/* =========================
   RISK BAR
========================= */

function RiskBar({ label, count, total }) {

  const percentage =
    total > 0 ? Math.round((count / total) * 100) : 0;

  return (
    <div className="risk-item">

      <div className="risk-label">
        <span>{label}</span>
        <strong>{count}</strong>
      </div>

      <div className="risk-track">
        <div
          className={`risk-fill ${label.toLowerCase()}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>

    </div>
  );
}


/* =========================
   SYSTEM STATUS
========================= */

function SystemStatus({ name, active }) {

  return (
    <div className="system-status">

      <div className="system-name">
        <span
          className={`system-dot ${
            active ? "active" : "inactive"
          }`}
        ></span>

        {name}
      </div>

      <strong
        className={active ? "active-text" : "inactive-text"}
      >
        {active ? "ACTIVE" : "OFFLINE"}
      </strong>

    </div>
  );
}


/* =========================
   RISK BADGE
========================= */

function RiskBadge({ level }) {

  return (
    <span
      className={`risk-badge ${
        level?.toLowerCase() || "low"
      }`}
    >
      {level || "LOW"}
    </span>
  );
}


export default Dashboard;