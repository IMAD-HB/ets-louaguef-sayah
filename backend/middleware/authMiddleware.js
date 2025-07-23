import jwt from 'jsonwebtoken';

// Middleware to verify token from cookies and attach user info
export const protect = (req, res, next) => {
  const token = req.cookies.token; // 🔑 read from cookies

  if (!token) {
    return res.status(401).json({ message: 'غير مصرح: لا يوجد رمز دخول' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'رمز الدخول غير صالح' });
  }
};

// Optional middleware to enforce admin role
export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'غير مصرح: صلاحيات المسؤول مطلوبة' });
  }
};
