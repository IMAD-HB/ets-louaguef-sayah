const OrderSummary = ({ cartItems = [], paymentAmount = 0 }) => {
  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const debt = total - paymentAmount;

  return (
    <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 w-full max-w-md mx-auto">
      <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 text-center">
        🧾 ملخص الطلب
      </h2>

      <ul className="divide-y divide-gray-200">
        {cartItems.map((item) => (
          <li
            key={item._id}
            className="py-2 flex justify-between text-sm sm:text-base"
          >
            <span className="truncate">{item.name} × {item.quantity}</span>
            <span className="whitespace-nowrap">
              {(item.price * item.quantity).toLocaleString()} د.ج
            </span>
          </li>
        ))}
      </ul>

      <div className="border-t border-gray-200 pt-4 mt-4 space-y-2 text-sm sm:text-base">
        <div className="flex justify-between font-medium">
          <span>المجموع:</span>
          <span>{total.toLocaleString()} د.ج</span>
        </div>

        <div className="flex justify-between">
          <span>المدفوع:</span>
          <span>{paymentAmount.toLocaleString()} د.ج</span>
        </div>

        <div className="flex justify-between text-red-600 font-bold">
          <span>الباقي (دين):</span>
          <span>{debt.toLocaleString()} د.ج</span>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
