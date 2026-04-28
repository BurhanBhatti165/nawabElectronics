import { useEffect, useState } from "react";
import { apiFetch } from "../../lib/api";
import { User, MapPin, Phone, Calendar, ShoppingBag, CreditCard } from "lucide-react";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  useEffect(() => {
    apiFetch("/api/orders")
      .then((data) => {
        setOrders(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const filteredOrders = orders.filter((order) => {
    const search = searchTerm.toLowerCase();
    return (
      order.id.toLowerCase().includes(search) ||
      order.customer_email?.toLowerCase().includes(search) ||
      order.customer_phone?.toLowerCase().includes(search) ||
      order.customer_name?.toLowerCase().includes(search)
    );
  });

  const updateOrderStatus = async (orderId, updates) => {
    try {
      await apiFetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        body: JSON.stringify(updates),
      });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...updates } : o));
      setMessage({ type: "success", text: "Order updated successfully!" });
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Failed to update order." });
    }
  };

  if (loading) return <div className="container page">Loading orders...</div>;

  return (
    <div className="container page">
      {message && (
        <div className={`toast ${message.type}`}>
          {message.text}
        </div>
      )}
      <div className="admin-header">
        <div>
          <h1 className="section-title">Order Management</h1>
          <p className="section-subtitle">Detailed overview of all customer orders, status, and shipping information.</p>
        </div>
        <div className="search-box">
          <input 
            type="text" 
            placeholder="Search by ID, Email, or Phone..." 
            className="input search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="orders-list">
        {filteredOrders.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "4rem" }}>
            <ShoppingBag size={48} style={{ color: "var(--muted)", marginBottom: "1rem" }} />
            <h3>No orders found</h3>
            <p>{searchTerm ? "No orders match your search criteria." : "Orders will appear here once customers start purchasing."}</p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div key={order.id} className="card order-detail-card">
              <div className="order-header">
                <div className="order-id-block">
                  <span className="order-label">Order ID</span>
                  <span className="order-id">#{order.id.split("-")[0].toUpperCase()}</span>
                </div>
                <div className="order-actions">
                  <select 
                    className="select status-select" 
                    value={order.status || "pending"} 
                    onChange={(e) => updateOrderStatus(order.id, { status: e.target.value })}
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <div className={`badge status-${order.status || "pending"}`}>
                    {order.status || "Pending"}
                  </div>
                </div>
              </div>

              <div className="order-grid">
                <div className="order-info-section">
                  <div className="info-group">
                    <User size={18} />
                    <div>
                      <strong>Customer</strong>
                      <p>{order.customer_name}</p>
                      <p className="small-text">{order.customer_email}</p>
                    </div>
                  </div>
                  <div className="info-group">
                    <Phone size={18} />
                    <div>
                      <strong>Contact</strong>
                      <p>{order.customer_phone}</p>
                    </div>
                  </div>
                  <div className="info-group">
                    <Calendar size={18} />
                    <div>
                      <strong>Date & Time</strong>
                      <p>{new Date(order.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div className="order-info-section">
                  <div className="info-group">
                    <MapPin size={18} />
                    <div>
                      <strong>Shipping Address</strong>
                      <p>{order.shipping_address}</p>
                      <p>{order.city}</p>
                    </div>
                  </div>
                  <div className="info-group">
                    <CreditCard size={18} />
                    <div>
                      <strong>Payment</strong>
                      <p>{order.payment_method?.toUpperCase()}</p>
                      <select 
                        className="select payment-select" 
                        value={order.payment_status || "unpaid"} 
                        onChange={(e) => updateOrderStatus(order.id, { payment_status: e.target.value })}
                      >
                        <option value="unpaid">Unpaid</option>
                        <option value="paid">Paid</option>
                        <option value="refunded">Refunded</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="order-items-section">
                  <strong>Items Ordered</strong>
                  <div className="items-list">
                    {order.order_items?.map((item) => (
                      <div key={item.id} className="order-item-row">
                        <span className="item-qty">{item.quantity}x</span>
                        <div className="item-details">
                          <span className="item-name">{item.products?.name || `Product #${item.product_id.split("-")[0]}`}</span>
                          <div className="item-pricing">
                            {item.products?.price && Number(item.products.price) > Number(item.price) && (
                              <span className="original-price">PKR {Number(item.products.price).toLocaleString()}</span>
                            )}
                            <span className="item-price">PKR {Number(item.price).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="order-total-row">
                    <span>Total Amount</span>
                    <span className="total-price">PKR {Number(order.total_amount).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <style>{`
        .toast {
          position: fixed;
          top: 2rem;
          right: 2rem;
          padding: 1rem 2rem;
          border-radius: 12px;
          color: #fff;
          font-weight: 600;
          z-index: 1000;
          animation: slideIn 0.3s ease;
          box-shadow: 0 10px 20px rgba(0,0,0,0.1);
        }
        .toast.success { background: #10b981; }
        .toast.error { background: #ef4444; }
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .admin-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 2rem;
          gap: 2rem;
        }
        .search-box {
          flex: 1;
          max-width: 400px;
        }
        .search-input {
          width: 100%;
          background: var(--bg-soft);
          border-color: var(--line);
        }
        .orders-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          margin-top: 2rem;
        }
        .order-detail-card {
          padding: 2rem;
          border-radius: 16px;
        }
        .order-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--line);
        }
        .order-label {
          display: block;
          font-size: 0.75rem;
          color: var(--muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .order-id {
          font-size: 1.25rem;
          font-weight: 800;
          color: var(--accent);
        }
        .order-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1.2fr;
          gap: 2rem;
        }
        .info-group {
          display: flex;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        .info-group svg {
          color: var(--muted);
          margin-top: 3px;
        }
        .info-group p {
          margin: 0;
          color: var(--text);
          font-weight: 500;
        }
        .small-text {
          font-size: 0.85rem;
          color: var(--muted) !important;
        }
        .payment-status {
          font-size: 0.85rem;
          font-weight: 700;
          text-transform: uppercase;
        }
        .payment-status.paid { color: #10b981; }
        .payment-status.unpaid { color: #f59e0b; }
        
        .order-items-section {
          background: var(--bg-soft);
          padding: 1.5rem;
          border-radius: 12px;
        }
        .items-list {
          margin: 1rem 0;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .order-item-row {
          display: flex;
          justify-content: flex-start;
          align-items: flex-start;
          gap: 1rem;
          font-size: 0.9rem;
          padding-bottom: 0.75rem;
          margin-bottom: 0.75rem;
          border-bottom: 1px dashed var(--line);
        }
        .item-qty { font-weight: 700; color: var(--accent); min-width: 25px; }
        .item-details { flex: 1; display: flex; justify-content: space-between; align-items: center; gap: 1rem; }
        .item-name { color: var(--text); font-weight: 500; }
        .item-pricing { display: flex; flex-direction: column; align-items: flex-end; }
        .original-price { 
          font-size: 0.75rem; 
          color: var(--muted); 
          text-decoration: line-through;
          margin-bottom: 2px;
        }
        .item-price { font-weight: 700; color: var(--accent); }
        .order-total-row {
          display: flex;
          justify-content: space-between;
          margin-top: 1rem;
          font-weight: 800;
          font-size: 1.1rem;
        }
        .total-price { color: var(--accent); }

        .badge.status-pending { background: #fef3c7; color: #92400e; }
        .badge.status-shipped { background: #dcfce7; color: #166534; }
        
        .order-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .status-select, .payment-select {
          padding: 0.4rem 0.8rem;
          font-size: 0.85rem;
          width: auto;
          border-radius: 8px;
        }
        .status-select {
          background: var(--bg-soft);
          border-color: var(--line);
        }
        .payment-select {
          margin-top: 0.5rem;
        }
        
        .badge.status-processing { background: #dbeafe; color: #1e40af; }
        .badge.status-delivered { background: #dcfce7; color: #166534; }
        .badge.status-cancelled { background: #fee2e2; color: #991b1b; }
        
        @media (max-width: 1024px) {
          .order-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
}
