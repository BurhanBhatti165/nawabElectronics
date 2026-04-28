import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../../lib/api";

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState([]);
  const [form, setForm] = useState({ name: "" });
  const [logoFile, setLogoFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState("");
  const [editForm, setEditForm] = useState({ name: "", logo: "" });
  const [editLogoFile, setEditLogoFile] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [status, setStatus] = useState({ type: "", text: "" });
  const [pendingDeleteId, setPendingDeleteId] = useState("");

  const loadBrands = async () => {
    const data = await apiFetch("/api/brands");
    setBrands(data || []);
  };

  useEffect(() => {
    loadBrands();
  }, []);

  const addBrand = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setStatus({ type: "error", text: "Brand name is required." });
      return;
    }
    setSaving(true);
    try {
      let uploadedLogoUrl = null;
      if (logoFile) {
        const formData = new FormData();
        formData.append("file", logoFile);
        const uploadResult = await apiFetch("/api/uploads/image", {
          method: "POST",
          body: formData,
        });
        uploadedLogoUrl = uploadResult?.url || null;
      }

      const created = await apiFetch("/api/brands", {
        method: "POST",
        body: JSON.stringify({
          name: form.name.trim(),
          logo: uploadedLogoUrl,
        }),
      });
      setBrands((prev) => [created, ...prev]);
      setForm({ name: "" });
      setLogoFile(null);
      setStatus({ type: "success", text: "Brand added successfully." });
    } catch (err) {
      console.error(err);
      setStatus({ type: "error", text: "Failed to add brand." });
    } finally {
      setSaving(false);
    }
  };

  const removeBrand = async (id) => {
    try {
      await apiFetch(`/api/brands/${id}`, { method: "DELETE" });
      setBrands((prev) => prev.filter((brand) => brand.id !== id));
      setPendingDeleteId("");
      setStatus({ type: "success", text: "Brand deleted successfully." });
    } catch (err) {
      console.error(err);
      setStatus({ type: "error", text: "Failed to delete brand. If products are linked, move them first." });
    }
  };

  const startEdit = (brand) => {
    setEditingId(brand.id);
    setEditForm({
      name: brand.name || "",
      logo: brand.logo || "",
    });
    setEditLogoFile(null);
  };

  const cancelEdit = () => {
    setEditingId("");
    setEditForm({ name: "", logo: "" });
    setEditLogoFile(null);
  };

  const updateBrand = async (e) => {
    e.preventDefault();
    if (!editingId) return;
    if (!editForm.name.trim()) {
      setStatus({ type: "error", text: "Brand name is required." });
      return;
    }
    setUpdating(true);
    try {
      let uploadedLogoUrl = editForm.logo || null;
      if (editLogoFile) {
        const formData = new FormData();
        formData.append("file", editLogoFile);
        const uploadResult = await apiFetch("/api/uploads/image", {
          method: "POST",
          body: formData,
        });
        uploadedLogoUrl = uploadResult?.url || null;
      }

      const updated = await apiFetch(`/api/brands/${editingId}`, {
        method: "PUT",
        body: JSON.stringify({
          name: editForm.name.trim(),
          logo: uploadedLogoUrl,
        }),
      });
      setBrands((prev) => prev.map((brand) => (brand.id === editingId ? updated : brand)));
      cancelEdit();
      setStatus({ type: "success", text: "Brand updated successfully." });
    } catch (err) {
      console.error(err);
      setStatus({ type: "error", text: "Failed to update brand." });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="container page">
      <h1 className="section-title">Manager Brands</h1>
      <div className="row" style={{ marginBottom: "0.8rem" }}>
        <Link to="/manager" className="btn btn-outline">Back to Products</Link>
      </div>
      {status.text ? (
        <div className={`alert ${status.type === "error" ? "alert-error" : "alert-success"}`}>{status.text}</div>
      ) : null}

      <form onSubmit={addBrand} className="card" style={{ marginBottom: "0.8rem" }}>
        <h3 style={{ marginTop: 0 }}>Add Brand</h3>
        <label>
          Brand Name
          <input
            className="input"
            placeholder="Example: Haier"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
          />
        </label>
        <label>
          Brand Logo (optional)
          <input
            className="input"
            type="file"
            accept="image/*"
            onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
          />
        </label>
        <div style={{ marginTop: "0.6rem" }}>
          <button className="btn btn-primary" type="submit" disabled={saving}>
            {saving ? "Saving..." : "Add Brand"}
          </button>
        </div>
      </form>

      {brands.map((brand) => (
        <div className="card row-between" key={brand.id}>
          <div style={{ flex: 1 }}>
            {editingId === brand.id ? (
              <form onSubmit={updateBrand}>
                <label>
                  Brand Name
                  <input
                    className="input"
                    value={editForm.name}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                  />
                </label>
                {editForm.logo ? (
                  <div style={{ marginTop: "0.6rem", marginBottom: "0.6rem" }}>
                    <p style={{ margin: "0 0 0.3rem", color: "var(--muted)" }}>Current Logo</p>
                    <img
                      src={editForm.logo}
                      alt={`${editForm.name || "Brand"} logo`}
                      style={{ width: "80px", height: "80px", objectFit: "contain", borderRadius: "8px", border: "1px solid var(--line)" }}
                    />
                  </div>
                ) : null}
                <label>
                  Replace Logo (optional)
                  <input
                    className="input"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setEditLogoFile(e.target.files?.[0] || null)}
                  />
                </label>
                <div className="row" style={{ marginTop: "0.6rem" }}>
                  <button className="btn btn-primary" type="submit" disabled={updating}>
                    {updating ? "Updating..." : "Save"}
                  </button>
                  <button className="btn btn-outline" type="button" onClick={cancelEdit}>
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <>
                <strong>{brand.name}</strong>
                {brand.logo ? (
                  <div style={{ marginTop: "0.4rem" }}>
                    <img
                      src={brand.logo}
                      alt={`${brand.name} logo`}
                      style={{ width: "64px", height: "64px", objectFit: "contain", borderRadius: "8px", border: "1px solid var(--line)" }}
                    />
                  </div>
                ) : (
                  <p style={{ margin: "0.2rem 0 0", color: "var(--muted)" }}>No logo image</p>
                )}
              </>
            )}
          </div>
          {editingId === brand.id ? null : (
            <div className="row">
              {pendingDeleteId === brand.id ? (
                <>
                  <button className="btn btn-outline" onClick={() => removeBrand(brand.id)}>
                    Confirm Delete
                  </button>
                  <button className="btn btn-outline" onClick={() => setPendingDeleteId("")}>
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button className="btn btn-outline" onClick={() => startEdit(brand)}>
                    Edit
                  </button>
                  <button className="btn btn-outline" onClick={() => setPendingDeleteId(brand.id)}>
                    Delete
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
