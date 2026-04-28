import './admin.css';
import Link from 'next/link';
import { LayoutDashboard, Box, Tags, ShoppingCart, Users, Settings, LogOut } from 'lucide-react';

export default function AdminLayout({ children }) {
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <div className="brand">
            <span className="brand-icon">⚡</span>
            <h2>Nawab Electronics</h2>
          </div>
          <p className="admin-tag">Admin Panel</p>
        </div>
        
        <nav className="sidebar-nav">
          <Link href="/admin" className="nav-item active">
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </Link>
          <Link href="/admin/products" className="nav-item">
            <Box size={20} />
            <span>Products</span>
          </Link>
          <Link href="/admin/categories" className="nav-item">
            <Tags size={20} />
            <span>Categories</span>
          </Link>
          <Link href="/admin/orders" className="nav-item">
            <ShoppingCart size={20} />
            <span>Orders</span>
          </Link>
          <Link href="/admin/users" className="nav-item">
            <Users size={20} />
            <span>Customers</span>
          </Link>
        </nav>

        <div className="sidebar-footer">
          <Link href="/admin/settings" className="nav-item">
            <Settings size={20} />
            <span>Settings</span>
          </Link>
          <button className="nav-item logout-btn">
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <div className="header-search">
            <input type="text" placeholder="Search for anything..." />
          </div>
          <div className="header-actions">
            <div className="admin-profile">
              <div className="profile-info">
                <p className="name">Admin User</p>
                <p className="role">Super Administrator</p>
              </div>
              <div className="avatar">A</div>
            </div>
          </div>
        </header>

        <section className="admin-content">
          {children}
        </section>
      </main>
    </div>
  );
}
