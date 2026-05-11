/**
 * One-time (or idempotent) import of products from config.js into MongoDB.
 * Run: npm run seed
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { connectDb } = require('./db');
const Product = require('./models/Product');
const CONFIG = require('../config.js');

async function seed() {
  await connectDb();
  let created = 0;
  let skipped = 0;

  for (const p of CONFIG.products) {
    const images = p.images?.length ? p.images : [p.image];
    const existing = await Product.findOne({ legacyId: p.id }).exec();
    if (existing) {
      skipped++;
      continue;
    }
    const stockQty =
      p.stockQuantity != null && !Number.isNaN(Number(p.stockQuantity))
        ? Math.max(0, Math.floor(Number(p.stockQuantity)))
        : p.inStock === false
          ? 0
          : 25;

    await Product.create({
      legacyId: p.id,
      name: p.name,
      category: p.category,
      price: p.price,
      oldPrice: p.oldPrice ?? null,
      image: p.image,
      images,
      description: p.description || '',
      colors: p.colors || [],
      stockQuantity: stockQty,
      inStock: stockQty > 0,
      rating: p.rating ?? 0,
      reviews: p.reviews ?? 0,
    });
    created++;
  }

  // eslint-disable-next-line no-console
  console.log(`Seed done: ${created} created, ${skipped} already present.`);
  process.exit(0);
}

seed().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});
