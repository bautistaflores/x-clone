import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'una_clave_secreta_segura';
const EXPIRES_IN = '1h';

export const generateToken = (userId) => {
  return jwt.sign(
    { userId: userId }, 
    JWT_SECRET, 
    { expiresIn: EXPIRES_IN }
  );
};

export const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};