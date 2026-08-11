 const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  // Soporta token en header Authorization o como query param (?token=) para descarga de archivos
  const token = req.headers.authorization?.split(' ')[1] || req.query.token;
  if (!token) return res.status(401).json({ error: 'Token requerido' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decoded; // Now contains estudio_id
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido' });
  }
};

const soloAdmin = (req, res, next) => {
  if (req.usuario?.rol !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado: se requieren permisos de Administrador' });
  }
  next();
};

const soloGerenteOAdmin = (req, res, next) => {
  if (req.usuario?.rol !== 'admin' && req.usuario?.rol !== 'gerente') {
    return res.status(403).json({ error: 'Acceso denegado: se requieren permisos de Gerencia' });
  }
  next();
};

const esStaffComercial = (req, res, next) => {
  const rolesPermitidos = ['admin', 'gerente', 'recepcion', 'artista'];
  if (!rolesPermitidos.includes(req.usuario?.rol)) {
    return res.status(403).json({ error: 'Acceso denegado a funciones comerciales' });
  }
  next();
};

module.exports = { auth, soloAdmin, soloGerenteOAdmin, esStaffComercial };