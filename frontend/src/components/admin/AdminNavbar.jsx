import { Link, useLocation } from "react-router-dom";
import { Button } from "../ui/button";
import { useAuth } from "../../context/AuthContext";

const AdminNavbar = ({ onLogout }) => {
  const location = useLocation();
  const { user } = useAuth();

  const navItems = [
    { path: "/admin", label: "الرئيسية" },
    { path: "/admin/users", label: "العملاء" },
    { path: "/admin/brands", label: "الماركات" },
    { path: "/admin/products", label: "المنتجات" },
    { path: "/admin/orders", label: "الطلبات" },
    { path: "/admin/debts", label: "المديونيات" },
  ];

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <nav className="bg-white border-b shadow-sm px-4 py-3 font-[Cairo]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 flex-wrap">
        {/* Navigation Links */}
        <div className="flex flex-wrap gap-4 rtl:space-x-reverse min-w-0">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`text-sm font-medium whitespace-nowrap transition-colors ${
                isActive(item.path)
                  ? "text-blue-600 font-semibold"
                  : "text-gray-600"
              } hover:text-blue-500`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* User Info + Logout */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {user?.name && (
            <span className="text-sm text-gray-500 hidden sm:inline-block truncate max-w-[150px]">
              مرحباً، {user.name}
            </span>
          )}
          <Button variant="outline" onClick={onLogout}>
            تسجيل الخروج
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;
