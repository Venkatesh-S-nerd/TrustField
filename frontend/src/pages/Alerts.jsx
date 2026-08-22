import { useEffect, useState } from "react";

const API = "http://127.0.0.1:8000";

function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("ALL");

  const loadAlerts = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API}/alerts/detect`);

      if (!response.ok) {
        throw new Error("Failed to fetch alerts");
      }

      const data = await response.json();

      setAlerts(data.detections || []);
    } catch (err) {
      console.error("Alerts error:", err);
      setError("Unable to load alerts from the TrustField backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const filteredAlerts =
    filter === "ALL"
      ? alerts
      : alerts.filter(
          (alert) => alert.risk_level === filter
        );

  const criticalCount = alerts.filter(
    (alert) => alert.risk_level === "CRITICAL"
  ).length;

  const highCount = alerts.filter(
    (alert) => alert.risk_level === "HIGH"
  ).length;

  const mediumCount = alerts.filter(
    (alert) => alert.risk_level === "MEDIUM"
  ).length;

  const mlCount = alerts.filter(
    (alert) =>
      alert.ml_prediction === true ||
      alert.ml_anomaly === true ||
      alert.ml_prediction === "anomaly"
  ).length;

  return (
    <div className="dashboard-page">

      {/* HEADER */}

      <div className="dashboard-header">

        <div>
          <span className="breadcrumb">
            TrustField / Alerts
          </span>

          <h1>Alerts</h1>

          <p className="page-description">
            Monitor detected privilege escalation threats
            and suspicious activities.
          </p>
        </div>

        <div className="dashboard-actions">

          <div className="connection-status">
            <span className="status-dot connected"></span>
            Backend connected
          </div>

          <button
            className="refresh-button"
            onClick={loadAlerts}
          >
            ↻ Refresh
          </button>

        </div>

      </div>

      {/* ERROR */}

      {error && (
        <div className="error-banner">
          <strong>Backend connection error</strong>

          <p>{error}</p>
        </div>
      )}

      {/* SUMMARY */}

      <div className="stats-grid">

        <div className="stat-card critical-card">
          <span className="stat-label">
            CRITICAL
          </span>

          <strong>{criticalCount}</strong>

          <span className="stat-description">
            Critical threats
          </span>
        </div>

        <div className="stat-card suspicious-card">
          <span className="stat-label">
            HIGH RISK
          </span>

          <strong>{highCount}</strong>

          <span className="stat-description">
            High priority alerts
          </span>
        </div>

        <div className="stat-card">
          <span className="stat-label">
            MEDIUM
          </span>

          <strong>{mediumCount}</strong>

          <span className="stat-description">
            Medium risk activity
          </span>
        </div>

        <div className="stat-card ml-card">
          <span className="stat-label">
            ML ANOMALIES
          </span>

          <strong>{mlCount}</strong>

          <span className="stat-description">
            Detected by ML model
          </span>
        </div>

      </div>

      {/* ALERTS CARD */}

      <div className="dashboard-card recent-threats">

        <div className="card-header">

          <div>
            <h3>Detected Threats</h3>

            <p>
              Activities requiring attention
            </p>
          </div>

          <span className="threat-count">
            {filteredAlerts.length} detected
          </span>

        </div>

        {/* FILTERS */}

        <div className="alert-filters">

          {["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"].map(
            (level) => (
              <button
                key={level}
                className={
                  filter === level
                    ? "filter-button active"
                    : "filter-button"
                }
                onClick={() => setFilter(level)}
              >
                {level}
              </button>
            )
          )}

        </div>

        {/* LOADING */}

        {loading && (
          <div className="empty-state">
            <h3>Loading alerts...</h3>
          </div>
        )}

        {/* EMPTY */}

        {!loading && filteredAlerts.length === 0 && (
          <div className="empty-state">

            <div className="empty-icon">
              ✓
            </div>

            <h3>
              No alerts found
            </h3>

            <p>
              No threats match the selected filter.
            </p>

          </div>
        )}

        {/* ALERT TABLE */}

        {!loading && filteredAlerts.length > 0 && (

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

            {filteredAlerts.map((alert, index) => (

              <div
                className="table-row"
                key={alert.log_id || index}
              >

                {/* RISK */}

                <span>
                  <RiskBadge
                    level={alert.risk_level}
                  />
                </span>

                {/* USER */}

                <span className="user-cell">

                  <strong>
                    {alert.username || "Unknown"}
                  </strong>

                  <small>
                    ID: {alert.user_id ?? "-"}
                  </small>

                </span>

                {/* ACTION */}

                <span>
                  <code>
                    {alert.action || "-"}
                  </code>
                </span>

                {/* RESOURCE */}

                <span>
                  {alert.resource_type || "-"}
                </span>

                {/* STATUS */}

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

                {/* ML */}

                <span>

                  <span className="ml-badge">
                    {isMlAnomaly(alert)
                      ? "ANOMALY"
                      : "NORMAL"}
                  </span>

                </span>

                {/* SCORE */}

                <strong>
                  {alert.risk_score ?? 0}
                </strong>

              </div>

            ))}

          </div>

        )}

      </div>

    </div>
  );
}


/* =========================
   ML CHECK
========================= */

function isMlAnomaly(alert) {
  return (
    alert.ml_prediction === true ||
    alert.ml_anomaly === true ||
    alert.ml_prediction === "anomaly"
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


export default Alerts;