const express = require('express');
const { signAdminSessionToken } = require('../adminSession');

const router = express.Router();

function getPanelPassword() {
  const p = process.env.ADMIN_PANEL_PASSWORD;
  if (p !== undefined && p !== null && String(p).trim() !== '')
    return String(p);
  if (process.env.NODE_ENV === 'production') return null;
  // eslint-disable-next-line no-console
  console.warn(
    '[auth] ADMIN_PANEL_PASSWORD missing in .env — using dev default admin123 (not for production)'
  );
  return 'admin123';
}

/**
 * POST /api/auth/admin-login
 * Body: { password: string }
 * Validates ADMIN_PANEL_PASSWORD from .env — returns Bearer token for admin APIs.
 */
router.post('/admin-login', (req, res) => {
  const expectedPass = getPanelPassword();
  if (!expectedPass) {
    return res.status(503).json({
      error:
        'ADMIN_PANEL_PASSWORD is not set. Add it to your .env file on the server.',
    });
  }

  const pwd =
    typeof req.body?.password === 'string' ? req.body.password : '';

  if (pwd !== expectedPass)
    return res.status(401).json({ error: 'كلمة مرور لوحة التحكم غير صحيحة' });

  const token = signAdminSessionToken();
  return res.json({ ok: true, token });
});

module.exports = router;
