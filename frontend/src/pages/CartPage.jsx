import { Link } from "react-router-dom";
import { useCartStore } from "../store/useCartStore";

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotalPrice, getSubtotal, getTotalSavings } = useCartStore();

  const parseImages = (imgString) => {
    try {
      return JSON.parse(imgString || "[]");
    } catch {
      return [];
    }
  };

  if (items.length === 0) {
    return (
      <div className="container page">
        <div className="empty-state card" style={{ padding: "4rem 2rem" }}>
          <div style={{ fontSize: "4rem", marginBottom: "1.5rem" }}>🛒</div>
          <h1 className="section-title">Your cart is empty</h1>
          <p className="section-subtitle" style={{ margin: "0 auto 2rem" }}>
            Looks like you haven't added any premium appliances yet.
          </p>
          <Link to="/shop" className="btn btn-primary">Start Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container page">
      <header style={{ marginBottom: "2.5rem" }}>
        <h1 className="section-title">Shopping Bag</h1>
        <p className="section-subtitle">You have {items.length} item{items.length !== 1 ? "s" : ""} in your cart.</p>
      </header>

      <div className="cart-layout">
        <section className="cart-items-list">
          {items.map((item) => {
            const images = parseImages(item.images);
            const hasDiscount = Boolean(item.discount_price);
            const unitPrice = hasDiscount ? Number(item.discount_price) : Number(item.price);
            
            return (
              <div className="card cart-item-pro" key={item.id}>
                <div className="cart-item-image-container">
                  {images[0] ? (
                    <img src={images[0]} alt={item.name} className="cart-item-img-pro" />
                  ) : (
                    <div className="cart-item-placeholder">No Image</div>
                  )}
                </div>
                
                <div className="cart-item-info-pro">
                  <div className="row-between" style={{ alignItems: "flex-start" }}>
                    <div>
                      <Link to={`/product/${item.id}`} className="cart-item-name-pro">{item.name}</Link>
                      <p className="cart-item-meta-pro">{item.categories?.name || "Premium Appliance"}</p>
                    </div>
                    <button 
                      className="cart-remove-btn" 
                      onClick={() => removeItem(item.id)}
                      aria-label="Remove item"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="row-between" style={{ marginTop: "auto", paddingTop: "1rem" }}>
                    <div className="quantity-controls-pro">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                    </div>
                    
                    <div className="cart-item-pricing-pro">
                      {hasDiscount && (
                        <span className="cart-item-old-price">PKR {(Number(item.price) * item.quantity).toLocaleString()}</span>
                      )}
                      <span className="cart-item-current-price">PKR {(unitPrice * item.quantity).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        <aside className="cart-summary-sidebar">
          <div className="card summary-card">
            <h3 style={{ margin: "0 0 1.5rem 0", fontSize: "1.2rem" }}>Order Summary</h3>
            
            <div className="summary-row">
              <span>Subtotal</span>
              <span>PKR {getSubtotal().toLocaleString()}</span>
            </div>
            
            {getTotalSavings() > 0 && (
              <div className="summary-row savings">
                <span>Discount</span>
                <span>- PKR {getTotalSavings().toLocaleString()}</span>
              </div>
            )}
            
            <div className="summary-row">
              <span>Shipping</span>
              <span style={{ color: "#10b981", fontWeight: 600 }}>Calculated at next step</span>
            </div>
            
            <div className="summary-divider" />
            
            <div className="summary-row total">
              <span>Total</span>
              <span>PKR {getTotalPrice().toLocaleString()}</span>
            </div>

            {getTotalSavings() > 0 && (
              <div className="savings-badge">
                🎉 You are saving PKR {getTotalSavings().toLocaleString()} on this order!
              </div>
            )}

            <Link to="/checkout" className="btn btn-primary checkout-btn-pro">
              Secure Checkout
            </Link>
            
            <div className="payment-icons">
              <span>Cash on Delivery Available</span>
            </div>
          </div>
          
          <Link to="/shop" className="continue-shopping">
            ← Continue Shopping
          </Link>
        </aside>
      </div>
    </div>
  );
}
