import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "../store/useCartStore";
import { apiFetch } from "../lib/api";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    zipCode: "",
    city: ""
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const placeOrder = async () => {
    setErrorMessage("");
    setLoading(true);
    try {
      await apiFetch("/api/orders", {
        method: "POST",
        body: JSON.stringify({
          customerName: formData.name,
          customerEmail: formData.email,
          customerPhone: formData.phone,
          shippingAddress: `${formData.address}${formData.zipCode ? `, ${formData.zipCode}` : ""}`,
          city: formData.city,
          totalAmount: getTotalPrice(),
          paymentMethod: "COD",
          items: items.map((item) => ({ 
            productId: item.id, 
            quantity: item.quantity, 
            price: Number(item.discount_price) || Number(item.price) 
          })),
        }),
      });
      clearCart();
      setShowSuccess(true);
    } catch (err) {
      console.error(err);
      setErrorMessage("Failed to place order. Please try again or contact support.");
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = formData.name && formData.email && formData.phone && formData.address && formData.city;

  if (showSuccess) {
    return (
      <div className="container page success-page">
        <div className="success-card">
          <div className="success-icon">✓</div>
          <h1>Order Placed!</h1>
          <p>Thank you for shopping with <strong>Nawab Electronics</strong>.</p>
          <p className="success-note">We've sent a confirmation email to <strong>{formData.email}</strong>. Our team will contact you shortly on <strong>{formData.phone}</strong>.</p>
          <button className="btn btn-primary" onClick={() => navigate("/shop")}>Continue Shopping</button>
        </div>
        <style>{`
          .success-page {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 70vh;
          }
          .success-card {
            background: #fff;
            padding: 3rem;
            border-radius: 24px;
            text-align: center;
            box-shadow: 0 20px 40px rgba(0,0,0,0.05);
            max-width: 500px;
            animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
          }
          .success-icon {
            width: 80px;
            height: 80px;
            background: #10b981;
            color: #fff;
            font-size: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            margin: 0 auto 1.5rem;
            box-shadow: 0 10px 20px rgba(16, 185, 129, 0.3);
          }
          .success-card h1 {
            font-size: 2.5rem;
            font-weight: 800;
            margin-bottom: 1rem;
            letter-spacing: -0.02em;
          }
          .success-card p {
            color: var(--muted);
            font-size: 1.1rem;
            line-height: 1.6;
          }
          .success-note {
            background: var(--bg-soft);
            padding: 1rem;
            border-radius: 12px;
            margin: 1.5rem 0 2rem;
            font-size: 0.95rem !important;
          }
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="container page">
      <div className="checkout-container">
        <div className="checkout-form-section">
          <h1 className="section-title">Checkout</h1>
          <p className="section-subtitle">Please provide your details to complete the order.</p>
          {errorMessage ? (
            <p style={{ margin: "0 0 0.8rem", color: "#dc2626" }}>{errorMessage}</p>
          ) : null}
          
          <div className="checkout-grid">
            <div className="form-group">
              <label>Full Name</label>
              <input
                name="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleInputChange}
                className="input"
              />
            </div>
            
            <div className="form-group">
              <label>Email Address</label>
              <input
                name="email"
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={handleInputChange}
                className="input"
              />
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input
                name="phone"
                type="tel"
                placeholder="0300 1234567"
                value={formData.phone}
                onChange={handleInputChange}
                className="input"
              />
            </div>
            
            <div className="form-group">
              <label>City</label>
              <input
                name="city"
                placeholder="Lahore"
                value={formData.city}
                onChange={handleInputChange}
                className="input"
              />
            </div>
            
            <div className="form-group full-width">
              <label>Shipping Address</label>
              <input
                name="address"
                placeholder="123 Main Street, Apartment 4B"
                value={formData.address}
                onChange={handleInputChange}
                className="input"
              />
            </div>
            
            <div className="form-group">
              <label>Zip / Postal Code (Optional)</label>
              <input
                name="zipCode"
                placeholder="54000"
                value={formData.zipCode}
                onChange={handleInputChange}
                className="input"
              />
            </div>
          </div>

          <button 
            disabled={loading || items.length === 0 || !isFormValid} 
            className="btn btn-primary place-order-btn" 
            onClick={placeOrder}
          >
            {loading ? "Placing Order..." : `Complete Purchase - Rs. ${getTotalPrice().toLocaleString()}`}
          </button>
        </div>
      </div>
    </div>
  );
}
