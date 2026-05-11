const express = require('express');
const Order = require('../models/Order');
const { requireAdmin } = require('../middleware/admin');

const router = express.Router();

function toClientOrder(doc) {
  const o = doc.toObject ? doc.toObject() : doc;
  const created = o.createdAt || new Date();
  const mongoId =
    o._id && typeof o._id.toString === 'function' ? o._id.toString() : null;
  return {
    id:
      o.legacyId != null
        ? o.legacyId
        : mongoId != null
          ? mongoId
          : new Date(created).getTime(),
    name: o.name,
    phone: o.phone,
    governorate: o.governorate,
    address: o.address,
    notes: o.notes || '',
    payment: o.payment,
    items: o.items || [],
    total: o.total,
    status: o.status,
    date: created instanceof Date ? created.toISOString() : new Date(created).toISOString(),
  };
}

/** POST /api/orders — public (checkout) */
router.post('/', async (req, res, next) => {
  try {
    const body = req.body;
    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return res.status(400).json({ error: 'items required' });
    }
    let legacyId = Date.now();
    if (
      typeof body.id === 'number' &&
      !Number.isNaN(body.id)
    )
      legacyId = body.id;
    else if (
      typeof body.id === 'string' &&
      body.id.trim() !== '' &&
      !Number.isNaN(Number(body.id))
    )
      legacyId = Number(body.id);

    const payIn = ['cod', 'vodafone', 'instapay'].includes(body.payment)
      ? body.payment
      : 'cod';

    const sumFromItems = body.items.reduce(
      (acc, i) =>
        acc + Number(i.price) * Math.max(1, Number(i.quantity) || 1),
      0
    );
    const totalFromBody = Number(body.total);
    const computedTotal =
      Number.isFinite(totalFromBody) && totalFromBody >= 0
        ? totalFromBody
        : sumFromItems;

    const doc = await Order.create({
      legacyId,
      name: String(body.name || '').trim(),
      phone: String(body.phone || '').trim(),
      governorate: String(body.governorate || '').trim(),
      address: String(body.address || '').trim(),
      notes: String(body.notes || ''),
      payment: payIn,
      items: body.items.map((i) => ({
        name: String(i.name || ''),
        color: i.color != null ? String(i.color) : '',
        quantity: Math.max(1, Number(i.quantity) || 1),
        price: Number(i.price),
      })),
      total: Number(Number(computedTotal).toFixed(2)),
      status: body.status && ['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(body.status)
        ? body.status
        : 'pending',
    });

    res.status(201).json(toClientOrder(doc));
  } catch (e) {
    if (e.code === 11000) return res.status(409).json({ error: 'Duplicate order id' });
    next(e);
  }
});

/** GET /api/orders — admin */
router.get('/', requireAdmin, async (req, res, next) => {
  try {
    const docs = await Order.find().sort({ createdAt: -1 }).exec();
    res.json(docs.map(toClientOrder));
  } catch (e) {
    next(e);
  }
});

function orderFilterFromParam(idParam) {
  const num = Number(idParam);
  return !Number.isNaN(num) && String(num) === String(idParam).trim()
    ? { legacyId: num }
    : { _id: idParam };
}

/** PATCH /api/orders/:id — admin (partial update) */
router.patch('/:id', requireAdmin, async (req, res, next) => {
  try {
    const filter = orderFilterFromParam(req.params.id);
    const body = req.body || {};
    const update = {};

    if (body.name != null) update.name = String(body.name).trim();
    if (body.phone != null) update.phone = String(body.phone).trim();
    if (body.governorate != null) update.governorate = String(body.governorate).trim();
    if (body.address != null) update.address = String(body.address).trim();
    if (body.notes != null) update.notes = String(body.notes);
    if (body.payment != null && ['cod', 'vodafone', 'instapay'].includes(body.payment)) {
      update.payment = body.payment;
    }
    if (
      body.status != null &&
      ['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(body.status)
    ) {
      update.status = body.status;
    }

    if (Object.keys(update).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    const doc = await Order.findOneAndUpdate(filter, { $set: update }, {
      new: true,
      runValidators: true,
    }).exec();
    if (!doc) return res.status(404).json({ error: 'Order not found' });
    res.json(toClientOrder(doc));
  } catch (e) {
    next(e);
  }
});

/** PATCH /api/orders/:id/status — admin body: { "status": "shipped" } */
router.patch('/:id/status', requireAdmin, async (req, res, next) => {
  try {
    const num = Number(req.params.id);
    const filter =
      !Number.isNaN(num) && String(num) === String(req.params.id).trim()
        ? { legacyId: num }
        : { _id: req.params.id };
    const status = req.body.status;
    if (!['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const doc = await Order.findOneAndUpdate(filter, { $set: { status } }, {
      new: true,
      runValidators: true,
    }).exec();
    if (!doc) return res.status(404).json({ error: 'Order not found' });
    res.json(toClientOrder(doc));
  } catch (e) {
    next(e);
  }
});

/** DELETE /api/orders/:id — admin */
router.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    const num = Number(req.params.id);
    const filter =
      !Number.isNaN(num) && String(num) === String(req.params.id).trim()
        ? { legacyId: num }
        : { _id: req.params.id };
    const r = await Order.deleteOne(filter).exec();
    if (r.deletedCount === 0) return res.status(404).json({ error: 'Order not found' });
    res.status(204).end();
  } catch (e) {
    next(e);
  }
});

module.exports = router;
