const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    legacyId: { type: Number, unique: true, sparse: true },
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: ['men-classic', 'men-casual', 'women'],
    },
    price: { type: Number, required: true, min: 0 },
    oldPrice: { type: Number, min: 0, default: null },
    image: { type: String, required: true },
    images: { type: [String], default: [] },
    description: { type: String, default: '' },
    colors: { type: [String], default: [] },
    stockQuantity: { type: Number, default: 0, min: 0 },
    inStock: { type: Boolean, default: true },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviews: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
