import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../../lib/api";

export default function AdminBannersPage() {
  const [banners, setBanners] = useState([]);
  const [form, setForm] = useState({ title: "", subtitle: "", link_url: "" });
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState("");
  const [editForm, setEditForm] = useState({ title: "", subtitle: "", link_url: "", image: "" });
  const [editImageFile, setEditImageFile] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [status, setStatus] = useState({ type: "", text: "" });
  const [pendingDeleteId, setPendingDeleteId] = useState("");

  const loadBanners = async () => {
    try {
      const data = await apiFetch("/api/banners");
      setBanners(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadBanners();
  }, []);

  const addBanner = async (e) => {
    e.preventDefault();
    if (!imageFile) {
      setStatus({ type: "error", text: "Banner image is required." });
      return;
    }
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("file", imageFile);
      const uploadResult = await apiFetch("/api/uploads/image", {
        method: "POST",
        body: formData,
      });

      const created = await apiFetch("/api/banners", {
        method: "POST",
        body: JSON.stringify({
          title: form.title.trim(),
          subtitle: form.subtitle.trim(),
          link_url: form.link_url.trim(),
          image: uploadResult.url,
        }),
      });
      setBanners((prev) => [...prev, created]);
      setForm({ title: "", subtitle: "", link_url: "" });
      setImageFile(null);
      setStatus({ type: "success", text: "Banner added successfully." });
    } catch (err) {
      console.error(err);
      setStatus({ type: "error", text: "Failed to add banner." });
    } finally {
      setSaving(false);
    }
  };

  const removeBanner = async (id) => {
    try {
      await apiFetch(`/api/banners/${id}`, { method: "DELETE" });
      setBanners((prev) => prev.filter((banner) => banner.id !== id));
      setPendingDeleteId("");
      setStatus({ type: "success", text: "Banner deleted successfully." });
    } catch (err) {
      console.error(err);
      setStatus({ type: "error", text: "Failed to delete banner." });
    }
  };

  const startEdit = (banner) => {
    setEditingId(banner.id);
    setEditForm({
      title: banner.title || "",
      subtitle: banner.subtitle || "",
      link_url: banner.link_url || "",
      image: banner.image || "",
    });
    setEditImageFile(null);
  };

  const cancelEdit = () => {
    setEditingId("");
    setEditForm({ title: "", subtitle: "", link_url: "", image: "" });
    setEditImageFile(null);
  };

  const updateBanner = async (e) => {
    e.preventDefault();
    if (!editingId) return;
    setUpdating(true);
    try {
      let uploadedImageUrl = editForm.image;
      if (editImageFile) {
        const formData = new FormData();
        formData.append("file", editImageFile);
        const uploadResult = await apiFetch("/api/uploads/image", {
          method: "POST",
          body: formData,
        });
        uploadedImageUrl = uploadResult.url;
      }

      if (!uploadedImageUrl) {
        setStatus({ type: "error", text: "Banner image is required." });
        setUpdating(false);
        return;
      }

      const updated = await apiFetch(`/api/banners/${editingId}`, {
        method: "PUT",
        body: JSON.stringify({
          title: editForm.title.trim(),
          subtitle: editForm.subtitle.trim(),
          link_url: editForm.link_url.trim(),
          image: uploadedImageUrl,
        }),
      });
      setBanners((prev) => prev.map((banner) => (banner.id === editingId ? updated : banner)));
      cancelEdit();
      setStatus({ type: "success", text: "Banner updated successfully." });
    } catch (err) {
      console.error(err);
      setStatus({ type: "error", text: "Failed to update banner." });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="container page">
      <h1 className="section-title">Manager Banners</h1>
      <p className="section-subtitle">Manage homepage carousel banners.</p>
      <div className="row" style={{ marginBottom: "0.8rem" }}>
        <Link to="/manager" className="btn btn-outline">Back to Products</Link>
      </div>
      {status.text ? (
        <div className={`alert ${status.type === "error" ? "alert-error" : "alert-success"}`}>{status.text}</div>
      ) : null}

      {banners.length >= 4 ? (
        <div className="alert alert-error" style={{ marginBottom: "0.8rem" }}>
          Maximum limit of 4 banners reached. Please delete an existing banner to add a new one.
        </div>
      ) : (
        <form onSubmit={addBanner} className="card" style={{ marginBottom: "0.8rem" }}>
          <h3 style={{ marginTop: 0 }}>Add Banner</h3>
        <div className="grid">
          <label>
            Banner Title (Optional)
            <input
              className="input"
              placeholder="Example: Summer Cooling Sale"
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
            />
          </label>
          <label>
            Banner Subtitle (Optional)
            <input
              className="input"
              placeholder="Example: Up to 25% off"
              value={form.subtitle}
              onChange={(e) => setForm((prev) => ({ ...prev, subtitle: e.target.value }))}
            />
          </label>
          <label>
            Link URL (Optional)
            <input
              className="input"
              placeholder="Example: /shop?category_id=123"
              value={form.link_url}
              onChange={(e) => setForm((prev) => ({ ...prev, link_url: e.target.value }))}
            />
          </label>
          <label>
            Banner Image (Required)
            <input
              className="input"
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              required
            />
          </label>
        </div>
        <div style={{ marginTop: "1rem" }}>
          <button className="btn btn-primary" type="submit" disabled={saving}>
            {saving ? "Saving..." : "Add Banner"}
          </button>
        </div>
      </form>
      )}

      <div className="grid">
        {banners.map((banner) => (
          <div className="card" key={banner.id}>
            {editingId === banner.id ? (
              <form onSubmit={updateBanner} className="admin-form-stack">
                <label>
                  Title
                  <input
                    className="input"
                    value={editForm.title}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, title: e.target.value }))}
                  />
                </label>
                <label>
                  Subtitle
                  <input
                    className="input"
                    value={editForm.subtitle}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, subtitle: e.target.value }))}
                  />
                </label>
                <label>
                  Link URL
                  <input
                    className="input"
                    value={editForm.link_url}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, link_url: e.target.value }))}
                  />
                </label>
                <div style={{ margin: "0.5rem 0" }}>
                  <p style={{ margin: "0 0 0.3rem", color: "var(--muted)" }}>Current Image</p>
                  <img
                    src={editForm.image}
                    alt="Banner"
                    style={{ width: "100%", height: "120px", objectFit: "cover", borderRadius: "8px" }}
                  />
                </div>
                <label>
                  Replace Image
                  <input
                    className="input"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setEditImageFile(e.target.files?.[0] || null)}
                  />
                </label>
                <div className="row" style={{ marginTop: "1rem" }}>
                  <button className="btn btn-primary" type="submit" disabled={updating}>
                    {updating ? "Updating..." : "Save"}
                  </button>
                  <button className="btn btn-outline" type="button" onClick={cancelEdit}>
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                <img
                  src={banner.image}
                  alt={banner.title || "Banner"}
                  style={{ width: "100%", height: "160px", objectFit: "cover", borderRadius: "8px", marginBottom: "1rem" }}
                />
                <h4 style={{ margin: "0 0 0.5rem" }}>{banner.title || "No Title"}</h4>
                <p style={{ margin: "0 0 0.5rem", color: "var(--muted)" }}>{banner.subtitle || "No Subtitle"}</p>
                {banner.link_url && (
                  <p style={{ margin: "0 0 1rem", fontSize: "0.85rem", wordBreak: "break-all" }}>
                    <strong>Link:</strong> {banner.link_url}
                  </p>
                )}
                <div className="row" style={{ marginTop: "auto" }}>
                  {pendingDeleteId === banner.id ? (
                    <>
                      <button className="btn btn-outline" onClick={() => removeBanner(banner.id)}>
                        Confirm Delete
                      </button>
                      <button className="btn btn-outline" onClick={() => setPendingDeleteId("")}>
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button className="btn btn-outline" onClick={() => startEdit(banner)}>
                        Edit
                      </button>
                      <button className="btn btn-outline" onClick={() => setPendingDeleteId(banner.id)}>
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
