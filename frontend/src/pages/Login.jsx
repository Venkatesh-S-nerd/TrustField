import { useState } from "react";

const API = "http://127.0.0.1:8000";

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const url =
        `${API}/auth/login` +
        `?username=${encodeURIComponent(username)}` +
        `&password=${encodeURIComponent(password)}`;

      const response = await fetch(url, {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Invalid username or password"
        );
      }

      // Save JWT token
      localStorage.setItem(
        "trustfield_token",
        data.access_token
      );

      // Tell App.jsx that authentication succeeded
      onLogin();

    } catch (err) {
      console.error("Login error:", err);

      setError(
        err.message ||
        "Unable to connect to the TrustField server."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      <div className="login-card">

        {/* BRAND */}

        <div className="login-brand">

          <div className="login-icon">
            T
          </div>

          <div>
            <h1>TrustField</h1>
            <p>Security Platform</p>
          </div>

        </div>


        {/* HEADING */}

        <div className="login-heading">

          <h2>Welcome back</h2>

          <p>
            Sign in to access the TrustField
            security dashboard.
          </p>

        </div>


        {/* FORM */}

        <form onSubmit={handleSubmit}>

          <div className="input-group">

            <label>
              Username
            </label>

            <input
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) =>
                setUsername(e.target.value)
              }
              disabled={loading}
              required
            />

          </div>


          <div className="input-group">

            <label>
              Password
            </label>

            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              disabled={loading}
              required
            />

          </div>


          {/* ERROR */}

          {error && (
            <div className="login-error">
              {error}
            </div>
          )}


          {/* BUTTON */}

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading
              ? "Signing in..."
              : "Sign In"}
          </button>

        </form>


        {/* FOOTER */}

        <div className="login-footer">
          Protected by TrustField Security Engine
        </div>

      </div>

    </div>
  );
}

export default Login;