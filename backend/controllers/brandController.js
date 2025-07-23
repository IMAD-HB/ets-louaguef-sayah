import Brand from "../models/Brand.js";
import cloudinary from "../utils/cloudinary.js";

/* -------------------------  Create  ------------------------- */
export const createBrand = async (req, res) => {
  try {
    const { name } = req.body;
    const logoFile = req.files?.logo; // sent as multipart

    if (!name || !logoFile)
      return res.status(400).json({ message: "الاسم والشعار مطلوبان" });

    // Case-insensitive uniqueness
    const exists = await Brand.findOne({
      name: new RegExp(`^${name}$`, "i"),
    });
    if (exists)
      return res.status(409).json({ message: "العلامة موجودة مسبقاً" });

    // Upload to Cloudinary
    const upload = await cloudinary.uploader.upload(logoFile.tempFilePath, {
      folder: "ETS/brands",
    });

    const brand = await Brand.create({ name, logo: upload.secure_url });
    res.status(201).json({ message: "تم إنشاء العلامة", brand });
  } catch (error) {
    console.error("❌ createBrand:", error);
    res.status(500).json({ message: "فشل إنشاء العلامة" });
  }
};

/* -------------------------  Get All  ------------------------ */
export const getBrands = async (req, res) => {
  try {
    const search = req.query.search || "";

    const query = search
      ? { name: { $regex: search, $options: "i" } } // case-insensitive search
      : {};

    const brands = await Brand.find(query).lean();
    res.json(brands);
  } catch (error) {
    console.error("❌ getBrands:", error);
    res.status(500).json({ message: "حدث خطأ عند جلب العلامات" });
  }
};

/* -------------------------  Update  ------------------------- */
export const updateBrand = async (req, res) => {
  try {
    const { name } = req.body;
    const logoFile = req.files?.logo;

    const brand = await Brand.findById(req.params.id);
    if (!brand) return res.status(404).json({ message: "العلامة غير موجودة" });

    if (name) brand.name = name;

    if (logoFile) {
      const upload = await cloudinary.uploader.upload(logoFile.tempFilePath, {
        folder: "ETS/brands",
      });
      brand.logo = upload.secure_url;
    }

    await brand.save();
    res.json({ message: "تم تحديث العلامة", brand });
  } catch (error) {
    console.error("❌ updateBrand:", error);
    res.status(500).json({ message: "فشل تحديث العلامة" });
  }
};

/* -------------------------  Delete  ------------------------- */
export const deleteBrand = async (req, res) => {
  try {
    const { deletedCount } = await Brand.deleteOne({ _id: req.params.id });
    if (!deletedCount)
      return res.status(404).json({ message: "العلامة غير موجودة" });

    res.json({ message: "تم حذف العلامة" });
  } catch (error) {
    console.error("❌ deleteBrand:", error);
    res.status(500).json({ message: "فشل حذف العلامة" });
  }
};
