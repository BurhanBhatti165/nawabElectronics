import { ShoppingBag, Users, DollarSign, Package } from 'lucide-react';

export default function AdminDashboard() {
  return (
    <div className="dashboard-content">
      <div className="section-header">
        <h1>Dashboard Overview</h1>
        <p>Welcome back, Admin. Here's what's happening today.</p>
      </div>

      <div className="dashboard-grid">
        <div className="card stat-card stat-primary">
          <div className="stat-icon" style={{ backgroundColor: '#e0e7ff', color: '#4338ca' }}>
            <DollarSign size={24} />
          </div>
          <div className="stat-info">
            <p className="label">Total Revenue</p>
            <p className="value">₨ 245,000</p>
          </div>
        </div>

        <div className="card stat-card stat-success">
          <div className="stat-icon" style={{ backgroundColor: '#dcfce7', color: '#15803d' }}>
            <ShoppingBag size={24} />
          </div>
          <div className="stat-info">
            <p className="label">Total Orders</p>
            <p className="value">124</p>
          </div>
        </div>

        <div className="card stat-card stat-warning">
          <div className="stat-icon" style={{ backgroundColor: '#fff7ed', color: '#9a3412' }}>
            <Package size={24} />
          </div>
          <div className="stat-info">
            <p className="label">Total Products</p>
            <p className="value">48</p>
          </div>
        </div>

        <div className="card stat-card stat-info">
          <div className="stat-icon" style={{ backgroundColor: '#e0f2fe', color: '#0369a1' }}>
            <Users size={24} />
          </div>
          <div className="stat-info">
            <p className="label">Customers</p>
            <p className="value">892</p>
          </div>
        </div>
      </div>

      <div className="recent-activity">
        <div className="card" style={{ padding: '1.5rem' }}>
          <div className="section-header">
            <h3>Recent Orders</h3>
            <button className="btn btn-outline" style={{ padding: '0.4rem 0.8rem' }}>View All</button>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>#ORD-7382</td>
                <td>Ali Ahmed</td>
                <td>₨ 148,000</td>
                <td><span className="status-badge status-completed">Delivered</span></td>
                <td><button className="btn btn-outline" style={{ padding: '0.2rem 0.5rem' }}>Details</button></td>
              </tr>
              <tr>
                <td>#ORD-7381</td>
                <td>Sarah Khan</td>
                <td>₨ 85,000</td>
                <td><span className="status-badge status-pending">Processing</span></td>
                <td><button className="btn btn-outline" style={{ padding: '0.2rem 0.5rem' }}>Details</button></td>
              </tr>
              <tr>
                <td>#ORD-7380</td>
                <td>Umar Malik</td>
                <td>₨ 166,000</td>
                <td><span className="status-badge status-pending">Pending</span></td>
                <td><button className="btn btn-outline" style={{ padding: '0.2rem 0.5rem' }}>Details</button></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="card" style={{ padding: '1.5rem' }}>
          <div className="section-header">
            <h3>Best Sellers</h3>
          </div>
          <div className="best-sellers-list">
            <div className="seller-item" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ width: '40px', height: '40px', background: '#f1f5f9', borderRadius: '8px' }}></div>
              <div>
                <p style={{ fontWeight: '600', fontSize: '0.875rem' }}>Gree Pular 1.5 Ton</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>24 units sold</p>
              </div>
            </div>
            <div className="seller-item" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ width: '40px', height: '40px', background: '#f1f5f9', borderRadius: '8px' }}></div>
              <div>
                <p style={{ fontWeight: '600', fontSize: '0.875rem' }}>Haier HRF-306</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>18 units sold</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
