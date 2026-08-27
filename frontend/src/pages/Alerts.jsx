import { useEffect, useState } from "react";

const API = "http://127.0.0.1:8000";

function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("ALL");

  // ============================================================
  // LOAD SUSPICIOUS ALERTS
  // ============================================================

  const loadAlerts = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API}/detection/suspicious`
      );

      if (!response.ok) {
        throw new Error(
          `Backend returned ${response.status}`
        );
      }

      const data = await response.json();

      console.log("Suspicious alerts:", data);

      setAlerts(data.detections || []);
    } catch (error) {
      console.error("Alerts error:", error);

      setError(
        "Unable to load suspicious alerts from the TrustField backend."
      );

      setAlerts([]);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // LOAD ON PAGE OPEN
  // ============================================================

  useEffect(() => {
    loadAlerts();
  }, []);

  // ============================================================
  // FILTER ALERTS
  // ============================================================

  const filteredAlerts =
    filter === "ALL"
      ? alerts
      : alerts.filter(
          (alert) => alert.risk_level === filter
        );

  // ============================================================
  // COUNTS
  // ============================================================

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

  const mlCount = alerts.filter(
    (alert) => alert.ml_anomaly === true
  ).length;

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="dashboard-page">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="dashboard-header">

        <div>
          <span className="breadcrumb">
            TrustField / Alerts
          </span>

          <h1>Security Alerts</h1>

          <p className="page-description">
            Monitor suspicious privilege escalation
            activity detected by TrustField.
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
            disabled={loading}
          >
            {loading ? "Refreshing..." : "↻ Refresh"}
          </button>

        </div>

      </div>


      {/* ======================================================
          ERROR
      ====================================================== */}

      {error && (
        <div className="error-banner">

          <strong>
            Backend connection error
          </strong>

          <p>
            {error}
          </p>

        </div>
      )}


      {/* ======================================================
          SUMMARY CARDS
      ====================================================== */}

      <div className="stats-grid">

        <div className="stat-card critical-card">

          <span className="stat-label">
            CRITICAL
          </span>

          <strong>
            {criticalCount}
          </strong>

          <span className="stat-description">
            Critical threats
          </span>

        </div>


        <div className="stat-card suspicious-card">

          <span className="stat-label">
            HIGH RISK
          </span>

          <strong>
            {highCount}
          </strong>

          <span className="stat-description">
            High priority alerts
          </span>

        </div>


        <div className="stat-card">

          <span className="stat-label">
            MEDIUM
          </span>

          <strong>
            {mediumCount}
          </strong>

          <span className="stat-description">
            Medium risk activity
          </span>

        </div>


        <div className="stat-card ml-card">

          <span className="stat-label">
            ML ANOMALIES
          </span>

          <strong>
            {mlCount}
          </strong>

          <span className="stat-description">
            Detected by ML model
          </span>

        </div>

      </div>


      {/* ======================================================
          ALERT TABLE CARD
      ====================================================== */}

      <div className="dashboard-card recent-threats">

        <div className="card-header">

          <div>

            <h3>
              Detected Threats
            </h3>

            <p>
              Suspicious activities requiring attention
            </p>

          </div>

          <span className="threat-count">
            {filteredAlerts.length} detected
          </span>

        </div>


        {/* ====================================================
            FILTER BUTTONS
        ==================================================== */}

        <div className="alert-filters">

          {[
            "ALL",
            "CRITICAL",
            "HIGH",
            "MEDIUM",
            "LOW"
          ].map((level) => (

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

          ))}

        </div>


        {/* ====================================================
            LOADING
        ==================================================== */}

        {loading && (

          <div className="empty-state">

            <h3>
              Loading alerts...
            </h3>

            <p>
              TrustField is analyzing the detection data.
            </p>

          </div>

        )}


        {/* ====================================================
            EMPTY
        ==================================================== */}

        {!loading &&
          !error &&
          filteredAlerts.length === 0 && (

            <div className="empty-state">

              <div className="empty-icon">
                ✓
              </div>

              <h3>
                No alerts found
              </h3>

              <p>
                No suspicious activity matches
                the selected filter.
              </p>

            </div>

          )}


        {/* ====================================================
            TABLE
        ==================================================== */}

        {!loading &&
          filteredAlerts.length > 0 && (

            <div className="threat-table">

              {/* TABLE HEADER */}

              <div className="table-header">

                <span>
                  RISK
                </span>

                <span>
                  USER
                </span>

                <span>
                  ACTION
                </span>

                <span>
                  RESOURCE
                </span>

                <span>
                  STATUS
                </span>

                <span>
                  ML
                </span>

                <span>
                  SCORE
                </span>

              </div>


              {/* TABLE ROWS */}

              {filteredAlerts.map(
                (alert, index) => (

                  <div
                    className="table-row"
                    key={
                      alert.log_id || index
                    }
                  >

                    {/* RISK */}

                    <span>
                      <RiskBadge
                        level={
                          alert.risk_level
                        }
                      />
                    </span>


                    {/* USER */}

                    <span className="user-cell">

                      <strong>
                        {alert.username ||
                          "Unknown"}
                      </strong>

                      <small>
                        ID:{" "}
                        {alert.user_id ??
                          "-"}
                      </small>

                    </span>


                    {/* ACTION */}

                    <span>

                      <code>
                        {alert.action ||
                          "-"}
                      </code>

                    </span>


                    {/* RESOURCE */}

                    <span>
                      {alert.resource_type ||
                        "-"}
                    </span>


                    {/* STATUS */}

                    <span>

                      <span
                        className={`status-badge ${
                          alert.status?.toLowerCase() ===
                          "denied"
                            ? "denied"
                            : "success"
                        }`}
                      >
                        {alert.status ||
                          "-"}
                      </span>

                    </span>


                    {/* ML */}

                    <span>

                      <span
                        className={
                          alert.ml_anomaly
                            ? "ml-badge anomaly"
                            : "ml-badge normal"
                        }
                      >
                        {alert.ml_anomaly
                          ? "ANOMALY"
                          : "NORMAL"}
                      </span>

                    </span>


                    {/* SCORE */}

                    <strong>
                      {alert.risk_score ??
                        0}
                    </strong>

                  </div>

                )
              )}

            </div>

          )}


        {/* ====================================================
            ALERT DETAILS
        ==================================================== */}

        {!loading &&
          filteredAlerts.length > 0 && (

            <div className="alert-details-section">

              <div className="card-header">

                <div>

                  <h3>
                    Detection Details
                  </h3>

                  <p>
                    Reasons behind detected threats
                  </p>

                </div>

              </div>


              {filteredAlerts.map(
                (alert, index) => (

                  <div
                    className="alert-detail"
                    key={
                      `detail-${alert.log_id || index}`
                    }
                  >

                    <div className="alert-detail-header">

                      <strong>
                        {alert.username ||
                          "Unknown User"}
                      </strong>

                      <RiskBadge
                        level={
                          alert.risk_level
                        }
                      />

                    </div>


                    <div className="alert-detail-info">

                      <span>
                        Action:{" "}
                        <code>
                          {alert.action ||
                            "-"}
                        </code>
                      </span>

                      <span>
                        Resource:{" "}
                        {alert.resource_type ||
                          "-"}
                      </span>

                      <span>
                        Score:{" "}
                        {alert.risk_score ??
                          0}
                      </span>

                      <span>
                        ML:{" "}
                        {alert.ml_anomaly
                          ? "ANOMALY"
                          : "NORMAL"}
                      </span>

                    </div>


                    {Array.isArray(
                      alert.reasons
                    ) &&
                      alert.reasons.length >
                        0 && (

                        <div className="alert-reasons">

                          <strong>
                            Detection reasons:
                          </strong>

                          <ul>

                            {alert.reasons.map(
                              (
                                reason,
                                reasonIndex
                              ) => (

                                <li
                                  key={
                                    reasonIndex
                                  }
                                >
                                  {reason}
                                </li>

                              )
                            )}

                          </ul>

                        </div>

                      )}

                  </div>

                )
              )}

            </div>

          )}

      </div>

    </div>
  );
}


/* ============================================================
   RISK BADGE
============================================================ */

function RiskBadge({ level }) {

  const normalizedLevel =
    level?.toUpperCase() || "LOW";

  return (
    <span
      className={`risk-badge ${
        normalizedLevel.toLowerCase()
      }`}
    >
      {normalizedLevel}
    </span>
  );
}


export default Alerts;