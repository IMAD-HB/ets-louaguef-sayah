import { Link, useLocation } from "react-router-dom";
import { Button } from "../ui/button";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useState, useRef } from "react";

const ClientNavbar = ({ onLogout }) => {
  const location = useLocation();
  const { user } = useAuth();
  const { cartItems } = useCart();
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const logoutThrottle = useRef(false);

  const isActive = (path) => location.pathname.startsWith(path);

  const navItems = [
    { path: "/client", label: "الرئيسية" },
    { path: "/client/cart", label: "السلة" },
    { path: "/client/orders", label: "طلباتي" },
    { path: "/client/profile", label: "حسابي" },
  ];

  const handleLogout = () => {
    if (logoutThrottle.current) return;
    logoutThrottle.current = true;
    setIsLoggingOut(true);
    Promise.resolve(onLogout())
      .finally(() => {
        setTimeout(() => {
          logoutThrottle.current = false;
          setIsLoggingOut(false);
        }, 1000); // 1 second throttle
      });
  };

  return (
    <nav className="bg-white border-b p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-sm">
      <div className="flex flex-wrap gap-4 rtl:space-x-reverse">
        {navItems.map(({ path, label }) => (
          <Link
            key={path}
            to={path}
            className={`relative text-sm font-medium transition-colors ${
              isActive(path) ? "text-blue-600" : "text-gray-600"
            } hover:text-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 rounded`}
            aria-current={isActive(path) ? "page" : undefined}
          >
            {label}
            {path === "/client/cart" && cartCount > 0 && (
              <span
                className="absolute -top-2 -right-3 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center"
                aria-label={`عدد العناصر في السلة: ${cartCount}`}
              >
                {cartCount}
              </span>
            )}
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-3">
        {user?.name && (
          <span className="text-sm text-gray-500 hidden sm:inline">
            مرحباً، {user.name}
          </span>
        )}
        <Button
          variant="outline"
          onClick={handleLogout}
          disabled={isLoggingOut}
          aria-disabled={isLoggingOut}
        >
          {isLoggingOut ? "جارٍ تسجيل الخروج..." : "تسجيل الخروج"}
        </Button>
      </div>
    </nav>
  );
};

export default ClientNavbar;
