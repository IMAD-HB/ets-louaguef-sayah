import { Outlet, useNavigate } from "react-router-dom";
import ClientNavbar from "../components/client/ClientNavbar";
import { useAuth } from "../context/AuthContext";

const ClientLayout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 font-cairo">
      <ClientNavbar onLogout={handleLogout} />
      <main className="p-4">
        <Outlet />
      </main>
    </div>
  );
};

export default ClientLayout;
