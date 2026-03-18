 const Cliente = require('../models/cliente');
const pool = require('../config/database');

const getClientes = async (req, res) => {
  try {
    const { buscar } = req.query;
    const clientes = buscar
      ? await Cliente.buscarPorNombre(buscar)
      : await Cliente.buscarTodos();
    res.json(clientes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getCliente = async (req, res) => {
  try {
    const cliente = await Cliente.buscarPorId(req.params.id);
    if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });
    res.json(cliente);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const crearCliente = async (req, res) => {
  try {
    const cliente = await Cliente.crear(req.body);
    res.status(201).json(cliente);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const actualizarCliente = async (req, res) => {
  try {
    const cliente = await Cliente.actualizar(req.params.id, req.body);
    if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });
    res.json(cliente);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getHistorialCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const [clienteRes, citasRes, consRes, ventasRes, imagenesRes] = await Promise.all([
      pool.query('SELECT * FROM clientes WHERE id = $1', [id]),
      pool.query(
        `SELECT c.*,
                e.nombre || ' ' || e.apellidos AS artista_nombre, e.color AS artista_color,
                cab.nombre AS cabina_nombre
         FROM citas c
         LEFT JOIN empleados e ON e.id = c.artista_id
         LEFT JOIN cabinas cab ON cab.id = c.cabina_id
         WHERE c.cliente_id = $1
         ORDER BY c.fecha DESC, c.hora_inicio DESC`,
        [id]
      ),
      pool.query(
        `SELECT con.*, e.nombre AS empleado_nombre, pc.nombre AS plantilla_nombre
         FROM consentimientos con
         LEFT JOIN empleados e ON e.id = con.empleado_id
         LEFT JOIN plantillas_consentimiento pc ON pc.id = con.plantilla_id
         WHERE con.cliente_id = $1
         ORDER BY con.created_at DESC`,
        [id]
      ),
      pool.query(
        `SELECT v.*, e.nombre AS empleado_nombre
         FROM ventas v
         LEFT JOIN empleados e ON e.id = v.empleado_id
         WHERE v.cliente_id = $1
         ORDER BY v.fecha DESC`,
        [id]
      ),
      pool.query(
        `SELECT ci.*, c.fecha AS cita_fecha, c.descripcion AS cita_descripcion, c.id AS cita_id_ref
         FROM cita_imagenes ci
         JOIN citas c ON c.id = ci.cita_id
         WHERE c.cliente_id = $1
         ORDER BY c.fecha DESC, ci.created_at DESC`,
        [id]
      ),
    ]);

    if (!clienteRes.rows[0]) return res.status(404).json({ error: 'Cliente no encontrado' });

    res.json({
      cliente: clienteRes.rows[0],
      citas: citasRes.rows,
      consentimientos: consRes.rows,
      ventas: ventasRes.rows,
      imagenes: imagenesRes.rows,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getDuplicados = async (req, res) => {
  try {
    const [telRes, emailRes] = await Promise.all([
      pool.query(
        `SELECT telefono, array_agg(id ORDER BY created_at ASC) AS ids
         FROM clientes
         WHERE telefono IS NOT NULL AND telefono != ''
         GROUP BY telefono HAVING count(*) > 1`
      ),
      pool.query(
        `SELECT email, array_agg(id ORDER BY created_at ASC) AS ids
         FROM clientes
         WHERE email IS NOT NULL AND email != ''
         GROUP BY email HAVING count(*) > 1`
      ),
    ]);

    const allIds = new Set();
    telRes.rows.forEach(r => r.ids.forEach(id => allIds.add(id)));
    emailRes.rows.forEach(r => r.ids.forEach(id => allIds.add(id)));

    if (allIds.size === 0) return res.json([]);

    const clientesRes = await pool.query(
      'SELECT * FROM clientes WHERE id = ANY($1) ORDER BY nombre, apellidos',
      [Array.from(allIds)]
    );
    const mapa = {};
    clientesRes.rows.forEach(c => { mapa[c.id] = c; });

    const grupos = [];
    const seen = new Set();

    const addGrupo = (ids, motivo) => {
      const key = [...ids].sort((a, b) => a - b).join('-');
      if (seen.has(key)) return;
      seen.add(key);
      grupos.push({ motivo, clientes: ids.map(id => mapa[id]).filter(Boolean) });
    };

    telRes.rows.forEach(r => addGrupo(r.ids, 'telefono'));
    emailRes.rows.forEach(r => addGrupo(r.ids, 'email'));

    res.json(grupos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const fusionarClientes = async (req, res) => {
  const { cliente_principal_id, duplicados_ids } = req.body;
  if (!cliente_principal_id || !duplicados_ids?.length) {
    return res.status(400).json({ error: 'Se requiere cliente_principal_id y duplicados_ids' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const dupId of duplicados_ids) {
      if (Number(dupId) === Number(cliente_principal_id)) continue;
      await client.query('UPDATE citas SET cliente_id=$1 WHERE cliente_id=$2', [cliente_principal_id, dupId]);
      await client.query('UPDATE consentimientos SET cliente_id=$1 WHERE cliente_id=$2', [cliente_principal_id, dupId]);
      await client.query('UPDATE ventas SET cliente_id=$1 WHERE cliente_id=$2', [cliente_principal_id, dupId]);
      await client.query('DELETE FROM clientes WHERE id=$1', [dupId]);
    }
    await client.query('COMMIT');
    const result = await pool.query('SELECT * FROM clientes WHERE id=$1', [cliente_principal_id]);
    res.json(result.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};

module.exports = { getClientes, getCliente, crearCliente, actualizarCliente, getHistorialCliente, getDuplicados, fusionarClientes };
