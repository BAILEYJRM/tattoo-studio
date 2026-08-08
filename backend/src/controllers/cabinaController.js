const Cabina = require('../models/cabina');
const pool = require('../config/database');

const getCabinas = async (req, res) => {
  try { res.json(await Cabina.buscarTodas()); }
  catch (err) { res.status(500).json({ error: err.message }); }
};

const getCabina = async (req, res) => {
  try {
    const c = await Cabina.buscarPorId(req.params.id);
    if (!c) return res.status(404).json({ error: 'Cabina no encontrada' });
    res.json(c);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const crearCabina = async (req, res) => {
  try { res.status(201).json(await Cabina.crear(req.body)); }
  catch (err) { res.status(500).json({ error: err.message }); }
};

const actualizarCabina = async (req, res) => {
  try {
    const c = await Cabina.actualizar(req.params.id, req.body);
    if (!c) return res.status(404).json({ error: 'Cabina no encontrada' });
    res.json(c);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const cambiarEstado = async (req, res) => {
  try {
    const { estado } = req.body;
    if (!['disponible', 'ocupada'].includes(estado))
      return res.status(400).json({ error: 'Estado inválido' });
    const c = await Cabina.cambiarEstado(req.params.id, estado);
    if (!c) return res.status(404).json({ error: 'Cabina no encontrada' });
    res.json(c);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const deleteCabina = async (req, res) => {
  try {
    const { id } = req.params;
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('UPDATE citas SET cabina_id = NULL WHERE cabina_id = $1', [id]);
      await client.query('DELETE FROM cabinas WHERE id = $1', [id]);
      await client.query('COMMIT');
      res.json({ message: 'Cabina eliminada correctamente' });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const bulkDeleteCabinas = async (req, res) => {
  const { ids } = req.body;
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'Se requieren ids para eliminar' });
  }
  try {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('UPDATE citas SET cabina_id = NULL WHERE cabina_id = ANY($1)', [ids]);
      await client.query('DELETE FROM cabinas WHERE id = ANY($1)', [ids]);
      await client.query('COMMIT');
      res.json({ message: `${ids.length} cabinas eliminadas correctamente` });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getCabinas, getCabina, crearCabina, actualizarCabina, cambiarEstado, deleteCabina, bulkDeleteCabinas };
