import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../../lib/api";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    apiFetch("/api/categories").then(setCategories);
  }, []);

  const removeCategory = async (id) => {
    await apiFetch(`/api/categories/${id}`, { method: "DELETE" });
    setCategories((prev) => prev.filter((x) => x.id !== id));
  };

  return (
    <div className="container page">
      <h1 className="section-title">Manager Categories</h1>
      <div className="row" style={{ marginBottom: "0.8rem" }}>
        <Link to="/manager/categories/add" className="btn btn-primary">Add Category</Link>
        <Link to="/manager" className="btn btn-outline">Back to Products</Link>
      </div>
      {categories.map((category) => (
        <div className="card row-between" key={category.id}>
          <div>
            <strong>
              {category.name}
              {category.show_on_home && <span className="badge badge-sale" style={{ marginLeft: "0.5rem" }}>Top Category</span>}
            </strong>
            <p style={{ margin: "0.2rem 0 0", color: "var(--muted)" }}>{category.description || "No description"}</p>
            <p style={{ margin: "0.2rem 0 0", color: "var(--muted)", fontSize: "0.8rem" }}>ID: {category.id}</p>
          </div>
          <div className="row">
            <Link to={`/manager/categories/${category.id}/edit`} className="btn btn-outline">Edit</Link>
            <button className="btn btn-outline" onClick={() => removeCategory(category.id)}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
}
