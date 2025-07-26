import { useState, useCallback } from "react";
import { formatDate } from "../../lib/utils";
import { Button } from "../ui/button";
import { Select, SelectItem } from "../ui/select";
import { pdf } from "@react-pdf/renderer";
import OrderReceiptPDF from "./OrderReceiptPDF";
import { saveAs } from "file-saver";
import { toast } from "react-toastify";

// Debounce util to prevent rapid PDF generation clicks
const debounce = (fn, delay = 1000) => {
  let timeout;
  return (...args) => {
    if (timeout) return;
    timeout = setTimeout(() => (timeout = null), delay);
    fn(...args);
  };
};

const OrderRow = ({ order, onStatusChange, onDelete }) => {
  const [status, setStatus] = useState(order.status);
  const [loadingDownload, setLoadingDownload] = useState(false);

  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);
    onStatusChange(order._id, newStatus);
  };

  const handleDownload = useCallback(
    debounce(async () => {
      try {
        setLoadingDownload(true);
        const blob = await pdf(<OrderReceiptPDF order={order} />).toBlob();
        saveAs(blob, `reçu-${order._id}.pdf`);
        toast.success("تم تحميل الإيصال بنجاح ✅");
      } catch (err) {
        console.error("Failed to generate PDF for order:", order._id, err);
        toast.error("حدث خطأ أثناء تحميل الإيصال ❌");
      } finally {
        setLoadingDownload(false);
      }
    }, 1500),
    [order]
  );

  return (
    <tr className="border-b hover:bg-gray-50 text-sm">
      <td className="p-2 break-words max-w-[200px]">
        {order.user?.name || "—"}
      </td>
      <td className="p-2">{formatDate(order.createdAt)}</td>
      <td className="p-2 whitespace-nowrap">{order.totalPrice} د.ج</td>
      <td className="p-2 text-center whitespace-nowrap">
        {Math.max(
          0,
          order.remainingDebt ?? order.totalPrice - order.amountPaid
        ).toLocaleString("fr-DZ")}{" "}
        د.ج
      </td>
      <td className="p-2 text-center min-w-[120px]">
        <Select value={status} onValueChange={handleStatusChange}>
          <SelectItem value="Pending">قيد الانتظار</SelectItem>
          <SelectItem value="Confirmed">تم التأكيد</SelectItem>
          <SelectItem value="Delivered">تم التوصيل</SelectItem>
          <SelectItem value="Paid">مدفوع</SelectItem>
        </Select>
      </td>
      <td className="p-2 text-center">
        <div className="flex flex-wrap justify-center gap-2">
          <Button
            onClick={handleDownload}
            variant="outline"
            size="sm"
            disabled={loadingDownload}
            aria-label="Download PDF receipt"
          >
            {loadingDownload ? "..." : "تحميل الإيصال"}
          </Button>
          <Button
            onClick={() => onDelete(order._id)}
            variant="destructive"
            size="sm"
            aria-label="Delete order"
          >
            حذف
          </Button>
        </div>
      </td>
    </tr>
  );
};

export default OrderRow;
