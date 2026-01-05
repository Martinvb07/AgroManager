export default function requireOwner(req, _res, next) {
  const role = (req.user?.rol || '').toString().toLowerCase();

  if (role !== 'owner') {
    const err = new Error('Acceso restringido al dueño de la app');
    err.status = 403;
    return next(err);
  }

  return next();
}
