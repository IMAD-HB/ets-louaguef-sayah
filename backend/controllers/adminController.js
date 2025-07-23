import Order from "../models/Order.js";
import User from "../models/User.js";
import Product from "../models/Product.js";

export const createOrderForClient = async (req, res) => {
  try {
    const { user, items, amountPaid } = req.body;

    if (!user || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "الرجاء تعبئة جميع الحقول" });
    }

    const client = await User.findById(user);
    if (!client || client.role !== "client") {
      return res.status(404).json({ message: "الزبون غير موجود" });
    }

    let totalPrice = 0;
    const enrichedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) continue;

      const price = product.basePrices[client.tier] || 0;
      const subtotal = price * item.quantity;
      totalPrice += subtotal;

      enrichedItems.push({
        product: product._id,
        quantity: item.quantity,
        unitPrice: price,
      });
    }

    const remainingDebt = totalPrice - amountPaid;

    const order = await Order.create({
      user: client._id,
      items: enrichedItems,
      totalPrice,
      amountPaid,
      remainingDebt,
    });

    // Update user's totalDebt
    client.totalDebt = (client.totalDebt || 0) + remainingDebt;
    await client.save();

    res.status(201).json(order);
  } catch (err) {
    console.error("❌ Failed to create admin order:", err);
    res.status(500).json({ message: "حدث خطأ أثناء إنشاء الطلب" });
  }
};

export const getAdminSummary = async (req, res) => {
  try {
    const clientCount = await User.countDocuments({ role: "client" });
    const orderCount = await Order.countDocuments();

    // Total debt from clients
    const totalDebt = await User.aggregate([
      { $match: { role: "client" } }, // Only consider clients
      {
        $group: {
          _id: null,
          totalDebt: { $sum: "$totalDebt" },
        },
      },
    ]);

    res.json({
      clientCount,
      orderCount,
      totalDebt: totalDebt[0]?.totalDebt || 0,
    });
  } catch (err) {
    res.status(500).json({ message: "حدث خطأ في الخادم", error: err.message });
  }
};
