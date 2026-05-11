const express = require('express');
const Product = require('../models/Product');
const { requireAdmin } = require('../middleware/admin');

const router = express.Router();

function resolveStock(plain) {
  let q = plain.stockQuantity;
  if (q == null || Number.isNaN(Number(q))) {
    q = plain.inStock !== false ? 50 : 0;
  } else {
    q = Math.max(0, Math.floor(Number(q)));
  }
  const inStock = q > 0;
  return { stockQuantity: q, inStock };
}

function toPublicProduct(d) {
  const plain = typeof d.toObject === 'function' ? d.toObject() : d;
  const idVal = plain.legacyId != null ? plain.legacyId : plain._id;
  const imgs = plain.images?.length ? plain.images : [plain.image];
  const { stockQuantity, inStock } = resolveStock(plain);
  return {
    id: idVal,
    name: plain.name,
    category: plain.category,
    price: plain.price,
    oldPrice: plain.oldPrice,
    image: plain.image,
    images: imgs,
    description: plain.description || '',
    colors: plain.colors || [],
    stockQuantity,
    inStock,
  };
}

function parseId(param) {
  const n = Number(param);
  if (!Number.isNaN(n) && String(n) === String(param).trim()) return { legacyId: n };
  return { mongoId: param };
}

/** GET /api/products — optional ?category= */
router.get('/', async (req, res, next) => {
  try {
    const q = {};
    if (req.query.category) q.category = req.query.category;
    const docs = await Product.find(q).sort({ legacyId: 1, createdAt: 1 }).exec();
    res.json(docs.map(toPublicProduct));
  } catch (e) {
    next(e);
  }
});

/** GET /api/products/:id */
router.get('/:id', async (req, res, next) => {
  try {
    const lookup = parseId(req.params.id);
    const doc = await Product.findOne(
      lookup.legacyId != null ? { legacyId: lookup.legacyId } : { _id: lookup.mongoId }
    ).exec();
    if (!doc) return res.status(404).json({ error: 'Product not found' });
    res.json(toPublicProduct(doc));
  } catch (e) {
    next(e);
  }
});

/** POST /api/products */
router.post('/', requireAdmin, async (req, res, next) => {
  try {
    const body = req.body;
    const legacyId =
      typeof body.id === 'number'
        ? body.id
        : body.id != null && !Number.isNaN(Number(body.id))
          ? Number(body.id)
          : Date.now();

    const images =
      Array.isArray(body.images) && body.images.length > 0
        ? body.images
        : body.image
          ? [body.image]
          : [];

    let stockQty =
      body.stockQuantity != null && body.stockQuantity !== ''
        ? Math.max(0, Math.floor(Number(body.stockQuantity)))
        : body.inStock === false
          ? 0
          : 10;

    const doc = await Product.create({
      legacyId,
      name: body.name,
      category: body.category,
      price: Number(body.price),
      oldPrice: body.oldPrice != null && body.oldPrice !== '' ? Number(body.oldPrice) : null,
      image: body.image || images[0],
      images,
      description: body.description || '',
      colors: Array.isArray(body.colors) ? body.colors : [],
      stockQuantity: stockQty,
      inStock: stockQty > 0,
      rating: body.rating != null ? Number(body.rating) : 4.5,
      reviews: body.reviews != null ? Number(body.reviews) : 0,
    });
    res.status(201).json(toPublicProduct(doc));
  } catch (e) {
    if (e.code === 11000) return res.status(409).json({ error: 'Duplicate product id' });
    next(e);
  }
});

/** PUT /api/products/:id */
router.put('/:id', requireAdmin, async (req, res, next) => {
  try {
    const lookup = parseId(req.params.id);
    const filter =
      lookup.legacyId != null ? { legacyId: lookup.legacyId } : { _id: lookup.mongoId };
    const body = req.body;
    const images =
      Array.isArray(body.images) && body.images.length > 0
        ? body.images
        : body.image
          ? [body.image]
          : undefined;

    const update = {};
    if (body.name != null) update.name = body.name;
    if (body.category != null) update.category = body.category;
    if (body.price != null) update.price = Number(body.price);
    if ('oldPrice' in body)
      update.oldPrice =
        body.oldPrice != null && body.oldPrice !== '' ? Number(body.oldPrice) : null;
    if (body.image != null) update.image = body.image;
    if (images) {
      update.images = images;
      update.image = body.image || images[0];
    }
    if (body.description != null) update.description = body.description;
    if (body.colors != null) update.colors = body.colors;
    if (body.stockQuantity != null && body.stockQuantity !== '') {
      const sq = Math.max(0, Math.floor(Number(body.stockQuantity)));
      update.stockQuantity = sq;
      update.inStock = sq > 0;
    } else if (typeof body.inStock === 'boolean') {
      update.inStock = body.inStock;
      if (body.inStock === false) update.stockQuantity = 0;
    }
    if (body.rating != null) update.rating = Number(body.rating);
    if (body.reviews != null) update.reviews = Number(body.reviews);

    const doc = await Product.findOneAndUpdate(filter, { $set: update }, {
      new: true,
      runValidators: true,
    }).exec();
    if (!doc) return res.status(404).json({ error: 'Product not found' });
    res.json(toPublicProduct(doc));
  } catch (e) {
    next(e);
  }
});

/** DELETE /api/products/:id */
router.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    const lookup = parseId(req.params.id);
    const filter =
      lookup.legacyId != null ? { legacyId: lookup.legacyId } : { _id: lookup.mongoId };
    const r = await Product.deleteOne(filter).exec();
    if (r.deletedCount === 0) return res.status(404).json({ error: 'Product not found' });
    res.status(204).end();
  } catch (e) {
    next(e);
  }
});

module.exports = router;
