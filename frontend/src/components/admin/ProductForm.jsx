import { useState, useEffect, useRef } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea.jsx";
import { Select, SelectItem } from "../ui/select";
import { toast } from "react-toastify";

const ProductForm = ({
  refreshProducts,
  onSubmit,
  editingProduct,
  setEditingProduct,
  brands = [],
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [previewImage, setPreviewImage] = useState("");
  const [brandId, setBrandId] = useState("");
  const [basePrices, setBasePrices] = useState({
    Retail: "",
    Wholesale: "",
    SuperWholesale: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const isSubmitting = useRef(false); // throttling flag

  useEffect(() => {
    if (editingProduct) {
      setName(editingProduct.name || "");
      setDescription(editingProduct.description || "");
      setPreviewImage(editingProduct.image || "");
      setBrandId(editingProduct.brand?._id || editingProduct.brand || "");
      setBasePrices({
        Retail: editingProduct.basePrices?.Retail ?? "",
        Wholesale: editingProduct.basePrices?.Wholesale ?? "",
        SuperWholesale: editingProduct.basePrices?.SuperWholesale ?? "",
      });
    } else {
      resetForm();
    }
  }, [editingProduct]);

  const resetForm = () => {
    setName("");
    setDescription("");
    setImageFile(null);
    setPreviewImage("");
    setBrandId("");
    setBasePrices({ Retail: "", Wholesale: "", SuperWholesale: "" });
    setEditingProduct(null);
  };

  const handlePriceChange = (tier, value) => {
    const numericValue = value === "" ? "" : Number(value);
    setBasePrices((prev) => ({
      ...prev,
      [tier]: numericValue,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting.current) return;

    if (!name || !brandId || (!imageFile && !editingProduct)) {
      toast.error("❌ يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    isSubmitting.current = true;
    setSubmitting(true);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("brand", brandId);
    formData.append("basePrices", JSON.stringify(basePrices));
    if (imageFile) formData.append("image", imageFile);

    try {
      await onSubmit(formData);
      toast.success("✅ تم حفظ المنتج بنجاح");
      resetForm();
    } catch (err) {
      toast.error("❌ حدث خطأ أثناء حفظ المنتج");
      console.error(err);
    } finally {
      setSubmitting(false);
      setTimeout(() => (isSubmitting.current = false), 1000); // throttling delay
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-2xl" dir="rtl">
      <div>
        <label className="block mb-1 font-medium">اسم المنتج</label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="مثال: زيت زيتون 1 لتر"
        />
      </div>

      <div>
        <label className="block mb-1 font-medium">الوصف</label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="تفاصيل إضافية حول المنتج"
        />
      </div>

      <div>
        <label className="block mb-1 font-medium">الصورة</label>
        <Input type="file" accept="image/*" onChange={handleImageChange} />
        {previewImage && (
          <img
            src={previewImage}
            alt="معاينة الصورة"
            className="mt-2 h-24 w-full object-contain border rounded"
          />
        )}
      </div>

      <div>
        <label className="block mb-1 font-medium">الماركة</label>
        <Select value={brandId} onValueChange={setBrandId}>
          <SelectItem key="placeholder" value="" disabled>
            اختر الماركة
          </SelectItem>
          {brands.map((b) => (
            <SelectItem key={b._id} value={b._id}>
              {b.name}
            </SelectItem>
          ))}
        </Select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block mb-1 font-medium">سعر التجزئة</label>
          <Input
            type="number"
            value={basePrices.Retail}
            onChange={(e) => handlePriceChange("Retail", e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">سعر الجملة</label>
          <Input
            type="number"
            value={basePrices.Wholesale}
            onChange={(e) => handlePriceChange("Wholesale", e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">سعر السوبر جملة</label>
          <Input
            type="number"
            value={basePrices.SuperWholesale}
            onChange={(e) => handlePriceChange("SuperWholesale", e.target.value)}
            required
          />
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting
          ? "جاري الحفظ..."
          : editingProduct
          ? "تحديث المنتج"
          : "إضافة المنتج"}
      </Button>
    </form>
  );
};

export default ProductForm;
