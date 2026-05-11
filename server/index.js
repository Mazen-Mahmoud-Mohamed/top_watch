const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const express = require('express');
const cors = require('cors');

const { connectDb } = require('./db');
const productsRouter = require('./routes/products');
const ordersRouter = require('./routes/orders');
const authRouter = require('./routes/auth');

const app = express();
const PORT = Number(process.env.PORT) || 3000;

function buildCors() {
  const raw = process.env.CORS_ORIGINS;
  if (!raw || raw.trim() === '') return { origin: true, credentials: true };
  const list = raw.split(',').map((s) => s.trim()).filter(Boolean);
  return {
    origin: list.length <= 1 ? list[0] : list,
    credentials: true,
  };
}

app.use(cors(buildCors()));
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    service: 'topwatch-store',
    db: Boolean(require('mongoose').connection.readyState === 1),
  });
});

app.use('/api/auth', authRouter);
app.use('/api/products', productsRouter);
app.use('/api/orders', ordersRouter);

const publicDir = path.join(__dirname, '..');
app.use(express.static(publicDir));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Not found' });
  }
  return res.sendFile(path.join(publicDir, 'index.html'));
});

app.use((err, req, res, next) => {
  // eslint-disable-next-line no-console
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

async function main() {
  await connectDb();
  // eslint-disable-next-line no-console
  console.log('MongoDB connected');
  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Server listening on http://localhost:${PORT}`);
  });
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error('Failed to start:', e.message);
  process.exit(1);
});
