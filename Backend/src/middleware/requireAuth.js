import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export default function requireAuth(req, _res, next) {
  const authHeader = req.headers.authorization || '';
  const [, token] = authHeader.split(' ');

  if (!token) {
    const err = new Error('No autenticado');
    err.status = 401;
    return next(err);
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET);
    // payload esperado: { id, rol, ... }
    req.user = { id: payload.id, rol: payload.rol };
    return next();
  } catch (_e) {
    const err = new Error('Token inválido o expirado');
    err.status = 401;
    return next(err);
  }
}
