import { useEffect, useState } from "react";

const API = "http://127.0.0.1:8000";

function Logs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API}/logs/`);

      if (!response.ok) {
        throw new Error("Failed to fetch logs");
      }

      const data = await response.json();
      setLogs(data);
    } catch (err) {
      console.error(err);
      setError("Unable to load security logs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const getStatusClass = (status) => {
    if (!status) return "status-neutral";

    const value = status.toLowerCase();

    if (value === "success") return "status-success";
    if (value === "denied" || value === "failed") return "status-danger";

    return "status-neutral";
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <div className="eyebrow">TRUSTFIELD SECURITY</div>
          <h1>Security Logs</h1>
          <p>Monitor all recorded user and privilege activities.</p>
        </div>

        <button className="refresh-button" onClick={fetchLogs}>
          ↻ Refresh
        </button>
      </div>

      <div className="logs-card">
        <div className="card-header">
          <div>
            <h2>Activity Logs</h2>
            <p>Recorded security events from the TrustField backend.</p>
          </div>

          <div className="log-count">
            {logs.length} total
          </div>
        </div>

        {loading && (
          <div className="empty-state">
            <p>Loading security logs...</p>
          </div>
        )}

        {error && !loading && (
          <div className="error-state">
            <p>{error}</p>
            <button onClick={fetchLogs}>Try Again</button>
          </div>
        )}

        {!loading && !error && logs.length === 0 && (
          <div className="empty-state">
            <p>No security logs found.</p>
          </div>
        )}

        {!loading && !error && logs.length > 0 && (
          <div className="table-wrapper">
            <table className="logs-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>USER</th>
                  <th>ACTION</th>
                  <th>RESOURCE</th>
                  <th>STATUS</th>
                  <th>IP ADDRESS</th>
                  <th>TIMESTAMP</th>
                </tr>
              </thead>

              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td>{log.id}</td>

                    <td>
                      <strong>{log.username || `User ${log.user_id}`}</strong>
                      <small>ID: {log.user_id}</small>
                    </td>

                    <td>
                      <span className="action-badge">
                        {log.action}
                      </span>
                    </td>

                    <td>
                      {log.resource_type || "-"}
                    </td>

                    <td>
                      <span
                        className={`status-badge ${getStatusClass(
                          log.status
                        )}`}
                      >
                        {log.status || "UNKNOWN"}
                      </span>
                    </td>

                    <td>
                      {log.ip_address || "-"}
                    </td>

                    <td>
                      {log.timestamp
                        ? new Date(log.timestamp).toLocaleString()
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Logs;