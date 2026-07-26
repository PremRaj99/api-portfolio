import jwt from 'jsonwebtoken';

export function requireAdmin(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Unauthorized access. Token required.' });
    }

    const token = authHeader.split(' ')[1];
    const jwtSecret = process.env.JWT_SECRET || 'fallback-portfolio-admin-secret-2026';

    const decoded = jwt.verify(token, jwtSecret);
    const allowedAdmins = (process.env.ADMIN_EMAILS || 'web.premraj@gmail.com')
      .split(',')
      .map((e) => e.trim().toLowerCase());

    if (!decoded.email || !allowedAdmins.includes(decoded.email.toLowerCase())) {
      return res.status(403).json({ success: false, message: 'Forbidden: Admin access restricted.' });
    }

    req.adminUser = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired authentication token.' });
  }
}
