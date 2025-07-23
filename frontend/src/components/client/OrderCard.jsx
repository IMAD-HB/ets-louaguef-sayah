import { Link } from "react-router-dom";

const OrderCard = ({ order }) => {
  const remainingDebt =
    order.remainingDebt ??
    (order.totalPrice != null && order.amountPaid != null
      ? order.totalPrice - order.amountPaid
      : 0);

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

      {order.receiptGenerated && (
        <a
          href={`/orders/${order._id}/receipt`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 text-sm text-blue-500 underline hover:text-blue-700"
          aria-label={`تحميل إيصال الطلب رقم ${order._id}`}
        >
          تحميل الإيصال
        </a>
      )}
    </div>
  );
};

export default OrderCard;
