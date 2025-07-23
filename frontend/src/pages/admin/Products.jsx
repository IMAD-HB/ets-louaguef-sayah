import { useEffect, useState } from "react";
import axios from "../../utils/api.js";
import ProductForm from "../../components/admin/ProductForm";
import { toast } from "react-toastify";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Debounce input
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
    }, 400);
    return () => clearTimeout(timeout);
  }, [searchTerm]);

  // Fetch brands once
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await axios.get("/brands");
        setBrands(res.data);
      } catch {
        toast.error("❌ فشل في جلب العلامات التجارية");
      }
    };
    fetchBrands();
  }, []);

  // Fetch products (search + refresh)
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await axios.get("/products", {
          params: debouncedSearch ? { search: debouncedSearch } : {},
        });
        setProducts(res.data);
      } catch {
        toast.error("❌ فشل في جلب المنتجات");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [debouncedSearch, refreshKey]);

  const refreshProducts = () => setRefreshKey((prev) => prev + 1);

  const handleDelete = async (id) => {
    if (!window.confirm("❗ هل أنت متأكد من حذف هذا المنتج؟")) return;

    try {
      await axios.delete(`/products/${id}`);
      toast.success("✅ تم حذف المنتج");
      refreshProducts();
    } catch {
      toast.error("❌ حدث خطأ أثناء حذف المنتج");
    }
  };

  const handleSubmit = async (formData) => {
    try {
      if (editingProduct) {
        await axios.put(`/products/${editingProduct.id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("✅ تم تحديث المنتج");
      } else {
        await axios.post("/products", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("✅ تمت إضافة المنتج");
      }
      setEditingProduct(null);
      refreshProducts();
    } catch {
      toast.error("❌ حدث خطأ أثناء الحفظ");
    }
  };

  const groupedByBrand = products.reduce((acc, product) => {
    const brandName = product.brand?.name || "بدون علامة";
    acc[brandName] = acc[brandName] || [];
    acc[brandName].push(product);
    return acc;
  }, {});

  return (
    <div className="rtl font-cairo bg-gray-50 min-h-screen">
      <div className="p-4 max-w-6xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">المنتجات</h1>

        <ProductForm
          brands={brands}
          onSubmit={handleSubmit}
          editingProduct={editingProduct}
          setEditingProduct={setEditingProduct}
          refreshProducts={refreshProducts}
        />

        {/* Search */}
        <div className="text-right">
          <input
            type="text"
            placeholder="🔍 ابحث عن منتج..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-1/2 px-4 py-2 border rounded shadow-sm focus:outline-none focus:ring"
          />
        </div>

        {/* Loading state */}
        {loading ? (
          <p className="text-center text-gray-500 py-10">🔄 جاري التحميل...</p>
        ) : products.length === 0 ? (
          <p className="text-center text-gray-500 py-10">لا توجد منتجات.</p>
        ) : (
          Object.entries(groupedByBrand).map(([brand, brandProducts]) => (
            <div key={brand}>
              <h2 className="text-xl font-semibold text-gray-800 border-b pb-1 mb-2">{brand}</h2>
              <div className="overflow-auto rounded-md shadow-sm">
                <table className="w-full min-w-[700px] text-sm text-right bg-white">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-2 border">الصورة</th>
                      <th className="p-2 border">الاسم</th>
                      <th className="p-2 border">الوصف</th>
                      <th className="p-2 border">أسعار الفئات</th>
                      <th className="p-2 border">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {brandProducts.map((product) => (
                      <tr key={product.id || product._id} className="text-center">
                        <td className="p-2 border">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="h-16 w-auto mx-auto object-contain rounded"
                          />
                        </td>
                        <td className="p-2 border">{product.name}</td>
                        <td className="p-2 border text-gray-700">{product.description}</td>
                        <td className="p-2 border text-gray-700">
                          {Object.entries(product.basePrices || {}).map(([tier, price]) => (
                            <div key={tier}>
                              {tier === "Retail" && "تجزئة"}
                              {tier === "Wholesale" && "جملة"}
                              {tier === "SuperWholesale" && "جملة كبرى"}: {price} دج
                            </div>
                          ))}
                        </td>
                        <td className="p-2 border space-x-2 space-x-reverse">
                          <button
                            onClick={() => setEditingProduct(product)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                          >
                            تعديل
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                          >
                            حذف
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Products;
