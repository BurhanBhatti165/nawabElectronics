import { Link, useLocation } from "react-router-dom";
import { useCartStore } from "../store/useCartStore";

export default function MobileCartBar() {
  const location = useLocation();
  const totalItems = useCartStore((s) => s.getTotalItems());
  const totalPrice = useCartStore((s) => s.getTotalPrice());

  if (totalItems === 0) return null;
  if (location.pathname === "/cart" || location.pathname === "/checkout") return null;

  return (
    <div className="mobile-cart-bar">
      <div>
        <p className="mobile-cart-bar-meta">{totalItems} item{totalItems > 1 ? "s" : ""}</p>
        <strong>PKR {totalPrice.toLocaleString()}</strong>
      </div>
      <Link to="/cart" className="btn btn-primary">View Cart</Link>
    </div>
  );
}
