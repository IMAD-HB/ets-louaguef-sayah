import { Outlet, useNavigate } from "react-router-dom";
import AdminNavbar from "../components/admin/AdminNavbar";
import { useAuth } from "../context/AuthContext";

const AdminLayout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login"); 
  };

  return (
    <div className="min-h-screen bg-gray-50 font-cairo">
      <AdminNavbar onLogout={handleLogout} />
      <main className="p-4">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;