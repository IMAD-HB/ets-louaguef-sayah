import React, { useEffect, useState, useRef } from "react";
import axios from "../../utils/api";
import BrandCard from "../../components/client/BrandCard";

const ClientDashboard = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const throttled = useRef(false);

  useEffect(() => {
    const fetchBrands = async () => {
      if (throttled.current) return;
      throttled.current = true;

      try {
        const { data } = await axios.get("/brands");
        setBrands(data);
      } catch (error) {
        console.error("❌ خطأ في تحميل الماركات:", error);
      } finally {
        setLoading(false);
        setTimeout(() => (throttled.current = false), 1000); // Throttle duration
      }
    };

    fetchBrands();
  }, []);

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50 font-cairo p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-gray-800 text-center sm:text-right">
          🏷️ الماركات المتوفرة
        </h1>

        {loading ? (
          <p className="text-center text-gray-500">...جاري التحميل</p>
        ) : brands.length === 0 ? (
          <p className="text-center text-red-500">❌ لا توجد ماركات حالياً</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {brands.map((brand) => (
              <BrandCard key={brand._id} brand={brand} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientDashboard;
