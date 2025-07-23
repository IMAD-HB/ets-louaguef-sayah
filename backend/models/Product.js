import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    image: { type: String, required: true, trim: true },
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      required: true,
      index: true,
    },
    basePrices: {
      Retail: { type: Number, required: true, min: 0 },
      Wholesale: { type: Number, required: true, min: 0 },
      SuperWholesale: { type: Number, required: true, min: 0 },
    },
    inStock: { type: Boolean, default: true },
    quantityAvailable: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Optional: auto-update inStock based on quantityAvailable
productSchema.pre("save", function (next) {
  this.inStock = this.quantityAvailable > 0;
  next();
});

// Optional: enable full-text search on name/description
productSchema.index({ name: "text", description: "text" });

const Product = mongoose.model("Product", productSchema);
export default Product;
