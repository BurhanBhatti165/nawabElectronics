import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../../lib/api";

export default function AdminAddCategoryPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [form, setForm] = useState({
    name: "",
    description: "",
    show_on_home: false,
    home_description: "",
  });
  const [status, setStatus] = useState({ type: "", text: "" });

  useEffect(() => {
    if (!isEdit) return;
    apiFetch(`/api/categories/${id}`).then((category) =>
      setForm({
        name: category.name || "",
        description: category.description || "",
        show_on_home: Boolean(category.show_on_home),
        home_description: category.home_description || "",
      })
    );
  }, [id, isEdit]);

  const submit = async (e) => {
    e.preventDefault();
    setStatus({ type: "", text: "" });
    try {
      await apiFetch(isEdit ? `/api/categories/${id}` : "/api/categories", {
        method: isEdit ? "PUT" : "POST",
        body: JSON.stringify(form),
      });
      setStatus({ type: "success", text: isEdit ? "Category updated successfully." : "Category added successfully." });
      navigate("/manager/categories");
    } catch (err) {
      console.error(err);
      setStatus({ type: "error", text: "Failed to save category." });
    }
  };

  return (
    <form onSubmit={submit} className="container page">
      <h2>{isEdit ? "Update Category" : "Add Category"}</h2>
      {status.text ? (
        <div className={`alert ${status.type === "error" ? "alert-error" : "alert-success"}`}>{status.text}</div>
      ) : null}
      <label>
        Category Name
        <input className="input" placeholder="Example: Air Conditioner" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      </label>
      <label>
        Description
        <textarea className="input" placeholder="Short description shown in category listings" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      </label>
      <label style={{ display: "flex", gap: "0.5rem", alignItems: "center", margin: "0.6rem 0" }}>
        <input
          type="checkbox"
          checked={form.show_on_home}
          onChange={(e) => setForm({ ...form, show_on_home: e.target.checked })}
        />
        Show this category in Top Categories on homepage
      </label>
      {form.show_on_home ? (
        <label>
          Home Card Description
          <textarea
            className="input"
            placeholder="Optional text shown on homepage Top Categories card"
            value={form.home_description}
            onChange={(e) => setForm({ ...form, home_description: e.target.value })}
          />
        </label>
      ) : null}
      <button className="btn btn-primary" type="submit">{isEdit ? "Update" : "Save"}</button>
    </form>
  );
}
