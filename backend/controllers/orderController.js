import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import mongoose from "mongoose";
import { generateReceiptBuffer } from "../utils/generateReceipt.js";

// Get actual price based on tier or custom (FIXED)
const getPrice = (product, user) => {
  const customPrices = user.customPrices || {}; // treat as plain object

  const custom = customPrices[product._id.toString()];
  if (custom !== undefined) {
    return custom; // use custom price
  }

  return product.basePrices[user.tier] || 0; // fallback to tier price
};

// 🛒 Create order (Client)
export const createOrder = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const { items, amountPaid } = req.body;

    if (!items || items.length === 0)
      return res.status(400).json({ message: "لا يوجد منتجات في الطلب" });

    let totalPrice = 0;
    const detailedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) return res.status(404).json({ message: "منتج غير موجود" });

      const price = getPrice(product, user);
      totalPrice += price * item.quantity;

      detailedItems.push({
        product: product._id,
        quantity: item.quantity,
        unitPrice: price,
      });
    }

    const order = new Order({
      user: user._id,
      items: detailedItems,
      totalPrice,
      amountPaid,
      remainingDebt: totalPrice - amountPaid,
    });

    await order.save(); // ✅ هذا كان مفقوداً

    user.totalDebt += order.remainingDebt;
    await user.save();

    res.status(201).json({ message: "تم إنشاء الطلب", order });
  } catch (error) {
    res.status(500).json({ message: "فشل إنشاء الطلب" });
  }
};

// 📦 Get my orders (Client)
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).populate(
      "items.product",
      "name image"
    );
    res.json(orders);
  } catch {
    res.status(500).json({ message: "فشل جلب الطلبات" });
  }
};

// 📑 Admin: Get all orders
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name tier")
      .populate("items.product", "name");
    res.json(orders);
  } catch {
    res.status(500).json({ message: "حدث خطأ عند جلب الطلبات" });
  }
};

// 🔁 Admin: Update order status
export const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "الطلب غير موجود" });

    const { status } = req.body;
    if (!["Pending", "Confirmed", "Delivered", "Paid"].includes(status)) {
      return res.status(400).json({ message: "حالة غير صالحة" });
    }

    order.status = status;
    await order.save();

    res.json({ message: "تم تحديث حالة الطلب", order });
  } catch {
    res.status(500).json({ message: "فشل تحديث حالة الطلب" });
  }
};

// 🛠️ Admin: Update full order (items, amountPaid, etc.)
export const updateOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("user");
    if (!order) return res.status(404).json({ message: "الطلب غير موجود" });

    const { items, amountPaid, status } = req.body;

    if (items && items.length > 0) {
      let totalPrice = 0;
      const updatedItems = [];

      for (const item of items) {
        const product = await Product.findById(item.product);
        if (!product)
          return res.status(404).json({ message: "منتج غير موجود" });

        const price = getPrice(product, order.user);
        totalPrice += price * item.quantity;

        updatedItems.push({
          product: product._id,
          quantity: item.quantity,
          unitPrice: price,
        });
      }

      order.items = updatedItems;
      order.totalPrice = totalPrice;
      order.remainingDebt = totalPrice - (amountPaid ?? order.amountPaid);
    }

    if (amountPaid !== undefined) {
      order.amountPaid = amountPaid;
      order.remainingDebt = order.totalPrice - amountPaid;
    }

    if (status && ["Pending", "Confirmed", "Paid"].includes(status)) {
      order.status = status;
    }

    order.user.totalDebt += order.remainingDebt;
    await order.user.save();
    await order.save();
    res.json({ message: "تم تحديث الطلب", order });
  } catch {
    res.status(500).json({ message: "فشل تحديث الطلب" });
  }
};

// ❌ Admin: Delete order
export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ message: "الطلب غير موجود" });
    res.json({ message: "تم حذف الطلب" });
  } catch {
    res.status(500).json({ message: "فشل حذف الطلب" });
  }
};

// 📥 PDF Receipt generation
export const viewReceiptOnce = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name phoneNumber _id")
      .populate("items.product", "name");

    if (!order) {
      return res.status(404).json({ message: "الطلب غير موجود" });
    }

    const isOwner = order.user._id.toString() === req.user.id;
    const isAdmin = req.user.isAdmin;

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: "غير مصرح" });
    }

    // ✅ Ensure _id is an ObjectId (without re-wrapping if it already is)
    const userId =
      order.user._id instanceof mongoose.Types.ObjectId
        ? order.user._id
        : new mongoose.Types.ObjectId(order.user._id);

    // ✅ Correct aggregation to calculate total debt
    const debtAgg = await Order.aggregate([
      {
        $match: {
          user: userId,
          remainingDebt: { $gt: 0 },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$remainingDebt" },
        },
      },
    ]);

    const totalDebt = debtAgg[0]?.total || 0;

    if (!order.receiptGenerated) {
      order.receiptGenerated = true;
      await order.save();
    }

    const response = {
      ...order.toObject(),
      user: {
        ...order.user.toObject(),
        totalDebt,
      },
    };

    res.json(response);
  } catch (error) {
    console.error("Receipt error:", error);
    res.status(500).json({ message: "فشل في عرض الإيصال" });
  }
};
