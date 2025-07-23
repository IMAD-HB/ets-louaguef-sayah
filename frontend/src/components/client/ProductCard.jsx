import React, { useRef } from "react";

const ProductCard = ({ product, onClick }) => {
  if (!product) return null;

  const { image, name, price } = product;
  const isThrottled = useRef(false);

  const handleClick = () => {
    if (isThrottled.current) return;
    isThrottled.current = true;

    onClick?.(product);

    setTimeout(() => {
      isThrottled.current = false;
    }, 800); // throttle duration
  };

  return (
    <div
      onClick={handleClick}
      className="cursor-pointer border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow p-3 flex flex-col"
    >
      <img
        src={image}
        alt={name}
        className="w-full h-40 object-contain rounded-md mb-3"
      />
      <h2 className="text-base sm:text-lg font-bold text-gray-800 line-clamp-2">
        {name}
      </h2>
      <p className="text-sm sm:text-base text-green-700 mt-1">
        {price != null ? `${price.toLocaleString()} د.ج` : "السعر غير متوفر"}
      </p>
    </div>
  );
};

export default ProductCard;
