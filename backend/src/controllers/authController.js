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
const crypto = require('crypto');

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const empleado = await Empleado.buscarPorEmail(email);
    
    if (!empleado) {
      // Return 200 even if not found to prevent email enumeration
      return res.json({ mensaje: 'Si el correo existe, se han enviado las instrucciones.' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 3600000); // 1 hour

    await Empleado.guardarTokenRecuperacion(email, token, expires);

    // Simular el envío de correo imprimiéndolo en consola
    const resetUrl = `http://localhost:3000/reset-password/${token}`;
    console.log(`\n======================================================`);
    console.log(`📧 SIMULACIÓN DE EMAIL (Recuperación de Contraseña)`);
    console.log(`Para: ${email}`);
    console.log(`Enlace de recuperación: ${resetUrl}`);
    console.log(`(Este token expirará en 1 hora)`);
    console.log(`======================================================\n`);

    res.json({ mensaje: 'Si el correo existe, se han enviado las instrucciones.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Datos incompletos.' });
    }

    const empleado = await Empleado.buscarPorTokenRecuperacion(token);
    
    if (!empleado) {
      return res.status(400).json({ error: 'El enlace es inválido o ha expirado.' });
    }

    await Empleado.actualizarPassword(empleado.id, newPassword);

    res.json({ mensaje: 'Contraseña actualizada correctamente.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { login, registro, forgotPassword, resetPassword };