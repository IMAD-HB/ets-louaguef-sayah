import { X } from "lucide-react";
import QuantitySelector from "./QuantitySelector";

const CartItem = ({ item, onUpdate, onRemove }) => {
  const handleQuantityChange = (newQuantity) => {
    // Optionally, debounce/throttle onUpdate in parent to avoid excessive calls
    onUpdate(item._id, newQuantity);
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white rounded-lg shadow-sm p-4 mb-3 gap-4 sm:gap-0">
      <div className="flex items-center space-x-4 rtl:space-x-reverse sm:flex-1">
        <img
          src={item.image}
          alt={`صورة المنتج: ${item.name}`}
          className="w-16 h-16 object-cover rounded flex-shrink-0"
          loading="lazy"
          decoding="async"
        />
        <div className="min-w-0">
          <p className="font-medium truncate">{item.name}</p>
          <p className="text-sm text-gray-500">
            {item.price.toLocaleString()} د.ج
          </p>
          <QuantitySelector value={item.quantity} onChange={handleQuantityChange} />
        </div>
      </div>

      <button
        onClick={() => onRemove(item._id)}
        aria-label={`إزالة المنتج ${item.name} من السلة`}
        className="text-red-500 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 rounded p-1"
        type="button"
      >
        <X size={20} />
      </button>
    </div>
  );
};

export default CartItem;
