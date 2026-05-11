const crypto = require('crypto');

/** Session lifetime after successful ADMIN_PANEL_PASSWORD login */
const TTL_MS = 48 * 60 * 60 * 1000;

function getSecret() {
  return (
    process.env.ADMIN_SESSION_SECRET ||
    process.env.ADMIN_PANEL_PASSWORD ||
    'topwatch-dev-change-me'
  );
}

function signAdminSessionToken() {
  const exp = Date.now() + TTL_MS;
  const payload = Buffer.from(JSON.stringify({ exp, v: 1 }), 'utf8').toString(
    'base64url'
  );
  const sig = crypto
    .createHmac('sha256', getSecret())
    .update(payload)
    .digest('base64url');
  return `${payload}.${sig}`;
}

function verifyAdminSessionToken(token) {
  if (!token || typeof token !== 'string') return false;
  const i = token.lastIndexOf('.');
  if (i <= 0) return false;
  const payloadB64 = token.slice(0, i);
  const sig = token.slice(i + 1);
  const expected = crypto
    .createHmac('sha256', getSecret())
    .update(payloadB64)
    .digest('base64url');
  if (sig.length !== expected.length) return false;
  try {
    if (
      !crypto.timingSafeEqual(Buffer.from(sig, 'utf8'), Buffer.from(expected, 'utf8'))
    )
      return false;
  } catch {
    return false;
  }
  try {
    const payload = JSON.parse(
      Buffer.from(payloadB64, 'base64url').toString('utf8')
    );
    if (!payload.exp || payload.exp < Date.now()) return false;
    return true;
  } catch {
    return false;
  }
}

module.exports = {
  signAdminSessionToken,
  verifyAdminSessionToken,
};
