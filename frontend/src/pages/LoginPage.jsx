import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { useAuthStore } from "../store/useAuthStore";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setError("");

    try {
      const user = await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      
      login(user);
      
      // Redirect based on role
      if (user.role === "admin") navigate("/admin");
      else if (user.role === "manager") navigate("/manager");
      else navigate("/");
      
    } catch (err) {
      setError(err.message || "Login failed. If you are a customer, please use the Register page.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container page">
      <div className="checkout-container" style={{ maxWidth: "450px" }}>
        <div className="checkout-form-section">
          <h1 className="section-title" style={{ textAlign: "center" }}>Welcome Back</h1>
          <p className="section-subtitle" style={{ textAlign: "center", margin: "0 auto 2rem" }}>
            Sign in with your email to manage your account.
          </p>

          <form onSubmit={handleLogin} className="admin-form-stack">
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                className="input"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                className="input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <button 
              type="submit" 
              className="btn btn-primary place-order-btn" 
              disabled={loading}
              style={{ marginTop: "1rem" }}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div style={{ textAlign: "center", marginTop: "2rem", color: "var(--muted)", fontSize: "0.9rem" }}>
            Don't have an account? <Link to="/register" style={{ color: "var(--accent)", fontWeight: 600 }}>Register as Customer</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
