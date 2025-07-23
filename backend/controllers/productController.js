import Product from "../models/Product.js";
import User from "../models/User.js";
import getProductPriceForUser from "../utils/getProductPriceForUser.js";
import cloudinary from "../utils/cloudinary.js";

// ---------------------------
// @desc    Get all products with price based on user tier/custom price
// @route   GET /api/products
// @access  Client/Admin
// ---------------------------
export const listProducts = async (req, res) => {
  try {
    const { search = "" } = req.query;
    const query = {};

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    const products = await Product.find(query).populate("brand");

    let user = null;
    if (req.user?.id) {
      user = await User.findById(req.user.id);
    }

    const formatted = products.map((product) => ({
      id: product._id,
      name: product.name,
      description: product.description,
      image: product.image,
      brand: product.brand,
      price: getProductPriceForUser(product, user), // Handle null user inside this function
      basePrices: product.basePrices,
    }));

    res.json(formatted);
  } catch (err) {
    console.error("❌ listProducts error:", err); // Add this line
    res.status(500).json({ message: "حدث خطأ في الخادم" });
  }
};

// ---------------------------
// @desc    Get product by ID with correct price
// @route   GET /api/products/:id
// @access  Client/Admin
// ---------------------------
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    // Check for invalid Mongo ObjectId
    if (!id || id.length !== 24) {
      return res.status(400).json({ message: "معرف المنتج غير صالح" });
    }

    const product = await Product.findById(id).populate("brand");
    if (!product) {
      return res.status(404).json({ message: "المنتج غير موجود" });
    }

    const user = await User.findById(req.user?.id);

    return res.json({
      _id: product._id, 
      name: product.name,
      description: product.description,
      image: product.image,
      brand: product.brand,
      price: getProductPriceForUser(product, user),
      basePrices: product.basePrices,
    });
  } catch (err) {
    console.error("getProductById error:", err);
    return res.status(500).json({ message: "حدث خطأ في الخادم" });
  }
};

// ---------------------------
// @desc    Create a new product
// @route   POST /api/products
// @access  Admin
// ---------------------------
export const createProduct = async (req, res) => {
  try {
    const { name, description, brand, basePrices } = req.body;
    const imageFile = req.files?.image;

    // Validation
    if (!name || !brand || !basePrices || !imageFile) {
      return res
        .status(400)
        .json({ message: "الاسم، العلامة، الصورة والأسعار مطلوبة" });
    }

    // Upload image to Cloudinary
    const upload = await cloudinary.uploader.upload(imageFile.tempFilePath, {
      folder: "ETS/products",
    });

    const product = await Product.create({
      name,
      description,
      brand,
      image: upload.secure_url,
      basePrices: JSON.parse(basePrices),
    });

    res.status(201).json({ message: "تم إنشاء المنتج", product });
  } catch (error) {
    console.error("❌ createProduct:", error);
    res.status(500).json({ message: "فشل إنشاء المنتج" });
  }
};

// ---------------------------
// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Admin
// ---------------------------
export const updateProduct = async (req, res) => {
  try {
    const { name, description, brand, basePrices } = req.body;
    const { image } = req.files || {};

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "المنتج غير موجود" });

    if (name) product.name = name;
    if (description) product.description = description;
    if (brand) product.brand = brand;

    if (basePrices) {
      product.basePrices =
        typeof basePrices === "string" ? JSON.parse(basePrices) : basePrices;
    }

    if (image) {
      const upload = await cloudinary.uploader.upload(image.tempFilePath, {
        folder: "ETS/products",
      });
      product.image = upload.secure_url;
    }

    await product.save();
    res.json({ message: "تم تحديث المنتج", product });
  } catch (err) {
    console.error("❌ updateProduct error:", err); // Add this for debugging
    res.status(500).json({ message: "حدث خطأ في الخادم" });
  }
};

// ---------------------------
// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Admin
// ---------------------------
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "المنتج غير موجود" });

    await product.deleteOne();
    res.json({ message: "تم حذف المنتج" });
  } catch (err) {
    res.status(500).json({ message: "حدث خطأ في الخادم" });
  }
};
