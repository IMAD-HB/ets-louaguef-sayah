import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../utils/api";
import QuantitySelector from "../../components/client/QuantitySelector";
import { useCart } from "../../context/CartContext";
import { Button } from "../../components/ui/button";
import { toast } from "react-toastify";

const ProductDetails = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const isFetching = useRef(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (isFetching.current) return;
      isFetching.current = true;

      try {
        const { data } = await axios.get(`/products/${productId}`);
        setProduct(data);
      } catch (err) {
        console.error("❌ Failed to fetch product:", err);
        const status = err.response?.status;
        if (status === 401) {
          toast.error("يرجى تسجيل الدخول للوصول إلى هذه الصفحة");
          navigate("/login");
        } else {
          toast.error("حدث خطأ أثناء تحميل المنتج");
        }
      } finally {
        setTimeout(() => {
          isFetching.current = false;
        }, 1000); // throttle duration
      }
    };

    fetchProduct();
  }, [productId, navigate]);

  const handleAddToCart = () => {
    if (!product) return;

    if (!product.price) {
      toast.error("هذا المنتج غير متوفر حالياً");
      return;
    }

    if (quantity <= 0) {
      toast.error("الكمية يجب أن تكون 1 أو أكثر");
      return;
    }

    addToCart({
      _id: product._id,
      name: product.name,
      image: product.image,
      price: product.price,
      quantity,
    });

    toast.success("✅ تمت الإضافة إلى السلة بنجاح");
  };

  if (!product) {
    return (
      <div className="min-h-[30vh] flex items-center justify-center text-gray-500">
        ⏳ جاري التحميل...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-cairo px-4 py-6">
      <div className="max-w-4xl mx-auto bg-white shadow rounded-lg p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex justify-center items-center">
          <img
            src={product.image}
            alt={`صورة ${product.name}`}
            className="w-full max-h-80 object-contain rounded-lg"
          />
        </div>

        <div className="flex flex-col gap-4">
          <h1 className="text-2xl font-bold text-gray-800">{product.name}</h1>
          <p className="text-gray-600 whitespace-pre-wrap">
            {product.description}
          </p>

          <p className="text-lg font-semibold text-green-700">
            السعر:{" "}
            {product.price
              ? `${product.price.toLocaleString()} د.ج`
              : "غير متوفر"}
          </p>

          <QuantitySelector value={quantity} onChange={setQuantity} />

          <Button
            onClick={handleAddToCart}
            disabled={!product.price}
            className="w-full sm:w-auto"
          >
            🛒 إضافة إلى السلة
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
