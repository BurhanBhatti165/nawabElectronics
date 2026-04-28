import { useEffect, useState } from "react";
import { apiFetch } from "../../lib/api";

export default function AdminManagersPage() {
  const [managers, setManagers] = useState([]);
  const [form, setForm] = useState({ email: "", name: "", phone: "", password: "" });

  const loadManagers = () => apiFetch("/api/users/managers").then(setManagers);

  useEffect(() => {
    loadManagers();
  }, []);

  const addManager = async (e) => {
    e.preventDefault();
    await apiFetch("/api/users/managers", {
      method: "POST",
      body: JSON.stringify(form),
    });
    setForm({ email: "", name: "", phone: "", password: "" });
    loadManagers();
  };

  const removeManager = async (id) => {
    await apiFetch(`/api/users/managers/${id}`, { method: "DELETE" });
    setManagers((prev) => prev.filter((manager) => manager.id !== id));
  };

  return (
    <div className="container page">
      <h1 className="section-title">Admin: Manage Managers</h1>
      <p className="section-subtitle">Only admins can add or remove manager accounts.</p>

      <form onSubmit={addManager} className="card admin-form-stack">
        <label>
          Manager Email
          <input
            className="input"
            type="email"
            required
            placeholder="manager@example.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </label>
        <label>
          Full Name
          <input
            className="input"
            placeholder="Manager name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </label>
        <label>
          Phone
          <input
            className="input"
            placeholder="03xx-xxxxxxx"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </label>
        <label>
          Initial Password
          <input
            className="input"
            type="password"
            required
            placeholder="Set a password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </label>
        <button type="submit" className="btn btn-primary">Add Manager</button>
      </form>

      {managers.map((manager) => (
        <div className="card row-between" key={manager.id}>
          <div>
            <strong>{manager.name || "Manager"}</strong>
            <p style={{ margin: 0, color: "var(--muted)" }}>{manager.email}</p>
          </div>
          <button className="btn btn-outline" onClick={() => removeManager(manager.id)}>Remove</button>
        </div>
      ))}
    </div>
  );
}
