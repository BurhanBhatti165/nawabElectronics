import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { ShoppingCart, ChevronDown } from "lucide-react";
import { useCartStore } from "../store/useCartStore";
import { useAuthStore } from "../store/useAuthStore";
import { apiFetch } from "../lib/api";

const getDisplayName = (record) =>
  record?.name || record?.title || record?.category_name || record?.brand_name || "";

export default function Navbar() {
  const total = useCartStore((s) => s.getTotalItems());
  const { role, isAuthenticated, logout } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const navigate = useNavigate();

  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    Promise.all([apiFetch("/api/categories"), apiFetch("/api/brands")]).then(([categoryData, brandData]) => {
      const normalizedCategories = (categoryData || [])
        .map((category) => ({ id: category.id, name: getDisplayName(category) }))
        .filter((category) => category.id && category.name);
      const normalizedBrands = (brandData || [])
        .map((brand) => ({ id: brand.id, name: getDisplayName(brand) }))
        .filter((brand) => brand.id && brand.name);
      setCategories(normalizedCategories);
      setBrands(normalizedBrands);
    }).catch(console.error);
  }, []);

  return (
    <header className="site-header">
      <div className="top-promo-strip">
        <div className="marquee-container">
          <div className="marquee-content">
            <span className="marquee-item">🚀 Mega Electronics Sale is live!</span>
            <span className="marquee-item">✨ Premium Quality Appliances</span>
            <span className="marquee-item">🚚 Free Delivery on orders over Rs. 10,000</span>
            <span className="marquee-item">📞 +92 321-4255055</span>
            {/* Duplicated for seamless scrolling */}
            <span className="marquee-item">🚀 Mega Electronics Sale is live!</span>
            <span className="marquee-item">✨ Premium Quality Appliances</span>
            <span className="marquee-item">🚚 Free Delivery on orders over Rs. 10,000</span>
            <span className="marquee-item">📞 +92 321-4255055</span>
          </div>
        </div>
      </div>
      <div className="main-navbar">
        <div className="container nav-row">
          <Link to="/" className="logo" onClick={closeMenu}>
            <span className="logo-nawab">NAWAB</span>
            <span className="logo-electronics">ELECTRONICS</span>
          </Link>
          <button
            type="button"
            className="nav-toggle"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Toggle navigation"
            aria-expanded={menuOpen}
          >
            {menuOpen ? "Close" : "Menu"}
          </button>
          <nav className={`nav-links ${menuOpen ? "open" : ""}`}>
            <NavLink to="/" onClick={closeMenu}>Home</NavLink>
            <NavLink to="/shop" onClick={closeMenu}>All Products</NavLink>

            <div className="nav-dropdown">
              <button className="nav-dropdown-btn">
                Categories <ChevronDown size={14} />
              </button>
              <div className="nav-dropdown-content">
                {categories.map(c => (
                  <button
                    key={c.id}
                    onClick={() => {
                      navigate(`/shop?category_id=${c.id}`);
                      closeMenu();
                    }}
                    className="nav-dropdown-item"
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="nav-dropdown">
              <button className="nav-dropdown-btn">
                Brands <ChevronDown size={14} />
              </button>
              <div className="nav-dropdown-content">
                {brands.map(b => (
                  <button
                    key={b.id}
                    onClick={() => {
                      navigate(`/shop?brand_id=${b.id}`);
                      closeMenu();
                    }}
                    className="nav-dropdown-item"
                  >
                    {b.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="nav-dropdown">
              <button className="nav-dropdown-btn">
                Support <ChevronDown size={14} />
              </button>
              <div className="nav-dropdown-content">
                <button className="nav-dropdown-item" onClick={() => { navigate("/support#support"); closeMenu(); }}>Support</button>
                <button className="nav-dropdown-item" onClick={() => { navigate("/support#track-order"); closeMenu(); }}>Track Order</button>
                <button className="nav-dropdown-item" onClick={() => { navigate("/support#returns"); closeMenu(); }}>Returns & Exchanges</button>
                <button className="nav-dropdown-item" onClick={() => { navigate("/support#shipping"); closeMenu(); }}>Shipping Policy</button>
                <button className="nav-dropdown-item" onClick={() => { navigate("/support#warranty"); closeMenu(); }}>Warranty Info</button>
              </div>
            </div>

            {isAuthenticated ? (
              <div className="nav-dropdown">
                <button className="nav-dropdown-btn" style={{ fontWeight: 700 }}>
                  Account <ChevronDown size={14} />
                </button>
                <div className="nav-dropdown-content">
                  {role === "admin" && <button className="nav-dropdown-item" onClick={() => { navigate("/admin"); closeMenu(); }}>Admin Panel</button>}
                  {(role === "manager" || role === "admin") && (
                    <>
                      <button className="nav-dropdown-item" onClick={() => { navigate("/manager"); closeMenu(); }}>Manager Panel</button>
                      <button className="nav-dropdown-item" onClick={() => { navigate("/admin/orders"); closeMenu(); }}>Order Management</button>
                    </>
                  )}
                  <button className="nav-dropdown-item" onClick={() => { logout(); navigate("/"); closeMenu(); }} style={{ color: "var(--danger)" }}>Logout</button>
                </div>
              </div>
            ) : (
              <>
                <NavLink to="/login" onClick={closeMenu}>Sign In</NavLink>
                <NavLink to="/register" onClick={closeMenu} style={{ background: "var(--accent-soft)", padding: "0.55rem 1rem", borderRadius: "999px" }}>Join</NavLink>
              </>
            )}

            <NavLink to="/cart" className="cart-link" onClick={closeMenu}>
              <ShoppingCart size={18} /> Cart {total > 0 ? `(${total})` : ""}
            </NavLink>
          </nav>
        </div>
      </div>
    </header>
  );
}
