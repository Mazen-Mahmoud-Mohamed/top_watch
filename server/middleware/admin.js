const { verifyAdminSessionToken } = require('../adminSession');

/**
 * Allows admin routes if:
 * - Authorization: Bearer <token> from POST /api/auth/admin-login, OR
 * - x-admin-key matches ADMIN_API_KEY (optional automation / legacy).
 */
function requireAdmin(req, res, next) {
  const auth = req.get('authorization') || '';
  const bearer =
    auth.startsWith('Bearer ') || auth.startsWith('bearer ')
      ? auth.slice(7).trim()
      : '';

  if (bearer && verifyAdminSessionToken(bearer)) return next();

  const apiKey = process.env.ADMIN_API_KEY;
  if (apiKey && apiKey.trim()) {
    const header = req.get('x-admin-key');
    if (header && header === apiKey) return next();
    return res.status(401).json({ error: 'Unauthorized' });
  }

  return res.status(401).json({
    error:
      'Unauthorized — log in from لوحة التحكم or set ADMIN_API_KEY for API access',
  });
}

module.exports = { requireAdmin };
