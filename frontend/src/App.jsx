import { useEffect, useMemo, useState } from "react";

const API = "http://127.0.0.1:8000";

function App() {
  const [activePage, setActivePage] = useState("Dashboard");
  const [detections, setDetections] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const [detectionRes, incidentRes, logRes] = await Promise.all([
        fetch(`${API}/alerts/detect`),
        fetch(`${API}/incidents/`),
        fetch(`${API}/logs/`),
      ]);

      if (!detectionRes.ok) {
        throw new Error("Could not connect to detection API");
      }

      const detectionData = await detectionRes.json();

      setDetections(detectionData.detections || []);

      if (incidentRes.ok) {
        const incidentData = await incidentRes.json();
        setIncidents(Array.isArray(incidentData) ? incidentData : []);
      }

      if (logRes.ok) {
        const logData = await logRes.json();
        setLogs(Array.isArray(logData) ? logData : []);
      }

      setLastUpdated(new Date());
    } catch (err) {
      console.error(err);
      setError(
        "Unable to connect to the TrustField backend. Make sure FastAPI is running on port 8000."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const stats = useMemo(() => {
    const suspicious = detections.filter((d) => d.suspicious).length;

    const critical = detections.filter(
      (d) => d.risk_level === "CRITICAL"
    ).length;

    const high = detections.filter(
      (d) => d.risk_level === "HIGH"
    ).length;

    const mlAnomalies = detections.filter(
      (d) => d.ml_anomaly === true
    ).length;

    return {
      total: detections.length,
      suspicious,
      critical,
      high,
      mlAnomalies,
    };
  }, [detections]);

  const riskDistribution = useMemo(() => {
    return {
      LOW: detections.filter((d) => d.risk_level === "LOW").length,
      MEDIUM: detections.filter((d) => d.risk_level === "MEDIUM").length,
      HIGH: detections.filter((d) => d.risk_level === "HIGH").length,
      CRITICAL: detections.filter((d) => d.risk_level === "CRITICAL").length,
    };
  }, [detections]);

  return (
    <div className="app">
      <style>{styles}</style>

      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">T</div>

          <div>
            <div className="brand-name">TrustField</div>
            <div className="brand-subtitle">Security Platform</div>
          </div>
        </div>

        <div className="nav-section">
          <div className="nav-title">MONITORING</div>

          <NavButton
            icon="▦"
            label="Dashboard"
            active={activePage === "Dashboard"}
            onClick={() => setActivePage("Dashboard")}
          />

          <NavButton
            icon="⚠"
            label="Alerts"
            active={activePage === "Alerts"}
            onClick={() => setActivePage("Alerts")}
            badge={stats.suspicious}
          />

          <NavButton
            icon="◈"
            label="Incidents"
            active={activePage === "Incidents"}
            onClick={() => setActivePage("Incidents")}
            badge={incidents.length}
          />

          <NavButton
            icon="≡"
            label="Logs"
            active={activePage === "Logs"}
            onClick={() => setActivePage("Logs")}
          />
        </div>

        <div className="nav-section">
          <div className="nav-title">MANAGEMENT</div>

          <NavButton
            icon="♙"
            label="Users"
            active={activePage === "Users"}
            onClick={() => setActivePage("Users")}
          />

          <NavButton
            icon="⚙"
            label="Settings"
            active={activePage === "Settings"}
            onClick={() => setActivePage("Settings")}
          />
        </div>

        <div className="sidebar-bottom">
          <div className="system-status">
            <span className="status-dot"></span>

            <div>
              <div className="status-title">System Online</div>
              <div className="status-text">Detection engine active</div>
            </div>
          </div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <div className="breadcrumb">TrustField / {activePage}</div>
            <h1>{activePage}</h1>
          </div>

          <div className="topbar-actions">
            <div className="backend-status">
              <span className="status-dot"></span>
              Backend connected
            </div>

            <button
              className="refresh-btn"
              onClick={loadData}
              disabled={loading}
            >
              {loading ? "Refreshing..." : "↻ Refresh"}
            </button>
          </div>
        </header>

        {error && (
          <div className="error-box">
            <strong>Backend connection error</strong>
            <span>{error}</span>
          </div>
        )}

        {activePage === "Dashboard" && (
          <Dashboard
            stats={stats}
            detections={detections}
            riskDistribution={riskDistribution}
            incidents={incidents}
            lastUpdated={lastUpdated}
          />
        )}

        {activePage === "Alerts" && (
          <Alerts detections={detections} />
        )}

        {activePage === "Incidents" && (
          <Incidents incidents={incidents} />
        )}

        {activePage === "Logs" && <Logs logs={logs} />}

        {activePage === "Users" && (
          <Users detections={detections} />
        )}

        {activePage === "Settings" && <Settings />}
      </main>
    </div>
  );
}


/* ============================================================
   NAVIGATION
============================================================ */

function NavButton({ icon, label, active, onClick, badge }) {
  return (
    <button
      className={`nav-button ${active ? "active" : ""}`}
      onClick={onClick}
    >
      <span className="nav-icon">{icon}</span>

      <span className="nav-label">{label}</span>

      {badge > 0 && <span className="nav-badge">{badge}</span>}
    </button>
  );
}


/* ============================================================
   DASHBOARD
============================================================ */

function Dashboard({
  stats,
  detections,
  riskDistribution,
  incidents,
  lastUpdated,
}) {
  const suspicious = detections
    .filter((d) => d.suspicious)
    .slice(0, 6);

  return (
    <div className="content">
      <div className="hero">
        <div>
          <div className="hero-label">SECURITY OVERVIEW</div>

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

        <div className="hero-shield">
          <div className="shield">⬢</div>
          <span>PROTECTED</span>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard
          title="TOTAL LOGS"
          value={stats.total}
          icon="≡"
          description="Activities analyzed"
        />

        <StatCard
          title="SUSPICIOUS"
          value={stats.suspicious}
          icon="⚠"
          description="Potential threats"
          danger
        />

        <StatCard
          title="CRITICAL"
          value={stats.critical}
          icon="!"
          description="Critical activity"
          critical
        />

        <StatCard
          title="ML ANOMALIES"
          value={stats.mlAnomalies}
          icon="AI"
          description="Detected by ML model"
          purple
        />
      </div>

      <div className="dashboard-grid">
        <section className="panel">
          <div className="panel-header">
            <div>
              <h3>Risk Distribution</h3>
              <p>Current activity classification</p>
            </div>
          </div>

          <div className="risk-chart">
            <RiskBar
              label="Critical"
              value={riskDistribution.CRITICAL}
              total={stats.total}
              className="critical"
            />

            <RiskBar
              label="High"
              value={riskDistribution.HIGH}
              total={stats.total}
              className="high"
            />

            <RiskBar
              label="Medium"
              value={riskDistribution.MEDIUM}
              total={stats.total}
              className="medium"
            />

            <RiskBar
              label="Low"
              value={riskDistribution.LOW}
              total={stats.total}
              className="low"
            />
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <h3>Detection Engine</h3>
              <p>TrustField security components</p>
            </div>
          </div>

          <div className="engine-list">
            <EngineItem
              name="Rule-Based Detection"
              status="ACTIVE"
            />

            <EngineItem
              name="Machine Learning Detection"
              status="ACTIVE"
            />

            <EngineItem
              name="Privilege Analysis"
              status="ACTIVE"
            />

            <EngineItem
              name="Incident Generation"
              status="ACTIVE"
            />
          </div>
        </section>
      </div>

      <section className="panel table-panel">
        <div className="panel-header">
          <div>
            <h3>Recent Suspicious Activity</h3>
            <p>Highest priority detections</p>
          </div>

          <span className="count-pill">
            {stats.suspicious} detected
          </span>
        </div>

        {suspicious.length === 0 ? (
          <EmptyState message="No suspicious activity detected." />
        ) : (
          <DetectionTable detections={suspicious} />
        )}
      </section>

      <div className="footer-info">
        Last updated:{" "}
        {lastUpdated
          ? lastUpdated.toLocaleTimeString()
          : "Not available"}
      </div>
    </div>
  );
}


/* ============================================================
   ALERTS
============================================================ */

function Alerts({ detections }) {
  const suspicious = detections.filter((d) => d.suspicious);

  return (
    <div className="content">
      <PageIntro
        title="Security Alerts"
        description="Suspicious privilege activity identified by TrustField."
      />

      <div className="alert-summary">
        <div>
          <span>ACTIVE ALERTS</span>
          <strong>{suspicious.length}</strong>
        </div>

        <div>
          <span>ML ANOMALIES</span>
          <strong>
            {suspicious.filter((d) => d.ml_anomaly).length}
          </strong>
        </div>
      </div>

      <section className="panel table-panel">
        <div className="panel-header">
          <div>
            <h3>Detected Threats</h3>
            <p>Activities requiring attention</p>
          </div>
        </div>

        {suspicious.length === 0 ? (
          <EmptyState message="No active alerts." />
        ) : (
          <DetectionTable detections={suspicious} />
        )}
      </section>
    </div>
  );
}


/* ============================================================
   INCIDENTS
============================================================ */

function Incidents({ incidents }) {
  return (
    <div className="content">
      <PageIntro
        title="Security Incidents"
        description="Automatically generated incidents from high-risk detections."
      />

      <section className="panel table-panel">
        <div className="panel-header">
          <div>
            <h3>Incidents</h3>
            <p>Privilege escalation incidents</p>
          </div>

          <span className="count-pill">
            {incidents.length} total
          </span>
        </div>

        {incidents.length === 0 ? (
          <EmptyState message="No incidents found." />
        ) : (
          <div className="incident-list">
            {incidents.map((incident, index) => (
              <div
                className="incident-card"
                key={incident.id || index}
              >
                <div className="incident-icon">!</div>

                <div className="incident-main">
                  <h4>{incident.title}</h4>

                  <p>
                    {incident.description ||
                      "Suspicious security activity detected."}
                  </p>

                  <div className="incident-meta">
                    <span>
                      User ID: {incident.user_id ?? "N/A"}
                    </span>

                    <span>
                      Log ID: {incident.log_id ?? "N/A"}
                    </span>
                  </div>
                </div>

                <div className="incident-right">
                  <RiskBadge
                    level={incident.severity || "HIGH"}
                  />

                  <span className="open-status">
                    {incident.status || "OPEN"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}


/* ============================================================
   LOGS
============================================================ */

function Logs({ logs }) {
  return (
    <div className="content">
      <PageIntro
        title="Activity Logs"
        description="Raw security activity collected by TrustField."
      />

      <section className="panel table-panel">
        <div className="panel-header">
          <div>
            <h3>System Logs</h3>
            <p>Cloud and user activity</p>
          </div>

          <span className="count-pill">
            {logs.length} records
          </span>
        </div>

        {logs.length === 0 ? (
          <EmptyState message="No logs found." />
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>User</th>
                  <th>Action</th>
                  <th>Resource</th>
                  <th>Status</th>
                  <th>Timestamp</th>
                </tr>
              </thead>

              <tbody>
                {logs.map((log, index) => (
                  <tr key={log.id || index}>
                    <td>#{log.id}</td>

                    <td>
                      <strong>
                        {log.username || "Unknown"}
                      </strong>
                    </td>

                    <td>
                      <code>{log.action}</code>
                    </td>

                    <td>{log.resource_type}</td>

                    <td>
                      <StatusBadge status={log.status} />
                    </td>

                    <td>
                      {log.timestamp
                        ? new Date(
                            log.timestamp
                          ).toLocaleString()
                        : "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}


/* ============================================================
   USERS
============================================================ */

function Users({ detections }) {
  const users = {};

  detections.forEach((d) => {
    const id = d.user_id;

    if (!users[id]) {
      users[id] = {
        id,
        username: d.username,
        activities: 0,
        suspicious: 0,
      };
    }

    users[id].activities += 1;

    if (d.suspicious) {
      users[id].suspicious += 1;
    }
  });

  const userList = Object.values(users);

  return (
    <div className="content">
      <PageIntro
        title="Users"
        description="User activity and privilege risk overview."
      />

      <section className="panel table-panel">
        <div className="panel-header">
          <div>
            <h3>Monitored Users</h3>
            <p>User activity derived from security logs</p>
          </div>
        </div>

        {userList.length === 0 ? (
          <EmptyState message="No user activity available." />
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>Username</th>
                  <th>Activities</th>
                  <th>Suspicious</th>
                  <th>Risk Status</th>
                </tr>
              </thead>

              <tbody>
                {userList.map((user) => (
                  <tr key={user.id}>
                    <td>#{user.id}</td>

                    <td>
                      <strong>{user.username}</strong>
                    </td>

                    <td>{user.activities}</td>

                    <td>{user.suspicious}</td>

                    <td>
                      {user.suspicious > 0 ? (
                        <RiskBadge level="HIGH" />
                      ) : (
                        <RiskBadge level="LOW" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}


/* ============================================================
   SETTINGS
============================================================ */

function Settings() {
  return (
    <div className="content">
      <PageIntro
        title="Settings"
        description="TrustField system configuration."
      />

      <section className="panel settings-panel">
        <div className="setting-row">
          <div>
            <h3>Detection Engine</h3>
            <p>Rule-based privilege escalation detection</p>
          </div>

          <span className="setting-active">ACTIVE</span>
        </div>

        <div className="setting-row">
          <div>
            <h3>Machine Learning Model</h3>
            <p>Anomaly detection model</p>
          </div>

          <span className="setting-active">ACTIVE</span>
        </div>

        <div className="setting-row">
          <div>
            <h3>Automatic Incident Creation</h3>
            <p>High and critical detections generate incidents</p>
          </div>

          <span className="setting-active">ACTIVE</span>
        </div>
      </section>
    </div>
  );
}


/* ============================================================
   COMPONENTS
============================================================ */

function StatCard({
  title,
  value,
  icon,
  description,
  danger,
  critical,
  purple,
}) {
  let className = "stat-card";

  if (danger) className += " danger";
  if (critical) className += " critical";
  if (purple) className += " purple";

  return (
    <div className={className}>
      <div className="stat-top">
        <span className="stat-title">{title}</span>
        <span className="stat-icon">{icon}</span>
      </div>

      <div className="stat-value">{value}</div>

      <div className="stat-description">
        {description}
      </div>
    </div>
  );
}


function RiskBar({ label, value, total, className }) {
  const percentage =
    total > 0 ? Math.max((value / total) * 100, 2) : 2;

  return (
    <div className="risk-row">
      <div className="risk-label">
        <span>{label}</span>
        <strong>{value}</strong>
      </div>

      <div className="risk-track">
        <div
          className={`risk-fill ${className}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}


function EngineItem({ name, status }) {
  return (
    <div className="engine-item">
      <div className="engine-left">
        <span className="engine-dot"></span>
        <span>{name}</span>
      </div>

      <span className="engine-status">{status}</span>
    </div>
  );
}


function DetectionTable({ detections }) {
  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Risk</th>
            <th>User</th>
            <th>Action</th>
            <th>Resource</th>
            <th>Status</th>
            <th>ML</th>
            <th>Score</th>
          </tr>
        </thead>

        <tbody>
          {detections.map((detection, index) => (
            <tr key={detection.log_id || index}>
              <td>
                <RiskBadge level={detection.risk_level} />
              </td>

              <td>
                <strong>
                  {detection.username || "Unknown"}
                </strong>

                <small>
                  ID: {detection.user_id}
                </small>
              </td>

              <td>
                <code>{detection.action}</code>
              </td>

              <td>{detection.resource_type}</td>

              <td>
                <StatusBadge status={detection.status} />
              </td>

              <td>
                {detection.ml_anomaly ? (
                  <span className="ml-anomaly">
                    ANOMALY
                  </span>
                ) : detection.ml_prediction !== null &&
                  detection.ml_prediction !== undefined ? (
                  <span className="ml-normal">
                    NORMAL
                  </span>
                ) : (
                  <span className="ml-na">N/A</span>
                )}
              </td>

              <td>
                <strong>{detection.risk_score}</strong>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


function RiskBadge({ level }) {
  const normalized = String(level || "LOW").toUpperCase();

  return (
    <span className={`risk-badge ${normalized.toLowerCase()}`}>
      {normalized}
    </span>
  );
}


function StatusBadge({ status }) {
  const normalized = String(status || "unknown").toLowerCase();

  return (
    <span className={`status-badge ${normalized}`}>
      {normalized}
    </span>
  );
}


function PageIntro({ title, description }) {
  return (
    <div className="page-intro">
      <div>
        <div className="hero-label">TRUSTFIELD SECURITY</div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
    </div>
  );
}


function EmptyState({ message }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">✓</div>
      <h3>{message}</h3>
      <p>The system currently has nothing requiring attention.</p>
    </div>
  );
}


/* ============================================================
   STYLES
============================================================ */

const styles = `
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family:
    Inter,
    ui-sans-serif,
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;

  background: #060912;
  color: #e8edf7;
}

button {
  font-family: inherit;
}

.app {
  min-height: 100vh;
  display: flex;
  background:
    radial-gradient(
      circle at 75% 10%,
      rgba(43, 119, 255, 0.08),
      transparent 30%
    ),
    #060912;
}


/* SIDEBAR */

.sidebar {
  width: 250px;
  min-height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;

  display: flex;
  flex-direction: column;

  background: #080d17;
  border-right: 1px solid #172033;

  padding: 24px 16px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 4px 10px 30px;
}

.brand-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;

  display: grid;
  place-items: center;

  font-size: 20px;
  font-weight: 800;

  color: #ffffff;
  background: linear-gradient(
    135deg,
    #2678ff,
    #703cff
  );

  box-shadow:
    0 0 25px rgba(48, 111, 255, 0.25);
}

.brand-name {
  font-size: 19px;
  font-weight: 800;
}

.brand-subtitle {
  color: #71809a;
  font-size: 11px;
  margin-top: 2px;
}

.nav-section {
  margin-bottom: 28px;
}

.nav-title {
  padding: 0 12px 9px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1.5px;
  color: #53627a;
}

.nav-button {
  width: 100%;
  border: 0;
  background: transparent;

  color: #8995aa;

  display: flex;
  align-items: center;
  gap: 12px;

  padding: 12px;
  margin: 3px 0;

  border-radius: 8px;

  cursor: pointer;
  text-align: left;

  transition: 0.2s;
}

.nav-button:hover {
  background: #101827;
  color: #e8edf7;
}

.nav-button.active {
  color: #ffffff;
  background: rgba(40, 119, 255, 0.13);
  box-shadow: inset 3px 0 0 #3685ff;
}

.nav-icon {
  width: 20px;
  text-align: center;
  font-size: 16px;
}

.nav-label {
  flex: 1;
  font-size: 13px;
  font-weight: 600;
}

.nav-badge {
  min-width: 20px;
  padding: 2px 6px;

  text-align: center;

  border-radius: 10px;

  font-size: 10px;
  font-weight: 800;

  background: #df354f;
  color: white;
}

.sidebar-bottom {
  margin-top: auto;
}

.system-status {
  display: flex;
  align-items: center;
  gap: 10px;

  padding: 14px;

  border: 1px solid #172337;
  background: #0b111d;
  border-radius: 10px;
}

.status-dot {
  width: 8px;
  height: 8px;

  flex-shrink: 0;

  border-radius: 50%;
  background: #36d98c;

  box-shadow: 0 0 10px rgba(54, 217, 140, 0.7);
}

.status-title {
  font-size: 12px;
  font-weight: 700;
}

.status-text {
  margin-top: 3px;
  font-size: 10px;
  color: #66758d;
}


/* MAIN */

.main {
  margin-left: 250px;
  width: calc(100% - 250px);
  min-height: 100vh;
}

.topbar {
  height: 82px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 0 34px;

  border-bottom: 1px solid #151f31;
  background: rgba(6, 9, 18, 0.9);
}

.breadcrumb {
  font-size: 11px;
  color: #59677e;
  margin-bottom: 4px;
}

.topbar h1 {
  margin: 0;
  font-size: 21px;
}

.topbar-actions {
  display: flex;
  align-items: center;
  gap: 14px;
}

.backend-status {
  display: flex;
  align-items: center;
  gap: 7px;

  font-size: 11px;
  color: #7f8da5;
}

.refresh-btn {
  border: 1px solid #243452;
  background: #0d1523;
  color: #dbe6f8;

  border-radius: 7px;
  padding: 9px 14px;

  cursor: pointer;
  font-size: 11px;
  font-weight: 700;
}

.refresh-btn:hover {
  background: #152239;
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: wait;
}


/* CONTENT */

.content {
  padding: 30px 34px 50px;
  max-width: 1500px;
  margin: auto;
}

.hero {
  min-height: 220px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 34px;

  border: 1px solid #17243a;
  border-radius: 15px;

  background:
    radial-gradient(
      circle at 85% 50%,
      rgba(46, 110, 255, 0.18),
      transparent 35%
    ),
    linear-gradient(
      135deg,
      #0c1422,
      #080d17
    );

  margin-bottom: 20px;
}

.hero-label {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1.6px;
  color: #438aff;
  margin-bottom: 10px;
}

.hero h2,
.page-intro h2 {
  margin: 0;
  font-size: 30px;
  line-height: 1.15;
  letter-spacing: -0.8px;
}

.hero p,
.page-intro p {
  color: #74839b;
  font-size: 13px;
  max-width: 600px;
  line-height: 1.6;
  margin: 13px 0 0;
}

.hero-shield {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: 40px;
}

.shield {
  width: 100px;
  height: 100px;

  display: grid;
  place-items: center;

  border-radius: 30px;

  font-size: 46px;

  color: #3989ff;

  border: 1px solid #244b83;

  background: rgba(41, 113, 255, 0.08);

  box-shadow:
    0 0 60px rgba(38, 111, 255, 0.15);
}

.hero-shield span {
  margin-top: 12px;
  color: #4bdb9a;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1px;
}


/* STATS */

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.stat-card {
  padding: 20px;

  border: 1px solid #17243a;
  border-radius: 12px;

  background: #0a101b;

  transition: 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  border-color: #263957;
}

.stat-card.danger {
  border-color: rgba(255, 65, 91, 0.25);
}

.stat-card.critical {
  border-color: rgba(255, 47, 80, 0.35);
}

.stat-card.purple {
  border-color: rgba(134, 85, 255, 0.3);
}

.stat-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-title {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1px;
  color: #68768d;
}

.stat-icon {
  color: #548fff;
  font-weight: 800;
}

.danger .stat-icon,
.critical .stat-icon {
  color: #ff5269;
}

.purple .stat-icon {
  color: #9a6bff;
}

.stat-value {
  margin-top: 15px;

  font-size: 32px;
  font-weight: 800;

  letter-spacing: -1px;
}

.stat-description {
  margin-top: 4px;
  color: #596980;
  font-size: 11px;
}


/* PANELS */

.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.panel {
  border: 1px solid #17243a;
  background: #0a101b;
  border-radius: 12px;
  overflow: hidden;
}

.panel-header {
  min-height: 72px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 18px 20px;

  border-bottom: 1px solid #151f30;
}

.panel-header h3 {
  margin: 0;
  font-size: 14px;
}

.panel-header p {
  margin: 5px 0 0;
  color: #5f6e84;
  font-size: 11px;
}

.count-pill {
  padding: 5px 9px;
  border-radius: 5px;

  font-size: 10px;
  font-weight: 700;

  color: #65a2ff;
  background: rgba(51, 128, 255, 0.1);
}


/* RISK */

.risk-chart {
  padding: 22px;
}

.risk-row {
  margin-bottom: 20px;
}

.risk-row:last-child {
  margin-bottom: 0;
}

.risk-label {
  display: flex;
  justify-content: space-between;
  margin-bottom: 7px;

  font-size: 11px;
  color: #8896aa;
}

.risk-label strong {
  color: #d9e1ed;
}

.risk-track {
  height: 7px;
  background: #111a28;
  border-radius: 10px;
  overflow: hidden;
}

.risk-fill {
  height: 100%;
  border-radius: 10px;
}

.risk-fill.critical {
  background: #ff435d;
}

.risk-fill.high {
  background: #ff8b47;
}

.risk-fill.medium {
  background: #e6bd4d;
}

.risk-fill.low {
  background: #3fcf8c;
}


/* ENGINE */

.engine-list {
  padding: 8px 20px 12px;
}

.engine-item {
  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 13px 0;

  border-bottom: 1px solid #121c2a;

  font-size: 12px;
}

.engine-item:last-child {
  border-bottom: 0;
}

.engine-left {
  display: flex;
  align-items: center;
  gap: 9px;
}

.engine-dot {
  width: 7px;
  height: 7px;

  border-radius: 50%;

  background: #39d58c;
  box-shadow: 0 0 8px rgba(57, 213, 140, 0.5);
}

.engine-status {
  color: #40d390;
  font-size: 9px;
  font-weight: 800;
}


/* TABLE */

.table-panel {
  margin-top: 20px;
}

.table-wrapper {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th {
  padding: 13px 18px;

  text-align: left;

  color: #56647a;

  font-size: 9px;
  font-weight: 800;
  letter-spacing: 1px;

  background: #080e18;
}

td {
  padding: 15px 18px;

  border-top: 1px solid #121c2a;

  color: #9aa7ba;

  font-size: 11px;
}

tr:hover td {
  background: rgba(30, 56, 91, 0.12);
}

td strong {
  color: #dce5f2;
}

td small {
  display: block;
  color: #55647b;
  margin-top: 3px;
}

code {
  color: #69a6ff;
  background: #101a2a;
  padding: 4px 7px;
  border-radius: 4px;
  font-size: 10px;
}


/* BADGES */

.risk-badge,
.status-badge {
  display: inline-block;

  padding: 5px 8px;

  border-radius: 4px;

  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.4px;
}

.risk-badge.critical {
  color: #ff667b;
  background: rgba(255, 60, 85, 0.12);
}

.risk-badge.high {
  color: #ff9c61;
  background: rgba(255, 128, 55, 0.12);
}

.risk-badge.medium {
  color: #e9ca63;
  background: rgba(226, 186, 56, 0.12);
}

.risk-badge.low {
  color: #55d99b;
  background: rgba(55, 210, 139, 0.1);
}

.status-badge.success {
  color: #56d89c;
  background: rgba(57, 214, 143, 0.08);
}

.status-badge.denied,
.status-badge.failed,
.status-badge.failure {
  color: #ff6378;
  background: rgba(255, 71, 94, 0.1);
}

.status-badge.unknown {
  color: #8795aa;
  background: #111a28;
}

.ml-anomaly {
  color: #ff6579;
  font-size: 9px;
  font-weight: 800;
}

.ml-normal {
  color: #55d99b;
  font-size: 9px;
  font-weight: 800;
}

.ml-na {
  color: #58667b;
  font-size: 9px;
}


/* PAGE INTRO */

.page-intro {
  padding: 10px 0 28px;
}

.page-intro h2 {
  font-size: 28px;
}


/* ALERT SUMMARY */

.alert-summary {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;

  margin-bottom: 20px;
}

.alert-summary > div {
  padding: 22px;

  border-radius: 10px;
  border: 1px solid #17243a;

  background: #0a101b;
}

.alert-summary span {
  display: block;

  color: #68768d;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1px;
}

.alert-summary strong {
  display: block;

  margin-top: 9px;

  font-size: 30px;
}


/* INCIDENTS */

.incident-list {
  padding: 10px 20px 20px;
}

.incident-card {
  display: flex;
  align-items: flex-start;
  gap: 15px;

  padding: 18px 0;

  border-bottom: 1px solid #141f2e;
}

.incident-card:last-child {
  border-bottom: 0;
}

.incident-icon {
  width: 36px;
  height: 36px;

  flex-shrink: 0;

  display: grid;
  place-items: center;

  border-radius: 8px;

  color: #ff6075;
  background: rgba(255, 66, 91, 0.1);

  font-weight: 800;
}

.incident-main {
  flex: 1;
}

.incident-main h4 {
  margin: 0;

  color: #e3eaf5;
  font-size: 13px;
}

.incident-main p {
  color: #6d7b91;
  font-size: 11px;
  line-height: 1.6;
  margin: 7px 0;
}

.incident-meta {
  display: flex;
  gap: 15px;

  color: #4e5d73;
  font-size: 9px;
}

.incident-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 7px;
}

.open-status {
  color: #ff687c;
  font-size: 9px;
  font-weight: 800;
}


/* SETTINGS */

.settings-panel {
  padding: 0 22px;
}

.setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 22px 0;

  border-bottom: 1px solid #141f2e;
}

.setting-row:last-child {
  border-bottom: 0;
}

.setting-row h3 {
  margin: 0;
  font-size: 13px;
}

.setting-row p {
  margin: 5px 0 0;
  color: #627188;
  font-size: 11px;
}

.setting-active {
  color: #4bd494;
  font-size: 9px;
  font-weight: 800;
}


/* EMPTY */

.empty-state {
  padding: 50px 20px;
  text-align: center;
}

.empty-icon {
  width: 42px;
  height: 42px;

  margin: auto;

  display: grid;
  place-items: center;

  border-radius: 50%;

  color: #4dd396;
  background: rgba(56, 210, 139, 0.1);
}

.empty-state h3 {
  margin: 14px 0 5px;
  font-size: 13px;
}

.empty-state p {
  margin: 0;
  color: #56647a;
  font-size: 11px;
}


/* ERROR */

.error-box {
  margin: 20px 34px 0;

  padding: 14px 18px;

  border: 1px solid rgba(255, 67, 91, 0.3);
  background: rgba(255, 67, 91, 0.08);

  border-radius: 8px;

  display: flex;
  flex-direction: column;
  gap: 4px;
}

.error-box strong {
  color: #ff687d;
  font-size: 12px;
}

.error-box span {
  color: #a6757e;
  font-size: 11px;
}


/* FOOTER */

.footer-info {
  padding: 18px 0;

  color: #46546a;
  font-size: 10px;

  text-align: right;
}


/* RESPONSIVE */

@media (max-width: 1100px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 750px) {
  .sidebar {
    width: 70px;
    padding: 20px 8px;
  }

  .brand {
    justify-content: center;
    padding: 4px 0 25px;
  }

  .brand > div:last-child,
  .nav-title,
  .nav-label,
  .nav-badge,
  .sidebar-bottom {
    display: none;
  }

  .nav-button {
    justify-content: center;
  }

  .main {
    margin-left: 70px;
    width: calc(100% - 70px);
  }

  .topbar {
    padding: 0 18px;
  }

  .backend-status {
    display: none;
  }

  .content {
    padding: 20px 18px;
  }

  .hero {
    padding: 25px;
  }

  .hero-shield {
    display: none;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .alert-summary {
    grid-template-columns: 1fr;
  }
}
`;

export default App;