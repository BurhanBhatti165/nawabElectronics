import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../../lib/api";

export default function AdminDashboardPage() {
  const [summary, setSummary] = useState({ totalOrders: 0, totalRevenue: 0 });

  useEffect(() => {
    apiFetch("/api/orders/summary").then(setSummary);
  }, []);

  return (
    <div className="container page">
      <h1 className="section-title">Admin Dashboard</h1>
      <p className="section-subtitle">Full access including manager tools and order performance metrics.</p>
      <div className="grid">
        <div className="card">
          <p className="pill">Orders</p>
          <h3>{summary.totalOrders}</h3>
          <p style={{ color: "var(--muted)" }}>Total number of orders</p>
        </div>
        <div className="card">
          <p className="pill">Revenue</p>
          <h3>PKR {Number(summary.totalRevenue).toLocaleString()}</h3>
          <p style={{ color: "var(--muted)" }}>Total revenue from all orders</p>
        </div>
      </div>
      <div className="row">
        <Link to="/admin/orders" className="btn btn-primary">View Detailed Orders</Link>
        <Link to="/manager" className="btn btn-outline">Manage Products</Link>
        <Link to="/manager/categories" className="btn btn-outline">Manage Categories</Link>
        <Link to="/admin/managers" className="btn btn-outline">Manage Managers</Link>
      </div>
    </div>
  );
}
