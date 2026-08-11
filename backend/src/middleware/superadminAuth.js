function requireSuperAdmin(req, res, next) {
  if (!req.usuario) {
    return res.status(401).json({ error: 'No autenticado' });
  }

  const isSuperAdmin = req.usuario.rol === 'superadmin' || req.usuario.email === 'baileyjrm@gmail.com';
  if (!isSuperAdmin) {
    return res.status(403).json({ error: 'Acceso denegado: se requieren permisos de SuperAdmin' });
  }

  next();
}

module.exports = { requireSuperAdmin };
