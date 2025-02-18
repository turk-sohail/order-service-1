const mongoose = require("mongoose");
const orderSchema = new mongoose.Schema({
  products: [
    {
      product_id: String,
    },
  ],
  user: String,
  total_price: Number,
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
