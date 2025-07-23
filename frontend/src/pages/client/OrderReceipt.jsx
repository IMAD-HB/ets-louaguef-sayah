import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../utils/api";
import { toast } from "react-toastify";
import { PDFDownloadLink } from "@react-pdf/renderer";
import ReceiptPDF from "../../components/client/ReceiptPDF";
import { Button } from "../../components/ui/button";

const OrderReceipt = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const isFetching = useRef(false);

  useEffect(() => {
    const fetchOrder = async () => {
      if (isFetching.current) return;
      isFetching.current = true;

      try {
        const { data } = await axios.get(`/orders/${id}/receipt`);
        setOrder(data);
      } catch (err) {
        const msg =
          err.response?.status === 403
            ? err.response?.data?.message || "غير مصرح بعرض الإيصال"
            : "فشل في تحميل الإيصال";

        toast.error(msg);
        navigate("/client/");
      } finally {
        setLoading(false);
        setTimeout(() => {
          isFetching.current = false;
        }, 1000); // throttle duration
      }
    };

    fetchOrder();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-[30vh] flex items-center justify-center text-gray-500">
        ⏳ جاري التحميل...
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10 font-cairo">
      <div className="max-w-xl mx-auto bg-white shadow rounded-lg p-6 text-center">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          ✅ الإيصال جاهز للتحميل
        </h1>

        <PDFDownloadLink
          document={<ReceiptPDF order={order} />}
          fileName={`receipt-${order._id}.pdf`}
        >
          {({ loading: pdfLoading }) => (
            <Button className="w-full sm:w-auto" disabled={pdfLoading}>
              {pdfLoading ? "📄 يتم تجهيز الإيصال..." : "⬇️ تحميل الإيصال PDF"}
            </Button>
          )}
        </PDFDownloadLink>
      </div>
    </div>
  );
};

export default OrderReceipt;
