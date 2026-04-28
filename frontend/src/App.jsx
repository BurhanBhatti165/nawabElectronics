import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import ShopPage from "./pages/ShopPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminProductsPage from "./pages/admin/AdminProductsPage";
import AdminAddProductPage from "./pages/admin/AdminAddProductPage";
import AdminCategoriesPage from "./pages/admin/AdminCategoriesPage";
import AdminAddCategoryPage from "./pages/admin/AdminAddCategoryPage";
import AdminManagersPage from "./pages/admin/AdminManagersPage";
import AdminOrdersPage from "./pages/admin/AdminOrdersPage";
import AdminBrandsPage from "./pages/admin/AdminBrandsPage";
import AdminBannersPage from "./pages/admin/AdminBannersPage";
import RoleGate from "./components/RoleGate";
import MobileCartBar from "./components/MobileCartBar";
import WhatsAppButton from "./components/WhatsAppButton";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import SupportPage from "./pages/SupportPage";

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/support" element={<SupportPage />} />
        <Route path="/manager" element={<RoleGate allow={["manager", "admin"]}><AdminProductsPage /></RoleGate>} />
        <Route path="/manager/products/add" element={<RoleGate allow={["manager", "admin"]}><AdminAddProductPage /></RoleGate>} />
        <Route path="/manager/products/:id/edit" element={<RoleGate allow={["manager", "admin"]}><AdminAddProductPage /></RoleGate>} />
        <Route path="/manager/categories" element={<RoleGate allow={["manager", "admin"]}><AdminCategoriesPage /></RoleGate>} />
        <Route path="/manager/categories/add" element={<RoleGate allow={["manager", "admin"]}><AdminAddCategoryPage /></RoleGate>} />
        <Route path="/manager/categories/:id/edit" element={<RoleGate allow={["manager", "admin"]}><AdminAddCategoryPage /></RoleGate>} />
        <Route path="/manager/brands" element={<RoleGate allow={["manager", "admin"]}><AdminBrandsPage /></RoleGate>} />
        <Route path="/manager/banners" element={<RoleGate allow={["manager", "admin"]}><AdminBannersPage /></RoleGate>} />
        <Route path="/admin" element={<RoleGate allow={["admin"]}><AdminDashboardPage /></RoleGate>} />
        <Route path="/admin/orders" element={<RoleGate allow={["admin", "manager"]}><AdminOrdersPage /></RoleGate>} />
        <Route path="/admin/managers" element={<RoleGate allow={["admin"]}><AdminManagersPage /></RoleGate>} />
      </Routes>
      <WhatsAppButton />
      <MobileCartBar />
      <Footer />
    </>
  );
}
