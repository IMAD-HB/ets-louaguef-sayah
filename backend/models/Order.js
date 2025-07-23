import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, required: true },
  unitPrice: { type: Number, required: true },
});

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [orderItemSchema], 
    totalPrice: { type: Number, required: true },
    amountPaid: { type: Number, required: true },
    remainingDebt: { type: Number, required: true }, // 💡 only for this order
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Delivered", "Paid"],
      default: "Pending",
    },
    receiptGenerated: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
