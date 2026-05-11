const mongoose = require('mongoose');
const { resolveSrvMongoUriViaHttps } = require('./srvHttpsResolve');

/** Helps with some IPv6 / routing issues once TCP connects. */
const CONNECT_OPTS = {
  serverSelectionTimeoutMS: 15000,
  socketTimeoutMS: 45000,
  family: 4,
};

function isSrvDnsLikelyBroken(err) {
  const msg = String(err.message || '');
  return msg.includes('querySrv') && (err.code === 'ECONNREFUSED' || msg.includes('ECONNREFUSED'));
}

/** Set MONGODB_SKIP_DOH_SRV=1 (or true/yes) to skip the DoH SRV workaround. */
function isDohSrvFallbackDisabled() {
  const v = (process.env.MONGODB_SKIP_DOH_SRV || '').toLowerCase();
  return v === '1' || v === 'true' || v === 'yes';
}

function printSrvTroubleshoot(uri, err) {
  if (!uri || !uri.startsWith('mongodb+srv://')) return;
  if (!isSrvDnsLikelyBroken(err)) return;
  console.error(`
--------------------------------------------------------------------
MongoDB: SRV via system DNS failed (common on Windows)

If automatic DNS-over-HTTPS fallback above also failed, try:

1) Paste Atlas STANDARD connection string (mongodb://…) into .env → MONGODB_URI
   (Atlas → Connect → Drivers → Node → copy mongodb://, not srv)

2) Windows: ipconfig /flushdns ; or set IPv4 DNS to 8.8.8.8 / 8.8.4.4

Driver error was: ${err.message || err.code}
--------------------------------------------------------------------
`);
}

async function connectDb() {
  let uri = process.env.MONGODB_URI?.trim();
  if (!uri) {
    throw new Error('MONGODB_URI is not set in .env');
  }
  mongoose.set('strictQuery', true);

  try {
    await mongoose.connect(uri, CONNECT_OPTS);
    return;
  } catch (err) {
    const canTryDoh =
      uri.startsWith('mongodb+srv://') &&
      isSrvDnsLikelyBroken(err) &&
      !isDohSrvFallbackDisabled();

    if (!canTryDoh) {
      printSrvTroubleshoot(uri, err);
      throw err;
    }

    console.warn(
      '[MongoDB] System SRV DNS failed — retrying via DNS-over-HTTPS (Cloudflare)…'
    );
    try {
      const resolved = await resolveSrvMongoUriViaHttps(uri);
      await mongoose.connect(resolved, CONNECT_OPTS);
      console.warn(
        '[MongoDB] Connected via DoH-resolved mongodb:// hosts. Optionally save that standard URI into MONGODB_URI to skip SRV.'
      );
    } catch (e2) {
      console.warn('[MongoDB] DNS-over-HTTPS fallback failed:', e2.message || e2);
      printSrvTroubleshoot(uri, err);
      throw err;
    }
  }
}

module.exports = { connectDb, mongoose };
