const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    name: String,
    color: String,
    quantity: Number,
    price: Number,
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    legacyId: { type: Number, unique: true, sparse: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    governorate: { type: String, required: true },
    address: { type: String, required: true },
    notes: { type: String, default: '' },
    payment: {
      type: String,
      required: true,
      enum: ['cod', 'vodafone', 'instapay'],
    },
    items: { type: [orderItemSchema], required: true },
    total: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      default: 'pending',
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
