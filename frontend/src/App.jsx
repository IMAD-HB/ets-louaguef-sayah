import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { useAuth } from "./context/AuthContext";
import Login from "./pages/Login";

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";
import Users from "./pages/admin/Users";
import Brands from "./pages/admin/Brands";
import Products from "./pages/admin/Products";
import Orders from "./pages/admin/Orders";
import DebtManagement from "./pages/admin/DebtManagement";
import UserView from "./pages/admin/UserView";
import UserForm from "./pages/admin/UserForm";

// Client Pages
import ClientDashboard from "./pages/client/Dashboard";
import BrandProducts from "./pages/client/BrandProducts";
import ProductDetails from "./pages/client/ProductDetails";
import Cart from "./pages/client/Cart";
import Checkout from "./pages/client/Checkout";
import OrderReceipt from "./pages/client/OrderReceipt";
import OrderHistory from "./pages/client/OrderHistory";
import Profile from "./pages/client/Profile";

// Layouts
import AdminLayout from "./layouts/AdminLayout";
import ClientLayout from "./layouts/ClientLayout";

const ProtectedRoute = ({ role, children }) => {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/login" replace />;

  return children;
};

const App = () => {
  return (
    <div dir="rtl" className="font-cairo bg-gray-50 min-h-screen">
      <Router>
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<Login />} />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute role="admin">
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<Users />} />
            <Route path="users/create" element={<UserForm />} />
            <Route path="users/:id" element={<UserView />} />
            <Route path="users/:id/edit" element={<UserForm />} />
            <Route path="brands" element={<Brands />} />
            <Route path="products" element={<Products />} />
            <Route path="orders" element={<Orders />} />
            <Route path="debts" element={<DebtManagement />} />
          </Route>

          {/* Client Routes */}
          <Route
            path="/client"
            element={
              <ProtectedRoute role="client">
                <ClientLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<ClientDashboard />} />
            <Route path="brands/:brandId" element={<BrandProducts />} />
            <Route path="products/:productId" element={<ProductDetails />} />
            <Route path="cart" element={<Cart />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="orders/:id/receipt" element={<OrderReceipt />} />
            <Route path="orders" element={<OrderHistory />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>

      <ToastContainer position="top-center" rtl theme="colored" />
    </div>
  );
};

export default App;
