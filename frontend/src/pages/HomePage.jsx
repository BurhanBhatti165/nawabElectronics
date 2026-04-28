import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { useCartStore } from "../store/useCartStore";

export default function HomePage() {
  const findMoreBrandsLabel = "Find more brands";
  const navigate = useNavigate();
  const addItem = useCartStore((s) => s.addItem);
  const [banners, setBanners] = useState([]);
  const [activeBanner, setActiveBanner] = useState(0);
  const [selectedBrand, setSelectedBrand] = useState(findMoreBrandsLabel);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [products, setProducts] = useState([]);
  const [catalogCategories, setCatalogCategories] = useState([]);
  const [catalogBrands, setCatalogBrands] = useState([]);
  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [lastAddedId, setLastAddedId] = useState(null);
  const [toastMessage, setToastMessage] = useState("");
  const [loadedImages, setLoadedImages] = useState({});
  const [showSuggestions, setShowSuggestions] = useState(false);
  const categoryScrollerRef = useRef(null);
  const searchContainerRef = useRef(null);

  const searchSuggestions = useMemo(() => {
    if (!searchTerm.trim()) return [];
    return products
      .filter((p) => {
        const matchesTerm = p.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategoryId
          ? String(p.category_id ?? p.categories?.id ?? "") === String(selectedCategoryId)
          : true;
        return matchesTerm && matchesCategory;
      })
      .slice(0, 6); // show up to 6 matches
  }, [searchTerm, products, selectedCategoryId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (banners.length === 0) return;
    const timer = setInterval(() => {
      setActiveBanner((prev) => (prev + 1) % banners.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [banners.length]);

  useEffect(() => {
    Promise.all([apiFetch("/api/categories"), apiFetch("/api/brands"), apiFetch("/api/products"), apiFetch("/api/banners").catch(() => [])])
      .then(([categoryData, brandData, productData, bannerData]) => {
        setCatalogCategories(categoryData || []);
        setCatalogBrands(brandData || []);
        setProducts(productData || []);
        setBanners(bannerData || []);
      })
      .finally(() => setLoadingCatalog(false));
  }, []);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(""), 1800);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  const brandOptions = useMemo(() => {
    return (catalogBrands || [])
      .filter((brand) => brand?.id && brand?.name)
      .map((brand) => ({ id: brand.id, name: brand.name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [catalogBrands]);

  const homeCategoryItems = useMemo(() => catalogCategories.slice(0, 8), [catalogCategories]);

  const homeBrandItems = useMemo(() => brandOptions.slice(0, 8), [brandOptions]);

  const filteredProducts = useMemo(() => {
    if (selectedBrand === findMoreBrandsLabel) return products;
    return products.filter((product) => product?.brands?.name === selectedBrand);
  }, [products, selectedBrand, findMoreBrandsLabel]);

  const goToShop = ({ term, categoryId, brand } = {}) => {
    const params = new URLSearchParams();
    if (term?.trim()) params.set("search", term.trim());
    if (categoryId) params.set("category_id", categoryId);
    if (brand && brand !== findMoreBrandsLabel) {
      const selected = brandOptions.find((option) => option.name === brand);
      if (selected) params.set("brand_id", selected.id);
    }
    navigate(`/shop${params.toString() ? `?${params.toString()}` : ""}`);
  };

  const productsByCategory = useMemo(
    () =>
      catalogCategories
        .map((category) => {
          const matchedProducts = filteredProducts.filter((product) => {
            const productCategoryId = String(product.category_id ?? product.categories?.id ?? "");
            return productCategoryId === String(category.id) && product.is_featured === true;
          });
          return {
            id: category.id,
            name: category.name,
            products: matchedProducts.slice(0, 8),
          };
        })
        .filter((item) => item.products.length > 0),
    [catalogCategories, filteredProducts]
  );

  const topCategories = useMemo(
    () =>
      catalogCategories
        .filter((category) => Boolean(category.show_on_home))
        .map((category) => ({
          id: category.id,
          name: category.name,
          description: category.home_description || category.description || "Explore products in this category.",
        })),
    [catalogCategories]
  );

  const scrollCategories = (direction) => {
    if (!categoryScrollerRef.current) return;
    const amount = Math.max(280, Math.floor(categoryScrollerRef.current.clientWidth * 0.7));
    categoryScrollerRef.current.scrollBy({ left: direction * amount, behavior: "smooth" });
  };

  const getPrimaryImage = (images) => {
    try {
      const parsed = JSON.parse(images || "[]");
      return parsed[0] || null;
    } catch {
      return null;
    }
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

  return (
    <div className="container page">
      <section className="store-search-row card">
        <div className="store-search" ref={searchContainerRef}>
          <div className="search-input-wrapper">
            <input
              className="input"
              placeholder="Search for products (e.g. Haier AC)"
              value={searchTerm}
              onFocus={() => setShowSuggestions(true)}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowSuggestions(true);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setShowSuggestions(false);
                  goToShop({ term: searchTerm, categoryId: selectedCategoryId });
                }
              }}
            />
            {showSuggestions && searchSuggestions.length > 0 && (
              <div className="search-suggestions">
                {searchSuggestions.map((product) => {
                  const imageSrc = getPrimaryImage(product.images);
                  return (
                    <div
                      key={product.id}
                      className="search-suggestion-item"
                      onClick={() => {
                        setSearchTerm(product.name);
                        setShowSuggestions(false);
                        navigate(`/product/${product.id}`);
                      }}
                    >
                      <img
                        src={imageSrc || "https://via.placeholder.com/40"}
                        alt={product.name}
                        className="search-suggestion-image"
                      />
                      <div className="search-suggestion-info">
                        <span className="search-suggestion-name">{product.name}</span>
                        <span className="search-suggestion-price">PKR {Number(product.price).toLocaleString()}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <select className="select category-select" value={selectedCategoryId} onChange={(e) => setSelectedCategoryId(e.target.value)}>
            <option value="">Find more products</option>
            {catalogCategories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
          <button
            type="button"
            className="btn btn-primary search-btn"
            onClick={() => {
              setShowSuggestions(false);
              goToShop({ term: searchTerm, categoryId: selectedCategoryId });
            }}
          >
            Search
          </button>
        </div>
      </section>
      <section className="brand-search card">
        <div className="row-between">
          <p className="brand-search-title">Search by Category</p>
          <div className="row brand-search-controls">
            <select
              className="select brand-select"
              value={selectedCategoryId}
              onChange={(e) => {
                const value = e.target.value;
                setSelectedCategoryId(value);
                if (value) goToShop({ categoryId: value });
              }}
            >
              <option value="">Find more categories</option>
              {catalogCategories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
            <button type="button" className="btn btn-primary brand-search-btn" onClick={() => goToShop({ categoryId: selectedCategoryId })}>Search</button>
          </div>
        </div>
        <div className="brand-pills">
          {homeCategoryItems.map((category) => (
            <Link to={`/shop?category_id=${category.id}`} key={category.id} className="category-ribbon-item">
              {category.name}
            </Link>
          ))}
        </div>
      </section>

      <section className="brand-search card">
        <div className="row-between">
          <p className="brand-search-title">Search by Brand</p>
          <div className="row brand-search-controls">
            <select
              className="select brand-select"
              value={selectedBrand}
              onChange={(e) => {
                const value = e.target.value;
                setSelectedBrand(value);
                goToShop({ brand: value });
              }}
            >
              <option value={findMoreBrandsLabel}>{findMoreBrandsLabel}</option>
              {brandOptions.map((brand) => (
                <option key={brand.id} value={brand.name}>{brand.name}</option>
              ))}
            </select>
            <button type="button" className="btn btn-primary brand-search-btn" onClick={() => goToShop({ brand: selectedBrand })}>Search</button>
          </div>
        </div>
        <div className="brand-pills">
          {homeBrandItems.map((brand) => (
            <button
              key={brand.id}
              type="button"
              className={`brand-pill ${selectedBrand === brand.name ? "active" : ""}`}
              onClick={() => {
                setSelectedBrand(brand.name);
                goToShop({ brand: brand.name });
              }}
            >
              {brand.name}
            </button>
          ))}
        </div>
      </section>

      <section className="promo-carousel card">
        <div className="promo-media-wrap">
          {banners.map((banner, index) => (
            <article
              key={banner.id || index}
              className={`promo-slide ${index === activeBanner ? "active" : ""}`}
              style={{ backgroundImage: `url(${banner.image})`, cursor: banner.link_url ? "pointer" : "default" }}
              onClick={() => {
                if (banner.link_url) {
                  if (banner.link_url.startsWith("http")) window.open(banner.link_url, "_blank");
                  else navigate(banner.link_url);
                }
              }}
            >
            </article>
          ))}
          <div className="promo-controls">
            <button type="button" className="carousel-arrow" onClick={() => setActiveBanner((prev) => (prev - 1 + banners.length) % banners.length)} aria-label="Previous banner">‹</button>
            <button type="button" className="carousel-arrow" onClick={() => setActiveBanner((prev) => (prev + 1) % banners.length)} aria-label="Next banner">›</button>
          </div>
          <div className="slider-dots">
            {banners.map((banner, index) => (
              <button
                key={banner.id || index}
                type="button"
                className={`slider-dot ${index === activeBanner ? "active" : ""}`}
                onClick={() => setActiveBanner(index)}
                aria-label={`Show banner ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      <section style={{ marginTop: "1.2rem" }}>
        <div className="row-between">
          <div>
            <h2 className="section-title" style={{ marginBottom: "0.2rem" }}>Top Categories</h2>

          </div>
          <div className="row">
            <button type="button" className="btn btn-outline" onClick={() => scrollCategories(-1)}>Previous</button>
            <button type="button" className="btn btn-primary" onClick={() => scrollCategories(1)}>Next</button>
          </div>
        </div>

        <div className="category-scroll" ref={categoryScrollerRef}>
          {topCategories.map((item) => {
            const categoryLink = `/shop?category_id=${item.id}`;
            return (
              <article key={item.id} className="card category-slide">
                <span className="pill">Category</span>
                <h3>{item.name}</h3>
                <p style={{ color: "var(--muted)" }}>{item.description}</p>
                <Link to={categoryLink} className="btn btn-outline">View Products</Link>
              </article>
            )
          })}
        </div>
        {!loadingCatalog && topCategories.length === 0 ? (
          <div className="empty-state card" style={{ marginTop: "0.8rem" }}>
            <h3>No top categories configured</h3>
            <p>Managers can enable "Show on home" from category management.</p>
          </div>
        ) : null}
      </section>

      <section style={{ marginTop: "1.2rem" }}>
        <div className="row-between" style={{ marginBottom: "0.7rem" }}>
          <div>
            <h2 className="section-title" style={{ marginBottom: "0.2rem" }}>Shop by Category</h2>
            <p className="section-subtitle" style={{ marginBottom: 0 }}>
              Featured products grouped by category.
            </p>
          </div>
        </div>

        {loadingCatalog ? <p className="section-subtitle">Loading category products...</p> : null}
        {loadingCatalog ? (
          <div className="grid">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div className="card product-card product-skeleton" key={`home-skeleton-${idx}`}>
                <div className="product-image skeleton-box" />
                <div className="skeleton-line short" />
                <div className="skeleton-line" />
                <div className="skeleton-line medium" />
                <div className="skeleton-btn" />
              </div>
            ))}
          </div>
        ) : null}

        {!loadingCatalog && productsByCategory.length === 0 ? (
          <div className="empty-state card">
            <h3>No category products available yet</h3>
            <p>Products will appear here as soon as inventory is added.</p>
          </div>
        ) : null}

        {productsByCategory.map((group) => (
          <div key={group.id} style={{ marginBottom: "1.4rem" }}>
            <div className="row-between" style={{ marginBottom: "0.7rem" }}>
              <h3 style={{ margin: 0 }}>{group.name}</h3>
              <Link to={`/shop?category_id=${group.id}`} className="btn btn-outline">View All</Link>
            </div>
            <div className="grid">
              {group.products.map((product, index) => {
                const imageSrc = getPrimaryImage(product.images);
                const imageLoaded = !imageSrc || Boolean(loadedImages[product.id]);
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
                      ) : (
                        "Preview"
                      )}
                    </div>
                    <p className="pill">{group.name}</p>
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
                        {lastAddedId === product.id ? "Added" : "Quick Add"}
                      </button>
                      <Link to={`/product/${product.id}`} className="btn btn-outline">View</Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </section>
      <div className={`cart-toast ${toastMessage ? "show" : ""}`}>{toastMessage}</div>
    </div>
  );
}
