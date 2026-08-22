import { useEffect, useState } from "react";

const API = "http://127.0.0.1:8000";

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API}/users/`);

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();
      setUsers(data);
    } catch (err) {
      console.error(err);
      setError("Unable to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <div className="eyebrow">TRUSTFIELD SECURITY</div>
          <h1>Users</h1>
          <p>Manage users and monitor their security activity.</p>
        </div>

        <button className="refresh-button" onClick={fetchUsers}>
          ↻ Refresh
        </button>
      </div>

      <div className="logs-card">
        <div className="card-header">
          <div>
            <h2>Registered Users</h2>
            <p>Users currently registered in TrustField.</p>
          </div>

          <div className="log-count">
            {users.length} total
          </div>
        </div>

        {loading && (
          <div className="empty-state">
            <p>Loading users...</p>
          </div>
        )}

        {error && !loading && (
          <div className="error-state">
            <p>{error}</p>
            <button onClick={fetchUsers}>Try Again</button>
          </div>
        )}

        {!loading && !error && users.length === 0 && (
          <div className="empty-state">
            <p>No users found.</p>
          </div>
        )}

        {!loading && !error && users.length > 0 && (
          <div className="table-wrapper">
            <table className="logs-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>USERNAME</th>
                  <th>EMAIL</th>
                  <th>ROLE</th>
                  <th>STATUS</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>

                    <td>
                      <strong>
                        {user.username || user.name || "-"}
                      </strong>
                    </td>

                    <td>
                      {user.email || "-"}
                    </td>

                    <td>
                      <span className="action-badge">
                        {user.role || "USER"}
                      </span>
                    </td>

                    <td>
                      <span className="status-badge status-success">
                        {user.status || "ACTIVE"}
                      </span>
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

export default Users;