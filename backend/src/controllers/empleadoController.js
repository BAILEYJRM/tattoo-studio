const { Empleado } = require('../models/empleado');

const getEmpleados = async (req, res) => {
  try {
    const empleados = await Empleado.buscarTodos(req.usuario.estudio_id);
    res.json(empleados);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getEmpleado = async (req, res) => {
  try {
    const empleado = await Empleado.buscarPorId(req.params.id, req.usuario.estudio_id);
    if (!empleado) return res.status(404).json({ error: 'Empleado no encontrado' });
    res.json(empleado);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const crearEmpleado = async (req, res) => {
  try {
    req.body.estudio_id = req.usuario.estudio_id;
    const empleado = await Empleado.crear(req.body);
    res.status(201).json(empleado);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const actualizarEmpleado = async (req, res) => {
  try {
    const {
      nombre, apellidos, email, telefono, rol,
      nombre_artistico, comision_porcentaje, color_calendario, estilo_principal, instagram,
      puede_crear_citas, puede_ver_companeros, notificar_nueva_cita,
    } = req.body;
    const result = await require('../config/database').query(
      `UPDATE empleados SET
        nombre=$1, apellidos=$2, email=$3, telefono=$4, rol=$5,
        nombre_artistico=$6, comision_porcentaje=$7, color_calendario=$8,
        estilo_principal=$9, instagram=$10,
        puede_crear_citas=$11, puede_ver_companeros=$12, notificar_nueva_cita=$13
       WHERE id=$14 AND estudio_id=$15 RETURNING *`,
      [nombre, apellidos, email, telefono, rol,
       nombre_artistico, comision_porcentaje, color_calendario,
       estilo_principal, instagram,
       puede_crear_citas ?? true, puede_ver_companeros ?? true, notificar_nueva_cita ?? true,
       req.params.id, req.usuario.estudio_id]
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
      'UPDATE empleados SET activo=$1 WHERE id=$2 AND estudio_id=$3',
      [false, req.params.id, req.usuario.estudio_id]
    );
    res.json({ mensaje: 'Empleado desactivado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getEmpleados, getEmpleado, crearEmpleado, actualizarEmpleado, desactivarEmpleado };