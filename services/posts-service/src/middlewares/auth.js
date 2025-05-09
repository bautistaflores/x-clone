// middlewares/auth.js
import jwt from 'jsonwebtoken';

export function verifyToken(req, res, next) {
  const { token } = req.cookies;
  
  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token inválido' });
  }
}
