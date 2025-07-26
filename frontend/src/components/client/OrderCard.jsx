import { Link } from "react-router-dom";

const OrderCard = ({ order }) => {
  const remainingDebt =
    order.remainingDebt ??
    (order.totalPrice != null && order.amountPaid != null
      ? order.totalPrice - order.amountPaid
      : 0);

  // ✅ Format date/time
  const formattedDate = order.createdAt
    ? new Date(order.createdAt).toLocaleString("ar-DZ", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "غير متوفر";

  return (
    <div className="bg-white rounded-lg shadow p-4 flex flex-col gap-3">
      <div className="flex justify-between text-sm sm:text-base">
        <span className="font-semibold">رقم الطلب:</span>
        <span className="break-all">{order._id}</span>
      </div>

      <div className="flex justify-between text-sm sm:text-base">
        <span>الحالة:</span>
        <span className="text-blue-600 font-medium">{order.status}</span>
      </div>

      <div className="flex justify-between text-sm sm:text-base">
        <span>الإجمالي:</span>
        <span>{(order.totalPrice ?? 0).toLocaleString()} د.ج</span>
      </div>

      <div className="flex justify-between text-sm sm:text-base">
        <span>المدفوع:</span>
        <span>{(order.amountPaid ?? 0).toLocaleString()} د.ج</span>
      </div>

      <div className="flex justify-between text-sm sm:text-base">
        <span>الدين:</span>
        <span className="text-red-600 font-semibold">
          {remainingDebt.toLocaleString()} د.ج
        </span>
      </div>

      {/* ✅ Display order time */}
      <div className="flex justify-between text-sm sm:text-base text-gray-500">
        <span>تاريخ الطلب:</span>
        <span>{formattedDate}</span>
      </div>
    </div>
  );
};

export default OrderCard;
