 const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Empleado = require('../models/empleado');

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const empleado = await Empleado.buscarPorEmail(email);
    if (!empleado) return res.status(401).json({ error: 'Credenciales incorrectas' });

    const valido = await bcrypt.compare(password, empleado.password);
    if (!valido) return res.status(401).json({ error: 'Credenciales incorrectas' });

    const token = jwt.sign(
      { id: empleado.id, email: empleado.email, rol: empleado.rol, nombre: empleado.nombre },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({ token, usuario: { id: empleado.id, nombre: empleado.nombre, email: empleado.email, rol: empleado.rol } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const registro = async (req, res) => {
  try {
    const empleado = await Empleado.crear(req.body);
    res.status(201).json(empleado);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { login, registro };