import jwt from 'jsonwebtoken';

// Clave secreta para el JWT
const JWT_SECRET = process.env.JWT_SECRET
const EXPIRES_IN = '1h';

// Genera un token JWT para el usuario
export const generateToken = (userId) => {
  return jwt.sign(
    { userId: userId },
    JWT_SECRET, 
    { expiresIn: EXPIRES_IN }
  );
};

// Verifica un token JWT
export const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};