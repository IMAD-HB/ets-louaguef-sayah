import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../utils/api.js";
import UserCard from "../../components/admin/UserCard";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Fetch users with optional search
  useEffect(() => {
    const controller = new AbortController();

    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await axios.get("/auth/users", {
          params: debouncedSearch ? { search: debouncedSearch } : {},
          signal: controller.signal,
        });

        const sorted = res.data.sort((a, b) => {
          const roleA = (a.role || "").toLowerCase();
          const roleB = (b.role || "").toLowerCase();
          if (roleA === "admin" && roleB !== "admin") return -1;
          if (roleA !== "admin" && roleB === "admin") return 1;
          return 0;
        });

        setUsers(sorted);
      } catch (err) {
        if (err.name !== "CanceledError") {
          console.error("❌ Failed to fetch users:", err);
          toast.error("❌ حدث خطأ أثناء تحميل المستخدمين");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();

    return () => controller.abort(); // Clean up
  }, [debouncedSearch]);

  const handleAddUser = () => navigate("/admin/users/create");

  const handleDelete = async (userId) => {
    if (!window.confirm("❗ هل أنت متأكد أنك تريد حذف هذا المستخدم؟")) return;

    try {
      await axios.delete(`/auth/users/${userId}`);
      setUsers((prev) => prev.filter((u) => u._id !== userId));
      toast.success("✅ تم حذف المستخدم بنجاح");
    } catch (err) {
      console.error("❌ فشل في حذف المستخدم:", err);
      toast.error("❌ حدث خطأ أثناء حذف المستخدم");
    }
  };

  const filteredUsers = users.filter((user) => {
    if (filter === "all") return true;
    return (user.role || "").toLowerCase() === filter;
  });

  return (
    <div className="min-h-screen bg-gray-100 py-6 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header & Controls */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-800">المستخدمون</h2>

          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border px-3 py-2 rounded w-full sm:w-auto"
            >
              <option value="all">الكل</option>
              <option value="admin">المسؤولون</option>
              <option value="client">الزبائن</option>
            </select>

            <button
              onClick={handleAddUser}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              ➕ إضافة مستخدم
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="text-right">
          <input
            type="text"
            placeholder="🔍 ابحث عن مستخدم (اسم، رقم، حساب)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-1/3 px-4 py-2 border rounded focus:outline-none focus:ring"
          />
        </div>

        {/* Content Grid */}
        {loading ? (
          <div className="text-center text-gray-600">🔄 جاري التحميل...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <UserCard key={user._id} user={user} onDelete={handleDelete} />
              ))
            ) : (
              <div className="text-center col-span-full text-gray-500">
                لا يوجد مستخدمين مطابقين للبحث الحالي.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;
