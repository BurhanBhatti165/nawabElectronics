'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, SlidersHorizontal, Grid, List, ChevronDown, Star, ShoppingBag, Filter } from 'lucide-react';

export default function ShopPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState(500000);

  useEffect(() => {
    // Parallel fetching for performance
    Promise.all([
      fetch('/api/products').then(res => res.json()),
      fetch('/api/categories').then(res => res.json()),
      fetch('/api/brands').then(res => res.json())
    ]).then(([prodData, catData, brandData]) => {
      setProducts(prodData);
      setCategories(catData);
      setBrands(brandData);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'all' || p.categoryId === selectedCategory;
    const matchesPrice = p.price <= priceRange;
    return matchesCategory && matchesPrice;
  });

  return (
    <div className="shop-page container animate-fade-in" style={{ padding: '60px 0' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '3rem' }}>
        
        {/* Sidebar Filters */}
        <aside className="shop-sidebar">
          <div style={{ marginBottom: '3rem' }}>
             <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', fontSize: '1.25rem' }}>
               <Filter size={20} /> Filters
             </h3>
             
             {/* Category Filter */}
             <div className="filter-group" style={{ marginBottom: '2.5rem' }}>
                <h4 style={{ fontSize: '1rem', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Categories</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                   <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem', cursor: 'pointer' }}>
                      <input type="radio" checked={selectedCategory === 'all'} onChange={() => setSelectedCategory('all')} name="cat" /> All Categories
                   </label>
                   {categories.map(cat => (
                     <label key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem', cursor: 'pointer' }}>
                        <input type="radio" checked={selectedCategory === cat.id} onChange={() => setSelectedCategory(cat.id)} name="cat" /> {cat.name}
                     </label>
                   ))}
                </div>
             </div>

             {/* Price Filter */}
             <div className="filter-group" style={{ marginBottom: '2.5rem' }}>
                <h4 style={{ fontSize: '1rem', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Price Range</h4>
                <input 
                  type="range" 
                  min="10000" 
                  max="500000" 
                  step="5000" 
                  value={priceRange}
                  onChange={(e) => setPriceRange(parseInt(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--primary)' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.75rem', fontSize: '0.875rem', fontWeight: '600' }}>
                   <span>₨ 10,000</span>
                   <span>₨ {priceRange.toLocaleString()}</span>
                </div>
             </div>

             {/* Brand Filter */}
             <div className="filter-group">
                <h4 style={{ fontSize: '1rem', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Brands</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                   {brands.map(brand => (
                     <label key={brand.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem', cursor: 'pointer' }}>
                        <input type="checkbox" /> {brand.name}
                     </label>
                   ))}
                </div>
             </div>
          </div>
          
          <div className="card" style={{ padding: '1.5rem', background: '#eff6ff', border: 'none' }}>
             <h5 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>Need Help?</h5>
             <p style={{ fontSize: '0.75rem', color: 'var(--secondary)', marginBottom: '1rem' }}>Our tech experts are ready to help you choose the best appliance.</p>
             <button className="btn btn-outline" style={{ width: '100%', fontSize: '0.75rem', padding: '0.5rem' }}>Chat With US</button>
          </div>
        </aside>

        {/* Product Grid Area */}
        <main className="shop-content">
          <div className="card" style={{ padding: '1rem 1.5rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             <p style={{ fontSize: '0.875rem', fontWeight: '500' }}>Showing {filteredProducts.length} products</p>
             <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                   <span style={{ color: 'var(--secondary)' }}>Sort By:</span>
                   <select style={{ border: 'none', fontWeight: '700', outline: 'none', background: 'transparent' }}>
                      <option>Latest</option>
                      <option>Price: Low to High</option>
                      <option>Price: High to Low</option>
                   </select>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', borderLeft: '1px solid var(--border)', paddingLeft: '1.5rem' }}>
                   <button className="btn btn-primary" style={{ padding: '0.4rem' }}><Grid size={18} /></button>
                   <button className="btn btn-outline" style={{ padding: '0.4rem' }}><List size={18} /></button>
                </div>
             </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
             {loading ? (
                <div style={{ gridColumn: 'span 3', padding: '100px', textAlign: 'center' }}>Loading products...</div>
             ) : filteredProducts.length === 0 ? (
                <div style={{ gridColumn: 'span 3', padding: '100px', textAlign: 'center' }}>No products found matching your filters.</div>
             ) : (
                filteredProducts.map((product) => (
                  <div className="card product-card" key={product.id} style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ height: '220px', background: '#f1f5f9', position: 'relative', overflow: 'hidden' }}>
                      {product.images && JSON.parse(product.images)[0] ? (
                        <img src={JSON.parse(product.images)[0]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1' }}>No Image</div>
                      )}
                    </div>
                    <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <p style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: '700', marginBottom: '0.25rem' }}>{product.category?.name}</p>
                      <Link href={`/product/${product.id}`} style={{ color: 'var(--foreground)', fontWeight: '700', fontSize: '1rem', marginBottom: '0.5rem', flex: 1 }}>
                         {product.name}
                      </Link>
                      <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1rem' }}>
                         {[1, 2, 3, 4, 5].map(s => <Star key={s} size={12} fill="#f59e0b" color="#f59e0b" />)}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                         <span style={{ fontSize: '1.125rem', fontWeight: '800', color: 'var(--foreground)' }}>₨ {product.price.toLocaleString()}</span>
                         <button className="btn btn-primary" style={{ padding: '0.5rem' }}><ShoppingBag size={18} /></button>
                      </div>
                    </div>
                  </div>
                ))
             )}
          </div>
        </main>

      </div>
    </div>
  );
}
