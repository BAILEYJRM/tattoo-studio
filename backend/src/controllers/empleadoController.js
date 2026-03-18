 const Empleado = require('../models/empleado');

const getEmpleados = async (req, res) => {
  try {
    const empleados = await Empleado.buscarTodos();
    res.json(empleados);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getEmpleado = async (req, res) => {
  try {
    const empleado = await Empleado.buscarPorId(req.params.id);
    if (!empleado) return res.status(404).json({ error: 'Empleado no encontrado' });
    res.json(empleado);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const crearEmpleado = async (req, res) => {
  try {
    const empleado = await Empleado.crear(req.body);
    res.status(201).json(empleado);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const actualizarEmpleado = async (req, res) => {
  try {
    const result = await require('../config/database').query(
      `UPDATE empleados SET nombre=$1, apellidos=$2, email=$3, telefono=$4, rol=$5
       WHERE id=$6 RETURNING id, nombre, apellidos, email, telefono, rol`,
      [req.body.nombre, req.body.apellidos, req.body.email, req.body.telefono, req.body.rol, req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Empleado no encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const desactivarEmpleado = async (req, res) => {
  try {
    await require('../config/database').query(
      'UPDATE empleados SET activo=$1 WHERE id=$2',
      [false, req.params.id]
    );
    res.json({ mensaje: 'Empleado desactivado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getEmpleados, getEmpleado, crearEmpleado, actualizarEmpleado, desactivarEmpleado };