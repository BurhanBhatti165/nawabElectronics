import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../../lib/api";

function parseImagesJson(value) {
  try {
    const parsed = JSON.parse(value || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function AdminAddProductPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState({ type: "", text: "" });
  const [form, setForm] = useState({
    name: "",
    description: "",
    specifications: "",
    price: "",
    discountPercentage: "",
    discountPrice: "",
    stock: "",
    categoryId: "",
    brandId: "",
    images: "[]",
    isFeatured: false,
    ac_type: "",
    refrigerator_type: "",
    cubic_feet: "",
    cooling_type: "",
    technology: "",
    color: "",
    capacity: "",
    weight: "",
  });

  useEffect(() => {
    apiFetch("/api/categories").then(setCategories);
    apiFetch("/api/brands").then(setBrands);
    if (isEdit) {
      apiFetch(`/api/products/${id}`).then((product) =>
        {
          const price = Number(product.price || 0);
          const discountPrice = product.discount_price ?? "";
          let discountPercentage = "";
          if (price > 0 && discountPrice !== "" && discountPrice !== null) {
            const raw = ((price - Number(discountPrice)) / price) * 100;
            discountPercentage = Number.isFinite(raw) ? Number(Math.max(0, raw).toFixed(2)) : "";
          }
          const imageList = parseImagesJson(product.images || "[]");
          setImages(imageList);
          setForm({
            name: product.name || "",
            description: product.description || "",
            specifications: product.specifications || "",
            price,
            discountPercentage,
            discountPrice,
            stock: product.stock || 0,
            categoryId: product.category_id || "",
            brandId: product.brand_id || "",
            images: JSON.stringify(imageList),
            isFeatured: product.is_featured || false,
            ac_type: product.ac_type || "",
            refrigerator_type: product.refrigerator_type || "",
            cubic_feet: product.cubic_feet || "",
            cooling_type: product.cooling_type || "",
            technology: product.technology || "",
            color: product.color || "",
            capacity: product.capacity || "",
            weight: product.weight || "",
          });
        }
      );
    }
  }, [id, isEdit]);

  useEffect(() => {
    setForm((prev) => ({ ...prev, images: JSON.stringify(images) }));
  }, [images]);

  const updateDiscountFromPercent = (price, percent) => {
    if (!price || percent === "" || percent === null) return "";
    const p = Number(price);
    const pct = Number(percent);
    if (isNaN(p) || isNaN(pct) || p <= 0) return "";
    return Number((p * (1 - pct / 100)).toFixed(2));
  };

  const updatePercentFromDiscount = (price, discountPrice) => {
    if (!price || !discountPrice) return "";
    const p = Number(price);
    const dp = Number(discountPrice);
    if (isNaN(p) || isNaN(dp) || p <= 0 || dp > p) return "";
    return Number((((p - dp) / p) * 100).toFixed(2));
  };

  const onImagesPicked = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    if (images.length + files.length > 4) {
      setError("You can upload up to 4 images only.");
      return;
    }
    setError("");
    setUploading(true);
    try {
      const uploadedUrls = [];
      for (const file of files) {
        const body = new FormData();
        body.append("file", file);
        const response = await apiFetch("/api/uploads/image", {
          method: "POST",
          body,
        });
        uploadedUrls.push(response.url);
      }
      setImages((prev) => [...prev, ...uploadedUrls]);
    } catch (uploadError) {
      setError(uploadError.message || "Image upload failed.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const removeImage = (indexToRemove) => {
    setImages((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setStatus({ type: "", text: "" });
    const payload = {
      ...form,
      price: form.price === "" ? 0 : Number(form.price),
      discountPrice: form.discountPrice === "" ? null : Number(form.discountPrice),
      stock: form.stock === "" ? 0 : Number(form.stock),
    };
    // Remove frontend-only field
    delete payload.discountPercentage;

    try {
      await apiFetch(isEdit ? `/api/products/${id}` : "/api/products", {
        method: isEdit ? "PUT" : "POST",
        body: JSON.stringify(payload),
      });
      navigate("/manager");
    } catch (err) {
      setError(err.message || "Failed to save product.");
      setStatus({ type: "error", text: "Failed to save product. Please check the form." });
    }
  };

  return (
    <form onSubmit={submit} className="container page">
      <h2>{isEdit ? "Update Product" : "Add Product"}</h2>
      {status.text ? (
        <div className={`alert ${status.type === "error" ? "alert-error" : "alert-success"}`}>{status.text}</div>
      ) : null}
      <div className="grid">
        <label>
          Product Name
          <input className="input" placeholder="Example: Gree 1.5 Ton AC" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </label>
        <label>
          Price (PKR)
          <input 
            className="input" 
            type="number" 
            placeholder="e.g. 55000" 
            value={form.price} 
            onChange={(e) => {
              const val = e.target.value === "" ? "" : Number(e.target.value);
              setForm({ 
                ...form, 
                price: val,
                discountPrice: updateDiscountFromPercent(val, form.discountPercentage)
              });
            }} 
          />
        </label>
        <label>
          Discount Percentage (%)
          <input
            className="input"
            type="number"
            placeholder="e.g. 10"
            min="0"
            max="100"
            value={form.discountPercentage}
            onChange={(e) => {
              const val = e.target.value === "" ? "" : Number(e.target.value);
              setForm({
                ...form,
                discountPercentage: val,
                discountPrice: updateDiscountFromPercent(form.price, val)
              });
            }}
          />
        </label>
        <label>
          Discount Price (PKR)
          <input 
            className="input" 
            type="number" 
            placeholder="e.g. 49500" 
            value={form.discountPrice} 
            onChange={(e) => {
              const val = e.target.value === "" ? "" : Number(e.target.value);
              setForm({
                ...form,
                discountPrice: val,
                discountPercentage: updatePercentFromDiscount(form.price, val)
              });
            }}
          />
        </label>
        <label>
          Stock Quantity
          <input 
            className="input" 
            type="number" 
            placeholder="e.g. 20" 
            value={form.stock} 
            onChange={(e) => setForm({ ...form, stock: e.target.value === "" ? "" : Number(e.target.value) })} 
          />
        </label>
        <label>
          Category
          <select className="select" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
            <option value="">Select category</option>
            {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
        </label>
        <label>
          Brand
          <select className="select" value={form.brandId} onChange={(e) => setForm({ ...form, brandId: e.target.value })}>
            <option value="">Select brand</option>
            {brands.map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}
          </select>
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', justifyContent: 'center' }}>
          <span style={{ fontWeight: 600 }}>Featured on Home Page</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
            <input 
              type="checkbox" 
              checked={form.isFeatured} 
              onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} 
              style={{ width: '1.2rem', height: '1.2rem', cursor: 'pointer' }}
            />
            <span>Show in "Shop by Category"</span>
          </div>
        </label>
      </div>
      
      <div className="grid" style={{ marginTop: '1rem' }}>
        <label>
          AC Type
          <select className="select" value={form.ac_type} onChange={(e) => setForm({ ...form, ac_type: e.target.value })}>
            <option value="">None</option>
            <option value="Ceiling Cassette">Ceiling Cassette</option>
            <option value="Floor Standing">Floor Standing</option>
            <option value="Wall Mounted Split Ac">Wall Mounted Split Ac</option>
          </select>
        </label>
        <label>
          Refrigerator Type
          <select className="select" value={form.refrigerator_type} onChange={(e) => setForm({ ...form, refrigerator_type: e.target.value })}>
            <option value="">None</option>
            <option value="Bedroom Size">Bedroom Size</option>
            <option value="Top Mount">Top Mount</option>
            <option value="Double Door">Double Door</option>
          </select>
        </label>
        <label>
          Cubic Feet
          <select className="select" value={form.cubic_feet} onChange={(e) => setForm({ ...form, cubic_feet: e.target.value })}>
            <option value="">None</option>
            <option value="4-CFT">4-CFT</option>
            <option value="6-CFT">6-CFT</option>
            <option value="7-CFT">7-CFT</option>
            <option value="8-CFT">8-CFT</option>
            <option value="9-CFT">9-CFT</option>
            <option value="11-CFT">11-CFT</option>
            <option value="11.5 CFT">11.5 CFT</option>
            <option value="12-CFT">12-CFT</option>
            <option value="13-CFT">13-CFT</option>
            <option value="14-CFT">14-CFT</option>
            <option value="14.5-CFT">14.5-CFT</option>
            <option value="15-CFT">15-CFT</option>
            <option value="15.5-CFT">15.5-CFT</option>
            <option value="16-CFT">16-CFT</option>
            <option value="18-CFT">18-CFT</option>
            <option value="20-CFT">20-CFT</option>
          </select>
        </label>
        <label>
          Cooling Type
          <select className="select" value={form.cooling_type} onChange={(e) => setForm({ ...form, cooling_type: e.target.value })}>
            <option value="">None</option>
            <option value="Cool Only">Cool Only</option>
            <option value="Heat And Cool">Heat And Cool</option>
          </select>
        </label>
        <label>
          Technology
          <select className="select" value={form.technology} onChange={(e) => setForm({ ...form, technology: e.target.value })}>
            <option value="">None</option>
            <option value="Electric">Electric</option>
            <option value="Electric + Gas">Electric + Gas</option>
            <option value="Fully Automatic">Fully Automatic</option>
            <option value="Gas Only">Gas Only</option>
            <option value="Instant">Instant</option>
            <option value="Inverter">Inverter</option>
            <option value="Non Inverter">Non Inverter</option>
          </select>
        </label>
        <label>
          Color
          <select className="select" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })}>
            <option value="">None</option>
            <option value="Beige">Beige</option>
            <option value="Black">Black</option>
            <option value="CHAMPAGNE">CHAMPAGNE</option>
            <option value="Charcoal Grey">Charcoal Grey</option>
            <option value="Glass">Glass</option>
            <option value="Golden">Golden</option>
            <option value="Grey">Grey</option>
            <option value="Maroon">Maroon</option>
            <option value="Metallic Golden Brown">Metallic Golden Brown</option>
            <option value="Mirror Glass">Mirror Glass</option>
            <option value="Purple Blaze">Purple Blaze</option>
            <option value="Red">Red</option>
            <option value="Red Blaze">Red Blaze</option>
            <option value="Silver">Silver</option>
            <option value="White">White</option>
          </select>
        </label>
        <label>
          Capacity
          <select className="select" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })}>
            <option value="">None</option>
            <option value="1 Ton(12000BTU)">1 Ton(12000BTU)</option>
            <option value="1.5 Ton(18000BTU)">1.5 Ton(18000BTU)</option>
            <option value="2 Ton(24000 BTU)">2 Ton(24000 BTU)</option>
            <option value="3 Ton (36000BTU)">3 Ton (36000BTU)</option>
            <option value="4 Ton(48000BTU)">4 Ton(48000BTU)</option>
            <option value="4.9 Liters">4.9 Liters</option>
            <option value="5 Liters">5 Liters</option>
            <option value="6 Liters">6 Liters</option>
            <option value="8 Liters">8 Liters</option>
            <option value="8 Kgs">8 Kgs</option>
            <option value="8 Gallon">8 Gallon</option>
            <option value="9 Kgs">9 Kgs</option>
            <option value="9 Liters">9 Liters</option>
            <option value="10 KH">10 KH</option>
            <option value="10 Liters">10 Liters</option>
            <option value="12-Gallon">12-Gallon</option>
            <option value="12 Liters">12 Liters</option>
            <option value="15 Gallon">15 Gallon</option>
            <option value="16 KG">16 KG</option>
            <option value="20 Liters">20 Liters</option>
            <option value="23 Liters">23 Liters</option>
            <option value="35-GLN">35-GLN</option>
            <option value="55-GLN">55-GLN</option>
            <option value="60 Liters">60 Liters</option>
            <option value="70 Liters">70 Liters</option>
            <option value="75 Liters">75 Liters</option>
          </select>
        </label>
        <label>
          Weight
          <select className="select" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })}>
            <option value="">None</option>
            <option value="21 KG">21 KG</option>
            <option value="25 KG">25 KG</option>
            <option value="40 KG">40 KG</option>
            <option value="50 KG">50 KG</option>
            <option value="70 KG">70 KG</option>
          </select>
        </label>
      </div>

      <label style={{ marginTop: '1rem', display: 'block' }}>
        Product Description
        <textarea className="input" placeholder="Main details customers should see on product page" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      </label>

      <label style={{ marginTop: '1rem', display: 'block' }}>
        Technical Specifications
        <textarea className="input" placeholder="Detailed specs, size, model number, etc." style={{ minHeight: '120px' }} value={form.specifications} onChange={(e) => setForm({ ...form, specifications: e.target.value })} />
      </label>
      <label>
        Product Images (max 4)
        <input className="input" type="file" accept="image/*" multiple onChange={onImagesPicked} disabled={uploading || images.length >= 4} />
      </label>
      {uploading ? <p style={{ margin: "0.4rem 0", color: "var(--muted)" }}>Uploading image(s)...</p> : null}
      {error ? <div className="alert alert-error">{error}</div> : null}
      {images.length ? (
        <div className="grid" style={{ marginBottom: "0.8rem" }}>
          {images.map((url, index) => (
            <div key={url} className="card">
              <img src={url} alt={`Product ${index + 1}`} style={{ width: "100%", maxHeight: 140, objectFit: "cover", borderRadius: 8 }} />
              <button type="button" className="btn btn-outline" style={{ marginTop: "0.6rem" }} onClick={() => removeImage(index)}>
                Remove
              </button>
            </div>
          ))}
        </div>
      ) : null}
      <button className="btn btn-primary" type="submit">{isEdit ? "Update" : "Save"}</button>
    </form>
  );
}
