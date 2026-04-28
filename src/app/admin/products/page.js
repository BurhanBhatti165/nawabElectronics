'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search, Edit2, Trash2, Package, Image as ImageIcon } from 'lucide-react';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        const response = await fetch(`/api/products/${id}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          setProducts(products.filter(p => p.id !== id));
        } else {
          const error = await response.json();
          alert('Error: ' + error.error);
        }
      } catch (err) {
        console.error(err);
        alert('Failed to delete product');
      }
    }
  };

  return (
    <div className="products-page animate-fade-in">
      <div className="section-header">
        <div>
          <h1>Products</h1>
          <p>Manage your inventory, prices, and product details.</p>
        </div>
        <Link href="/admin/products/add" className="btn btn-primary">
          <Plus size={18} />
          Add Product
        </Link>
      </div>

      <div className="card" style={{ padding: '0' }}>
        <div className="table-controls" style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="header-search">
            <input type="text" placeholder="Search products by name, SKU, or category..." style={{ width: '400px' }} />
          </div>
          <div className="filters" style={{ display: 'flex', gap: '1rem' }}>
             <select className="btn btn-outline" style={{ padding: '0.5rem' }}>
               <option>All Categories</option>
             </select>
             <select className="btn btn-outline" style={{ padding: '0.5rem' }}>
               <option>All Brands</option>
             </select>
          </div>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Product Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '3rem' }}>Loading products...</td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '3rem' }}>No products found.</td></tr>
            ) : (
              products.map((product) => (
                <tr key={product.id}>
                  <td>
                    <div style={{ width: '48px', height: '48px', backgroundColor: '#f1f5f9', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyCenter: 'center', overflow: 'hidden' }}>
                      {product.images && JSON.parse(product.images)[0] ? (
                        <img src={JSON.parse(product.images)[0]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <ImageIcon size={20} color="#94a3b8" />
                      )}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: '600' }}>{product.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>Slug: {product.slug}</div>
                  </td>
                  <td>{product.category?.name}</td>
                  <td>
                    {product.discountPrice ? (
                      <div>
                        <span style={{ fontWeight: '700', color: 'var(--primary)' }}>₨ {product.price.toLocaleString()}</span>
                        <div style={{ fontSize: '0.75rem', textDecoration: 'line-through', color: 'var(--muted-foreground)' }}>₨ {product.discountPrice.toLocaleString()}</div>
                      </div>
                    ) : (
                      <span style={{ fontWeight: '700' }}>₨ {product.price.toLocaleString()}</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Package size={14} color="#64748b" />
                      <span style={{ fontWeight: '500', color: product.stock < 5 ? '#ef4444' : 'inherit' }}>{product.stock}</span>
                    </div>
                  </td>
                  <td>
                    {product.stock > 0 ? 
                      <span className="status-badge" style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}>In Stock</span> : 
                      <span className="status-badge" style={{ backgroundColor: '#fee2e2', color: '#ef4444' }}>Out of Stock</span>
                    }
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button className="btn btn-outline" style={{ padding: '0.4rem' }}>
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(product.id)} className="btn btn-outline" style={{ padding: '0.4rem', color: '#ef4444' }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
