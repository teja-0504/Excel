import jwt from 'jsonwebtoken';

export const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        console.error('JWT verification error:', err);
        return res.status(403).json({ message: 'Invalid or expired token' });
      }
      console.log('JWT verified user:', user); // Added logging for debugging
      req.user = user;
      next();
    });
  } else {
    console.error('Authorization token missing');
    res.status(401).json({ message: 'Authorization token missing' });
  }
};

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      console.error('Access denied: insufficient permissions for role:', req.user.role);
      return res.status(403).json({ message: 'Access denied: insufficient permissions' });
    }
    next();
  };
};
