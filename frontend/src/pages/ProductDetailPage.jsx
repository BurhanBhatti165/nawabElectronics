import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useCartStore } from "../store/useCartStore";
import { apiFetch } from "../lib/api";

const getRelatedRecord = (value) => (Array.isArray(value) ? value[0] : value);

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    apiFetch(`/api/products/${id}`).then(setProduct);
  }, [id]);

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

  useEffect(() => {
    setActiveImageIndex(0);
  }, [id]);

  const [activeTab, setActiveTab] = useState("description");

  if (!product) return <div className="container page"><p>Loading product...</p></div>;

  const imageList = (() => {
    try {
      const parsed = JSON.parse(product.images || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  })();
  const category = getRelatedRecord(product.categories);
  const brand = getRelatedRecord(product.brands);
  const activeImage = imageList[activeImageIndex] || imageList[0] || null;
  const canSlide = imageList.length > 1;

  const goPrev = () => {
    if (!canSlide) return;
    setActiveImageIndex((prev) => (prev - 1 + imageList.length) % imageList.length);
  };

  const goNext = () => {
    if (!canSlide) return;
    setActiveImageIndex((prev) => (prev + 1) % imageList.length);
  };

  return (
    <div className="container page">
      <div className="hero" style={{ alignItems: "start", gap: "4rem" }}>
        {/* Left Side: Info */}
        <div className="hero-copy" style={{ flex: 1 }}>
          <div className="row" style={{ gap: "0.5rem", marginBottom: "1rem" }}>
            <span className="pill">{category?.name || "Appliance"}</span>
            {brand?.name && <span className="pill" style={{ background: "var(--accent-light)", color: "var(--accent)" }}>{brand.name}</span>}
          </div>
          <h1 style={{ fontSize: "3.5rem", marginBottom: "0.5rem" }}>{product.name}</h1>
          {brand?.name && <p style={{ fontSize: "1.2rem", color: "var(--muted)", marginBottom: "1.5rem" }}>By {brand.name}</p>}
          
          <div className="row" style={{ marginBottom: "2rem", gap: "0.5rem" }}>
            {isNewProduct(product.created_at) && <span className="badge badge-new">New</span>}
            {calculateDiscount(product.price, product.discount_price) > 0 && (
              <span className="badge badge-sale">Save {calculateDiscount(product.price, product.discount_price)}%</span>
            )}
            {Number(product.stock) <= 0 && <span className="badge badge-sold-out">Sold Out</span>}
            {Number(product.stock) > 0 && Number(product.stock) < 5 && <span className="badge badge-limited">Low Stock</span>}
          </div>

          <div style={{ marginBottom: "2.5rem" }}>
            {product.discount_price ? (
              <div className="column" style={{ gap: "0.5rem" }}>
                <span style={{ color: "var(--muted)", textDecoration: "line-through", fontSize: "1.2rem" }}>PKR {Number(product.price).toLocaleString()}</span>
                <h3 style={{ fontFamily: "Fraunces, serif", fontSize: "3rem", margin: 0, color: "var(--accent)" }}>PKR {Number(product.discount_price).toLocaleString()}</h3>
              </div>
            ) : (
              <h3 style={{ fontFamily: "Fraunces, serif", fontSize: "3rem", margin: 0 }}>PKR {Number(product.price).toLocaleString()}</h3>
            )}
          </div>

          <div className="row">
            <button className="btn btn-primary" style={{ padding: "1.2rem 3rem", fontSize: "1.1rem" }} onClick={() => addItem(product, 1)}>
              Add to Cart
            </button>
          </div>
        </div>

        {/* Right Side: Gallery */}
        <aside className="hero-card product-gallery-card" style={{ flex: 1, maxWidth: "600px" }}>
          {activeImage ? (
            <>
              <div className="product-gallery-main">
                <img src={activeImage} alt={`${product.name} ${activeImageIndex + 1}`} className="product-gallery-main-image" />
                {canSlide ? (
                  <>
                    <button type="button" className="gallery-nav gallery-nav-prev" onClick={goPrev} aria-label="Previous image">‹</button>
                    <button type="button" className="gallery-nav gallery-nav-next" onClick={goNext} aria-label="Next image">›</button>
                  </>
                ) : null}
              </div>
              {canSlide ? (
                <div className="product-gallery-thumbs">
                  {imageList.map((img, index) => (
                    <button
                      type="button"
                      key={img}
                      className={`product-gallery-thumb ${activeImageIndex === index ? "active" : ""}`}
                      onClick={() => setActiveImageIndex(index)}
                      aria-label={`Show image ${index + 1}`}
                    >
                      <img src={img} alt={`${product.name} thumbnail ${index + 1}`} />
                    </button>
                  ))}
                </div>
              ) : null}
            </>
          ) : (
            <div className="empty-gallery" style={{ height: "400px", display: "flex", alignItems: "center", justifyContent: "center", background: "#f9f9f9", borderRadius: "12px" }}>
              <p style={{ color: "var(--muted)" }}>No product images available.</p>
            </div>
          )}
        </aside>
      </div>

      {/* Bottom: Tabs */}
      <div className="product-tabs" style={{ marginTop: "5rem", borderTop: "1px solid #eee", paddingTop: "3rem" }}>
        <div className="tabs-header" style={{ display: "flex", gap: "2rem", marginBottom: "2rem" }}>
          <button 
            className={`tab-btn ${activeTab === "description" ? "active" : ""}`} 
            onClick={() => setActiveTab("description")}
            style={{ 
              background: "none", border: "none", fontSize: "1.5rem", fontWeight: activeTab === "description" ? 700 : 400, 
              cursor: "pointer", borderBottom: activeTab === "description" ? "2px solid var(--primary)" : "none",
              paddingBottom: "0.5rem"
            }}
          >
            Description
          </button>
          <button 
            className={`tab-btn ${activeTab === "specifications" ? "active" : ""}`} 
            onClick={() => setActiveTab("specifications")}
            style={{ 
              background: "none", border: "none", fontSize: "1.5rem", fontWeight: activeTab === "specifications" ? 700 : 400, 
              cursor: "pointer", borderBottom: activeTab === "specifications" ? "2px solid var(--primary)" : "none",
              paddingBottom: "0.5rem"
            }}
          >
            Specifications
          </button>
        </div>
        <div className="tab-content" style={{ fontSize: "1.1rem", lineHeight: "1.8", color: "#444" }}>
          {activeTab === "description" ? (
            <div className="description-text">
              {product.description || "No description available."}
            </div>
          ) : (
            <div className="specifications-text">
              {product.specifications ? (
                <div style={{ whiteSpace: "pre-wrap" }}>{product.specifications}</div>
              ) : (
                <p>No specifications provided.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
