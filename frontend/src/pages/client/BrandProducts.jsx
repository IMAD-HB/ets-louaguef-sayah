import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../utils/api";
import ProductCard from "../../components/client/ProductCard";

const BrandProducts = () => {
  const { brandId } = useParams();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [brand, setBrand] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!brandId) return;

    const timer = setTimeout(() => {
      const fetchBrandProducts = async () => {
        try {
          setLoading(true);

          const { data: allProducts } = await axios.get("/products");

          const filtered = allProducts.filter(
            (product) => product?.brand?._id === brandId
          );

          setProducts(filtered);
          setBrand(filtered[0]?.brand || null);
        } catch (error) {
          console.error("❌ فشل تحميل المنتجات:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchBrandProducts();
    }, 300); // throttle delay

    return () => clearTimeout(timer);
  }, [brandId]);

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6">
      {loading ? (
        <p className="text-center text-gray-600 animate-pulse">
          ...جاري تحميل المنتجات
        </p>
      ) : (
        <>
          {brand && (
            <h2 className="text-xl font-bold mb-6 text-center text-gray-800">
              منتجات {brand.name}
            </h2>
          )}

          {products.length === 0 ? (
            <p className="text-center text-gray-500">لا توجد منتجات حالياً</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((product) => (
                <ProductCard
                  key={product._id || product.id}
                  product={product}
                  onClick={() =>
                    navigate(`/client/products/${product._id || product.id}`)
                  }
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BrandProducts;
