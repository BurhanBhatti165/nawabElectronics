import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { useCartStore } from "../store/useCartStore";

const PAGE_SIZE = 20;

const getRelatedRecord = (value) => (Array.isArray(value) ? value[0] : value);
const getDisplayName = (record) =>
  record?.name || record?.title || record?.category_name || record?.brand_name || "";

export default function ShopPage() {
  const [searchParams] = useSearchParams();
  const addItem = useCartStore((s) => s.addItem);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastAddedId, setLastAddedId] = useState(null);
  const [toastMessage, setToastMessage] = useState("");
  const [loadedImages, setLoadedImages] = useState({});
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);

  // Filters
  const [query, setQuery] = useState(searchParams.get("search") || "");
  const [categoryId, setCategoryId] = useState(searchParams.get("category_id") || "");
  const [brandId, setBrandId] = useState(searchParams.get("brand_id") || "");
  const [minPrice, setMinPrice] = useState(searchParams.get("min_price") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("max_price") || "");
  const [acType, setAcType] = useState(searchParams.get("ac_type") || "");
  const [refrigeratorType, setRefrigeratorType] = useState(searchParams.get("refrigerator_type") || "");
  const [cubicFeet, setCubicFeet] = useState(searchParams.get("cubic_feet") || "");
  const [coolingType, setCoolingType] = useState(searchParams.get("cooling_type") || "");
  const [technology, setTechnology] = useState(searchParams.get("technology") || "");
  const [color, setColor] = useState(searchParams.get("color") || "");
  const [capacity, setCapacity] = useState(searchParams.get("capacity") || "");
  const [weight, setWeight] = useState(searchParams.get("weight") || "");
  const [inStock, setInStock] = useState(false);
  const [sortBy, setSortBy] = useState("newest");

  // Sync from URL
  useEffect(() => {
    setQuery(searchParams.get("search") || "");
    setCategoryId(searchParams.get("category_id") || "");
    setBrandId(searchParams.get("brand_id") || "");
    setMinPrice(searchParams.get("min_price") || "");
    setMaxPrice(searchParams.get("max_price") || "");
    setAcType(searchParams.get("ac_type") || "");
    setRefrigeratorType(searchParams.get("refrigerator_type") || "");
    setCubicFeet(searchParams.get("cubic_feet") || "");
    setCoolingType(searchParams.get("cooling_type") || "");
    setTechnology(searchParams.get("technology") || "");
    setColor(searchParams.get("color") || "");
    setCapacity(searchParams.get("capacity") || "");
    setWeight(searchParams.get("weight") || "");
    setPage(0);
  }, [searchParams]);

  // Toast auto-dismiss
  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(""), 1800);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  // Load categories & brands once
  useEffect(() => {
    Promise.all([apiFetch("/api/categories"), apiFetch("/api/brands")]).then(([categoryData, brandData]) => {
      setCategories(
        (categoryData || []).map((c) => ({ id: c.id, name: getDisplayName(c) })).filter((c) => c.id && c.name)
      );
      setBrands(
        (brandData || []).map((b) => ({ id: b.id, name: getDisplayName(b) })).filter((b) => b.id && b.name)
      );
    });
  }, []);

  // Fetch products whenever filters / sort / page change
  useEffect(() => {
    const params = new URLSearchParams();
    if (query.trim()) params.set("search", query.trim());
    if (categoryId) params.set("category_id", categoryId);
    if (brandId) params.set("brand_id", brandId);
    if (minPrice) params.set("min_price", minPrice);
    if (maxPrice) params.set("max_price", maxPrice);
    if (acType) params.set("ac_type", acType);
    if (refrigeratorType) params.set("refrigerator_type", refrigeratorType);
    if (cubicFeet) params.set("cubic_feet", cubicFeet);
    if (coolingType) params.set("cooling_type", coolingType);
    if (technology) params.set("technology", technology);
    if (color) params.set("color", color);
    if (capacity) params.set("capacity", capacity);
    if (weight) params.set("weight", weight);
    if (inStock) params.set("in_stock", "true");
    params.set("sort_by", sortBy);
    params.set("limit", PAGE_SIZE);
    params.set("offset", page * PAGE_SIZE);

    setLoading(true);
    apiFetch(`/api/products?${params.toString()}`)
      .then((data) => {
        setProducts(data || []);
        // If we got a full page, there might be more
        setTotalCount(data?.length === PAGE_SIZE ? (page + 2) * PAGE_SIZE : page * PAGE_SIZE + (data?.length || 0));
      })
      .finally(() => setLoading(false));
  }, [query, categoryId, brandId, minPrice, maxPrice, acType, refrigeratorType, cubicFeet, coolingType, technology, color, capacity, weight, inStock, sortBy, page]);

  const getPrimaryImage = (images) => {
    try { return JSON.parse(images || "[]")[0] || null; } catch { return null; }
  };

  const markImageLoaded = (productId) => {
    setLoadedImages((prev) => (prev[productId] ? prev : { ...prev, [productId]: true }));
  };

  const calculateDiscount = (price, discountPrice) => {
    if (!discountPrice || Number(discountPrice) >= Number(price)) return 0;
    return Math.round(((Number(price) - Number(discountPrice)) / Number(price)) * 100);
  };

  const isNewProduct = (createdAt) => {
    if (!createdAt) return false;
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return new Date(createdAt) > sevenDaysAgo;
  };

  const clearAll = () => {
    setQuery(""); setCategoryId(""); setBrandId(""); setMinPrice(""); setMaxPrice("");
    setAcType(""); setRefrigeratorType(""); setCubicFeet(""); setCoolingType("");
    setTechnology(""); setColor(""); setCapacity(""); setWeight(""); setInStock(false);
    setSortBy("newest"); setPage(0);
  };

  const hasFilters = query || categoryId || brandId || minPrice || maxPrice || acType ||
    refrigeratorType || cubicFeet || coolingType || technology || color || capacity || weight || inStock;

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div className="container page">
      {/* Header + Sort Bar */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 className="section-title">Shop</h1>
        <div className="row-between" style={{ flexWrap: "wrap", gap: "1rem", marginTop: "0.5rem" }}>
          <p className="section-subtitle" style={{ margin: 0 }}>
            {loading ? "Loading..." : `Showing ${products.length} products (Page ${page + 1})`}
          </p>
          <div className="row" style={{ gap: "0.75rem", flexWrap: "wrap" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 600, fontSize: "0.9rem" }}>
              Sort by:
              <select
                className="select"
                style={{ minWidth: "180px" }}
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value); setPage(0); }}
              >
                <option value="newest">Newest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="name_asc">Name: A to Z</option>
                <option value="discount">Best Discount</option>
              </select>
            </label>
            {hasFilters && (
              <button className="btn btn-outline" style={{ fontSize: "0.85rem" }} onClick={clearAll}>
                ✕ Clear All Filters
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="shop-layout" style={{ display: "grid", gridTemplateColumns: "1fr 290px", gap: "2rem", alignItems: "start" }}>
        {/* Left: Products Grid */}
        <div className="shop-products">
          <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))" }}>
            {loading
              ? Array.from({ length: 8 }).map((_, idx) => (
                  <div className="card product-card product-skeleton" key={`skeleton-${idx}`}>
                    <div className="product-image skeleton-box" />
                    <div className="skeleton-line short" />
                    <div className="skeleton-line" />
                    <div className="skeleton-line medium" />
                    <div className="skeleton-btn" />
                  </div>
                ))
              : products.map((product, index) => {
                  const imageSrc = getPrimaryImage(product.images);
                  const imageLoaded = !imageSrc || Boolean(loadedImages[product.id]);
                  const relatedCategory = getRelatedRecord(product.categories);
                  const categoryName = getDisplayName(relatedCategory) || "Premium Appliance";
                  return (
                    <div
                      className="card product-card"
                      key={product.id}
                      style={{ "--stagger-row": Math.floor(index / 4), "--stagger-index": index % 4 }}
                    >
                      <div className="deal-badge">
                        {isNewProduct(product.created_at) && <span className="badge badge-new">New</span>}
                        {calculateDiscount(product.price, product.discount_price) > 0 && (
                          <span className="badge badge-sale">Save {calculateDiscount(product.price, product.discount_price)}%</span>
                        )}
                        {Number(product.stock) <= 0 && <span className="badge badge-sold-out">Sold Out</span>}
                        {Number(product.stock) > 0 && Number(product.stock) < 5 && <span className="badge badge-limited">Low Stock</span>}
                      </div>
                      <div className="product-image">
                        {!imageLoaded ? <span className="image-loading-shimmer" /> : null}
                        {imageSrc ? (
                          <img
                            src={imageSrc}
                            alt={product.name}
                            className={`product-image-tag ${imageLoaded ? "loaded" : ""}`}
                            loading="lazy"
                            decoding="async"
                            onLoad={() => markImageLoaded(product.id)}
                          />
                        ) : "Preview"}
                      </div>
                      <p className="pill">{categoryName}</p>
                      <h4>{product.name}</h4>
                      <div style={{ marginBottom: "0.8rem" }}>
                        {product.discount_price ? (
                          <div className="row" style={{ gap: "0.5rem" }}>
                            <span style={{ fontWeight: 700, fontSize: "1.1rem" }}>PKR {Number(product.discount_price).toLocaleString()}</span>
                            <span style={{ color: "var(--muted)", textDecoration: "line-through", fontSize: "0.9rem" }}>PKR {Number(product.price).toLocaleString()}</span>
                          </div>
                        ) : (
                          <span style={{ fontWeight: 700, fontSize: "1.1rem" }}>PKR {Number(product.price).toLocaleString()}</span>
                        )}
                      </div>
                      <div className="row card-actions">
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={() => {
                            addItem(product, 1);
                            setLastAddedId(product.id);
                            setToastMessage(`${product.name} added to cart`);
                          }}
                        >
                          {lastAddedId === product.id ? "Added ✓" : "Quick Add"}
                        </button>
                        <Link to={`/product/${product.id}`} className="btn btn-outline">View</Link>
                      </div>
                    </div>
                  );
                })}
          </div>

          {!loading && products.length === 0 && (
            <div className="empty-state card">
              <h3>No products match these filters</h3>
              <p>Try selecting different options or <button className="btn btn-outline" onClick={clearAll}>clearing filters</button>.</p>
            </div>
          )}

          {/* Pagination */}
          {!loading && (products.length > 0 || page > 0) && (
            <div className="row" style={{ justifyContent: "center", gap: "1rem", marginTop: "2.5rem", paddingBottom: "1rem" }}>
              <button
                className="btn btn-outline"
                disabled={page === 0}
                onClick={() => { setPage((p) => Math.max(0, p - 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              >
                ← Previous
              </button>
              <span style={{ display: "flex", alignItems: "center", fontWeight: 600, color: "var(--muted)" }}>
                Page {page + 1}
              </span>
              <button
                className="btn btn-primary"
                disabled={products.length < PAGE_SIZE}
                onClick={() => { setPage((p) => p + 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              >
                Next →
              </button>
            </div>
          )}
        </div>

        {/* Right: Filters Sidebar — scrollable */}
        <aside
          className="shop-filters card"
          style={{
            position: "sticky",
            top: "100px",
            padding: "1.5rem",
            maxHeight: "calc(100vh - 130px)",
            overflowY: "auto",
            overflowX: "hidden",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.2rem", borderBottom: "1px solid #eee", paddingBottom: "0.75rem" }}>
            <h3 style={{ margin: 0 }}>Filters</h3>
            {hasFilters && (
              <button onClick={clearAll} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--accent)", fontWeight: 600, fontSize: "0.85rem" }}>
                Clear All
              </button>
            )}
          </div>

          {/* Search */}
          <FilterGroup label="Keyword Search">
            <input className="input" placeholder="e.g. Inverter AC..." value={query} onChange={(e) => { setQuery(e.target.value); setPage(0); }} />
          </FilterGroup>

          {/* In Stock Toggle */}
          <FilterGroup label="Availability">
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
              <input type="checkbox" checked={inStock} onChange={(e) => { setInStock(e.target.checked); setPage(0); }} style={{ width: "1.1rem", height: "1.1rem" }} />
              <span>In Stock Only</span>
            </label>
          </FilterGroup>

          {/* Category */}
          <FilterGroup label="Category">
            <select className="select" value={categoryId} onChange={(e) => { setCategoryId(e.target.value); setPage(0); }}>
              <option value="">All Categories</option>
              {categories.map((c) => <option value={c.id} key={c.id}>{c.name}</option>)}
            </select>
          </FilterGroup>

          {/* Brand */}
          <FilterGroup label="Brand">
            <select className="select" value={brandId} onChange={(e) => { setBrandId(e.target.value); setPage(0); }}>
              <option value="">All Brands</option>
              {brands.map((b) => <option value={b.id} key={b.id}>{b.name}</option>)}
            </select>
          </FilterGroup>

          {/* Price Range */}
          <FilterGroup label="Price Range (PKR)">
            <div className="row" style={{ gap: "0.5rem" }}>
              <input className="input" type="number" placeholder="Min" value={minPrice} onChange={(e) => { setMinPrice(e.target.value); setPage(0); }} />
              <input className="input" type="number" placeholder="Max" value={maxPrice} onChange={(e) => { setMaxPrice(e.target.value); setPage(0); }} />
            </div>
          </FilterGroup>

          {/* AC Type */}
          <FilterGroup label="AC Type">
            <select className="select" value={acType} onChange={(e) => { setAcType(e.target.value); setPage(0); }}>
              <option value="">All Types</option>
              <option value="Ceiling Cassette">Ceiling Cassette</option>
              <option value="Floor Standing">Floor Standing</option>
              <option value="Wall Mounted Split Ac">Wall Mounted Split Ac</option>
            </select>
          </FilterGroup>

          {/* Refrigerator Type */}
          <FilterGroup label="Refrigerator Type">
            <select className="select" value={refrigeratorType} onChange={(e) => { setRefrigeratorType(e.target.value); setPage(0); }}>
              <option value="">All Types</option>
              <option value="Bedroom Size">Bedroom Size</option>
              <option value="Top Mount">Top Mount</option>
              <option value="Double Door">Double Door</option>
            </select>
          </FilterGroup>

          {/* Cubic Feet */}
          <FilterGroup label="Cubic Feet">
            <select className="select" value={cubicFeet} onChange={(e) => { setCubicFeet(e.target.value); setPage(0); }}>
              <option value="">All Sizes</option>
              {["4-CFT","6-CFT","7-CFT","8-CFT","9-CFT","11-CFT","11.5 CFT","12-CFT","13-CFT","14-CFT","14.5-CFT","15-CFT","15.5-CFT","16-CFT","18-CFT","20-CFT"].map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
          </FilterGroup>

          {/* Cooling Type */}
          <FilterGroup label="Cooling Type">
            <select className="select" value={coolingType} onChange={(e) => { setCoolingType(e.target.value); setPage(0); }}>
              <option value="">All</option>
              <option value="Cool Only">Cool Only</option>
              <option value="Heat And Cool">Heat And Cool</option>
            </select>
          </FilterGroup>

          {/* Technology */}
          <FilterGroup label="Technology">
            <select className="select" value={technology} onChange={(e) => { setTechnology(e.target.value); setPage(0); }}>
              <option value="">All</option>
              {["Electric","Electric + Gas","Fully Automatic","Gas Only","Instant","Inverter","Non Inverter"].map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
          </FilterGroup>

          {/* Color */}
          <FilterGroup label="Color">
            <select className="select" value={color} onChange={(e) => { setColor(e.target.value); setPage(0); }}>
              <option value="">All Colors</option>
              {["Beige","Black","CHAMPAGNE","Charcoal Grey","Glass","Golden","Grey","Maroon","Metallic Golden Brown","Mirror Glass","Purple Blaze","Red","Red Blaze","Silver","White"].map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
          </FilterGroup>

          {/* Capacity */}
          <FilterGroup label="Capacity">
            <select className="select" value={capacity} onChange={(e) => { setCapacity(e.target.value); setPage(0); }}>
              <option value="">All Capacities</option>
              {["1 Ton(12000BTU)","1.5 Ton(18000BTU)","2 Ton(24000 BTU)","3 Ton (36000BTU)","4 Ton(48000BTU)","4.9 Liters","5 Liters","6 Liters","8 Liters","8 Kgs","8 Gallon","9 Kgs","9 Liters","10 KH","10 Liters","12-Gallon","12 Liters","15 Gallon","16 KG","20 Liters","23 Liters","35-GLN","55-GLN","60 Liters","70 Liters","75 Liters"].map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
          </FilterGroup>

          {/* Weight */}
          <FilterGroup label="Weight">
            <select className="select" value={weight} onChange={(e) => { setWeight(e.target.value); setPage(0); }}>
              <option value="">All Weights</option>
              {["21 KG","25 KG","40 KG","50 KG","70 KG"].map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
          </FilterGroup>

          <button
            className="btn btn-outline"
            style={{ width: "100%", marginTop: "0.5rem" }}
            onClick={clearAll}
          >
            Clear All Filters
          </button>
        </aside>
      </div>

      <div className={`cart-toast ${toastMessage ? "show" : ""}`}>{toastMessage}</div>
    </div>
  );
}

// Helper component to keep filter groups DRY
function FilterGroup({ label, children }) {
  return (
    <div style={{ marginBottom: "1.25rem" }}>
      <p style={{ fontWeight: 700, fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--muted)", marginBottom: "0.4rem" }}>
        {label}
      </p>
      {children}
    </div>
  );
}
