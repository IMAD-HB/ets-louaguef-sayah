import { useEffect, useState, useCallback } from "react";
import axios from "../../utils/api.js";
import UserDebtCard from "../../components/admin/UserDebtCard";
import { toast } from "react-toastify";

const DebtManagement = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(false);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  // Fetch users with debt
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/auth/users", {
        params: debouncedSearch ? { search: debouncedSearch } : {},
      });

      const usersWithDebt = data.filter((user) => user.totalDebt > 0);
      setUsers(usersWithDebt);
    } catch (error) {
      console.error("❌ فشل في جلب المستخدمين:", error);
      toast.error("❌ فشل في تحميل المستخدمين");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  // Refresh on search change
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Handle settle debt action
  const handleSettle = async (userId, amount) => {
    try {
      await axios.put(`/auth/users/${userId}/settle-debt`, { amount });
      toast.success("✅ تم تحديث المديونية بنجاح");
      fetchUsers();
    } catch (error) {
      console.error("❌ فشل في تسوية المديونية:", error);
      toast.error("❌ فشل في تسوية المديونية");
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 min-h-screen bg-gray-50 font-[Cairo]" dir="rtl">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800">إدارة ديون العملاء</h2>
        <input
          type="text"
          placeholder="🔍 ابحث عن اسم، مستخدم أو رقم..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-80 px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        />
      </div>

      {/* Users List */}
      {loading ? (
        <div className="text-center text-blue-600 text-lg py-10 animate-pulse">
          جاري تحميل البيانات...
        </div>
      ) : users.length === 0 ? (
        <div className="text-center text-gray-500 text-lg py-10">
          لا يوجد عملاء لديهم ديون حالياً ✅
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map((user) => (
            <UserDebtCard key={user._id} user={user} onSettle={handleSettle} />
          ))}
        </div>
      )}
    </div>
  );
};

export default DebtManagement;
