import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { useAuthStore } from "../store/useAuthStore";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    phone: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const user = await apiFetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(formData),
      });
      
      login(user);
      navigate("/");
      
    } catch (err) {
      setError(err.message || "Registration failed. This email might already be in use.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="container page">
      <div className="checkout-container" style={{ maxWidth: "500px" }}>
        <div className="checkout-form-section">
          <h1 className="section-title" style={{ textAlign: "center" }}>Join Nawab</h1>
          <p className="section-subtitle" style={{ textAlign: "center", margin: "0 auto 2rem" }}>
            Create an account to track orders and save your details.
          </p>

          <form onSubmit={handleRegister} className="admin-form-stack">
            <div className="form-group">
              <label>Full Name</label>
              <input
                name="name"
                className="input"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input
                name="email"
                type="email"
                className="input"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                name="password"
                type="password"
                className="input"
                placeholder="Choose a strong password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Phone Number (Optional)</label>
              <input
                name="phone"
                className="input"
                placeholder="0300 1234567"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <button 
              type="submit" 
              className="btn btn-primary place-order-btn" 
              disabled={loading}
              style={{ marginTop: "1rem" }}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <div style={{ textAlign: "center", marginTop: "2rem", color: "var(--muted)", fontSize: "0.9rem" }}>
            Already have an account? <Link to="/login" style={{ color: "var(--accent)", fontWeight: 600 }}>Sign In</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
