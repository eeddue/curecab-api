const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  client: String,
  address: String,
  courier: String,
  orderId: Number,
  delivery_fee: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    default: "pending",
  },
  delivered: {
    type: Boolean,
    default: false,
  },
  orderDate: {
    type: Date,
    default: Date.now(),
  },
  deliverBy: Date,
  span: Number,
  photoUrl: String,
});

const Order = mongoose.model("Orders", OrderSchema);
module.exports = Order;
