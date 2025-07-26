import React, { useEffect, useRef, useState, useCallback } from "react";
import axios from "../../utils/api.js";
import { toast } from "react-toastify";
import BrandForm from "../../components/admin/BrandForm";
import { Card, CardContent } from "../../components/ui/card";
import { throttle } from "lodash";

const Brands = () => {
  const [brands, setBrands] = useState([]);
  const [editingBrand, setEditingBrand] = useState(null);
  const [refresh, setRefresh] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch brands (with optional search term)
  const fetchBrands = async (search = "") => {
    try {
      const { data } = await axios.get(`/brands`, {
        params: search ? { search } : {},
      });
      setBrands(data);
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("فشل في جلب العلامات التجارية");
    }
  };

  // Throttled version of fetchBrands
  const throttledFetch = useCallback(
    throttle((term) => fetchBrands(term), 500),
    []
  );

  // Initial fetch and refresh
  useEffect(() => {
    fetchBrands();
  }, [refresh]);

  // Search term handling (with throttle)
  useEffect(() => {
    throttledFetch(searchTerm.trim());
  }, [searchTerm, throttledFetch]);

  const handleSubmit = async (formData) => {
    try {
      if (editingBrand) {
        await axios.put(`/brands/${editingBrand._id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("تم تحديث العلامة التجارية بنجاح");
      } else {
        await axios.post("/brands", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("تمت إضافة العلامة التجارية بنجاح");
      }

      setEditingBrand(null);
      setRefresh((prev) => !prev);
    } catch (err) {
      console.error("Save error:", err);
      if (err.response?.status === 409) {
        toast.error("❗ هذه العلامة موجودة مسبقًا");
      } else {
        toast.error("حدث خطأ أثناء الحفظ");
      }
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("هل أنت متأكد من الحذف؟");
    if (!confirmed) return;

    try {
      await axios.delete(`/brands/${id}`);
      toast.success("تم الحذف بنجاح");
      setRefresh((prev) => !prev);
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("حدث خطأ أثناء الحذف");
    }
  };

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-2xl font-bold text-right">إدارة العلامات التجارية</h2>

      {/* Form */}
      <BrandForm
        onSubmit={handleSubmit}
        initialData={editingBrand || {}}
        isEditing={!!editingBrand}
      />

      {/* Search */}
      <div className="flex justify-center mb-4">
        <input
          type="text"
          placeholder="🔍 ابحث عن علامة تجارية..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:w-2/3 md:w-1/2 lg:w-1/3 px-4 py-2 border rounded shadow-sm focus:outline-none focus:ring focus:border-blue-300"
        />
      </div>

      {/* Brands List */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {brands.map((brand) => (
          <Card key={brand._id} className="shadow-sm">
            <CardContent className="flex flex-col items-center gap-4 p-4 text-center">
              <img
                src={brand.logo}
                alt={`شعار ${brand.name}`}
                className="w-24 h-24 object-contain"
              />
              <p className="text-lg font-semibold">{brand.name}</p>
              <div className="flex gap-2 flex-wrap justify-center">
                <button
                  onClick={() => setEditingBrand(brand)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded transition"
                  aria-label="تعديل العلامة"
                >
                  تعديل
                </button>
                <button
                  onClick={() => handleDelete(brand._id)}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded transition"
                  aria-label="حذف العلامة"
                >
                  حذف
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Brands;
