import { useEffect, useState } from "react";

const API = "http://127.0.0.1:8000";

function Incidents() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadIncidents = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API}/incidents/`);

      if (!response.ok) {
        throw new Error("Failed to load incidents");
      }

      const data = await response.json();
      setIncidents(data || []);
    } catch (err) {
      console.error(err);
      setError("Unable to load incidents from the backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIncidents();
  }, []);

  const critical = incidents.filter(
    (incident) =>
      incident.risk_level === "CRITICAL"
  ).length;

  const high = incidents.filter(
    (incident) =>
      incident.risk_level === "HIGH"
  ).length;

  return (
    <div className="dashboard-page">

      {/* HEADER */}

      <div className="dashboard-header">

        <div>
          <span className="breadcrumb">
            TrustField / Incidents
          </span>

          <h1>Incidents</h1>

          <p className="page-description">
            Investigate privilege escalation incidents
            detected by TrustField.
          </p>
        </div>

        <div className="dashboard-actions">

          <div className="connection-status">
            <span className="status-dot connected"></span>
            Backend connected
          </div>

          <button
            className="refresh-button"
            onClick={loadIncidents}
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

        <div className="stat-card">
          <span className="stat-label">
            TOTAL INCIDENTS
          </span>

          <strong>{incidents.length}</strong>

          <span className="stat-description">
            Generated incidents
          </span>
        </div>

        <div className="stat-card critical-card">
          <span className="stat-label">
            CRITICAL
          </span>

          <strong>{critical}</strong>

          <span className="stat-description">
            Critical incidents
          </span>
        </div>

        <div className="stat-card suspicious-card">
          <span className="stat-label">
            HIGH RISK
          </span>

          <strong>{high}</strong>

          <span className="stat-description">
            High-risk incidents
          </span>
        </div>

        <div className="stat-card ml-card">
          <span className="stat-label">
            OPEN
          </span>

          <strong>
            {incidents.filter(
              (incident) =>
                incident.status === "OPEN" ||
                incident.status === "open"
            ).length}
          </strong>

          <span className="stat-description">
            Requiring investigation
          </span>
        </div>

      </div>

      {/* INCIDENT LIST */}

      <div className="dashboard-card">

        <div className="card-header">

          <div>
            <h3>Security Incidents</h3>

            <p>
              Privilege escalation events requiring investigation
            </p>
          </div>

          <span className="threat-count">
            {incidents.length} total
          </span>

        </div>

        {loading && (
          <div className="empty-state">
            <h3>Loading incidents...</h3>
          </div>
        )}

        {!loading && incidents.length === 0 && (
          <div className="empty-state">

            <div className="empty-icon">
              ✓
            </div>

            <h3>
              No incidents detected
            </h3>

            <p>
              TrustField has not generated any incidents.
            </p>

          </div>
        )}

        {!loading && incidents.length > 0 && (

          <div className="incident-list">

            {incidents.map((incident, index) => (

              <div
                className="incident-item"
                key={incident.id || index}
              >

                <div className="incident-icon">
                  !
                </div>

                <div className="incident-content">

                  <div className="incident-title-row">

                    <h3>
                      {incident.title ||
                        "Privilege Escalation Detected"}
                    </h3>

                    <RiskBadge
                      level={
                        incident.risk_level ||
                        incident.severity ||
                        "HIGH"
                      }
                    />

                  </div>

                  <p>
                    {incident.description ||
                      "Suspicious privilege activity detected."}
                  </p>

                  <div className="incident-meta">

                    {incident.user_id !== undefined && (
                      <span>
                        User ID: {incident.user_id}
                      </span>
                    )}

                    {incident.log_id !== undefined && (
                      <span>
                        Log ID: {incident.log_id}
                      </span>
                    )}

                    {incident.status && (
                      <span>
                        Status: {incident.status}
                      </span>
                    )}

                  </div>

                </div>

                <div className="incident-status">

                  <span className="open-status">
                    {incident.status || "OPEN"}
                  </span>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

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
        level?.toLowerCase() || "high"
      }`}
    >
      {level}
    </span>
  );
}


export default Incidents;