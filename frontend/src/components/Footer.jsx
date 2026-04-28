import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../lib/api";

const getDisplayName = (record) =>
  record?.name || record?.title || record?.category_name || record?.brand_name || "";

export default function Footer() {
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  useEffect(() => {
    Promise.all([apiFetch("/api/categories"), apiFetch("/api/brands")]).then(([categoryData, brandData]) => {
      const normalizedCategories = (categoryData || [])
        .map((category) => ({ id: category.id, name: getDisplayName(category) }))
        .filter((category) => category.id && category.name);
      const normalizedBrands = (brandData || [])
        .map((brand) => ({ id: brand.id, name: getDisplayName(brand) }))
        .filter((brand) => brand.id && brand.name);
      setCategories(normalizedCategories.slice(0, 5)); // Limit to top 5
      setBrands(normalizedBrands.slice(0, 5)); // Limit to top 5
    }).catch(console.error);
  }, []);
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-col brand-col">
          <div className="logo">
            <span className="logo-nawab">NAWAB</span>
            <span className="logo-electronics">ELECTRONICS</span>
          </div>
          <p className="footer-desc">
            Elevating your home with premium appliances. We bring the world's best technology to your doorstep.
          </p>
        </div>
        
        <div className="footer-col">
          <h4>Categories</h4>
          <ul>
            {categories.map(c => (
              <li key={c.id}><Link to={`/shop?category_id=${c.id}`}>{c.name}</Link></li>
            ))}
            <li><Link to="/shop" style={{color: '#fff'}}>View All Categories &rarr;</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Brands</h4>
          <ul>
            {brands.map(b => (
              <li key={b.id}><Link to={`/shop?brand_id=${b.id}`}>{b.name}</Link></li>
            ))}
            <li><Link to="/shop" style={{color: '#fff'}}>View All Brands &rarr;</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Support</h4>
          <ul>
            <li><Link to="/support#track-order">Track Order</Link></li>
            <li><Link to="/support#returns">Returns & Exchanges</Link></li>
            <li><Link to="/support#shipping">Shipping Policy</Link></li>
            <li><Link to="/support#warranty">Warranty Info</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Contact Us</h4>
          <ul>
            <li>111 Main Street, Lahore</li>
            <li>info@nawab.com.pk</li>
            <li>+92 300 1234567</li>
            <li>Mon-Sat: 9AM - 8PM</li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom container">
        <p>© {new Date().getFullYear()} Nawab Electronics. All rights reserved.</p>
        <div className="footer-legal">
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
        </div>
      </div>
    </footer>
  );
}
