import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../../lib/api";
import { useAuthStore } from "../../store/useAuthStore";

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState({ type: "", text: "" });
  const [pendingDeleteId, setPendingDeleteId] = useState("");
  const role = useAuthStore((s) => s.role);

  useEffect(() => {
    apiFetch("/api/products").then(setProducts);
  }, []);

  const removeProduct = async (id) => {
    try {
      await apiFetch(`/api/products/${id}`, { method: "DELETE" });
      setProducts((prev) => prev.filter((x) => x.id !== id));
      setPendingDeleteId("");
      setStatus({ type: "success", text: "Product deleted successfully." });
    } catch (err) {
      console.error(err);
      setStatus({ type: "error", text: "Failed to delete product." });
    }
  };

  return (
    <div className="container page">
      <h1 className="section-title">Manager Products</h1>
      <p className="section-subtitle">Add, update, and delete products as {role}.</p>
      <div className="row" style={{ marginBottom: "0.8rem" }}>
        <Link to="/manager/products/add" className="btn btn-primary">Add Product</Link>
        <Link to="/manager/categories" className="btn btn-outline">Manage Categories</Link>
        <Link to="/manager/brands" className="btn btn-outline">Manage Brands</Link>
        <Link to="/manager/banners" className="btn btn-outline">Manage Banners</Link>
        <Link to="/admin/orders" className="btn btn-outline">View Orders</Link>
        {role === "admin" ? <Link to="/admin" className="btn btn-outline">Admin Dashboard</Link> : null}
      </div>
      {status.text ? (
        <div className={`alert ${status.type === "error" ? "alert-error" : "alert-success"}`}>{status.text}</div>
      ) : null}
      {products.map((product) => (
        <div className="card row-between" key={product.id}>
          <div>
            <strong>
              {product.name}
              {product.is_featured && <span className="badge badge-sale" style={{ marginLeft: "0.5rem" }}>Featured</span>}
            </strong>
            <p style={{ margin: 0, color: "var(--muted)" }}>PKR {Number(product.price).toLocaleString()}</p>
          </div>
          <div className="row">
            <Link className="btn btn-outline" to={`/manager/products/${product.id}/edit`}>Edit</Link>
            {pendingDeleteId === product.id ? (
              <>
                <button className="btn btn-outline" onClick={() => removeProduct(product.id)}>Confirm Delete</button>
                <button className="btn btn-outline" onClick={() => setPendingDeleteId("")}>Cancel</button>
              </>
            ) : (
              <button className="btn btn-outline" onClick={() => setPendingDeleteId(product.id)}>Delete</button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
