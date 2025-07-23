import { useState, useEffect } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

const BrandForm = ({ onSubmit, initialData = {}, isEditing = false }) => {
  const [name, setName] = useState("");
  const [logoFile, setLogoFile] = useState(null);
  const [preview, setPreview] = useState("");

  // Sync form with props
  useEffect(() => {
    setName(initialData.name || "");
    setPreview(initialData.logo || "");
    setLogoFile(null); // reset file input when switching brands
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || (!logoFile && !isEditing)) return;

    const formData = new FormData();
    formData.append("name", name);
    if (logoFile) formData.append("logo", logoFile);

    onSubmit(formData);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setLogoFile(file);
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 w-full max-w-lg mx-auto p-4 bg-white shadow-md rounded-md"
    >
      {/* Brand Name */}
      <div>
        <label htmlFor="brandName" className="block mb-1 font-medium text-gray-700">
          اسم الماركة
        </label>
        <Input
          id="brandName"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="مثال: Safina"
          required
        />
      </div>

      {/* Logo Upload */}
      <div>
        <label htmlFor="brandLogo" className="block mb-1 font-medium text-gray-700">
          شعار الماركة
        </label>
        <Input
          id="brandLogo"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
        />
        {preview && (
          <img
            src={preview}
            alt="معاينة الشعار"
            className="mt-3 h-24 max-w-full object-contain border rounded"
          />
        )}
      </div>

      {/* Submit */}
      <Button type="submit" className="w-full">
        {isEditing ? "تحديث الماركة" : "إضافة ماركة"}
      </Button>
    </form>
  );
};

export default BrandForm;
