const pool = require('../config/database');

const getAllAlertas = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM alertas ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const resolverAlerta = async (req, res) => {
  const { id } = req.params;
  const empleado_id = req.user?.id; // asumiendo middleware auth
  try {
    const result = await pool.query(
      "UPDATE alertas SET estado = 'resuelta', resuelta_en = NOW(), resuelta_por = $1 WHERE id = $2 RETURNING *",
      [empleado_id, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Alerta no encontrada' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const scanAlertas = async (req, res) => {
  try {
    // 1. Obtener todos los productos
    const productosResult = await pool.query('SELECT id, nombre, stock_actual, stock_minimo, fecha_caducidad, categoria FROM productos WHERE activo = true');
    const productos = productosResult.rows;

    const hoy = new Date();
    const tresMeses = new Date();
    tresMeses.setMonth(hoy.getMonth() + 3);

    // 2. Generar alertas para cada producto
    const nuevasAlertas = [];

    for (const p of productos) {
      // Stock Crítico
      if (p.stock_actual <= p.stock_minimo) {
        nuevasAlertas.push({
          tipo: 'stock',
          gravedad: 'critica',
          titulo: 'Stock crítico',
          mensaje: `${p.nombre} - Stock actual: ${p.stock_actual} (crítico: ${p.stock_minimo})`,
          entidad_tipo: 'producto',
          entidad_id: p.id
        });
      }

      // Caducidad
      if (p.fecha_caducidad) {
        const cad = new Date(p.fecha_caducidad);
        if (cad < hoy) {
          nuevasAlertas.push({
            tipo: 'caducidad',
            gravedad: 'critica',
            titulo: 'Producto caducado',
            mensaje: `${p.nombre} - Caducó el ${cad.toLocaleDateString('es-ES')}`,
            entidad_tipo: 'producto',
            entidad_id: p.id
          });
        } else if (cad <= tresMeses) {
          nuevasAlertas.push({
            tipo: 'caducidad',
            gravedad: 'media',
            titulo: 'Producto próximo a caducar',
            mensaje: `${p.nombre} - Caduca el ${cad.toLocaleDateString('es-ES')}`,
            entidad_tipo: 'producto',
            entidad_id: p.id
          });
        }
      }
    }

    // 3. Obtener alertas pendientes actuales para no duplicar
    const pendientesResult = await pool.query("SELECT * FROM alertas WHERE estado = 'pendiente'");
    const pendientes = pendientesResult.rows;

    let generadas = 0;

    // 4. Insertar las nuevas si no existen
    for (const na of nuevasAlertas) {
      const existe = pendientes.find(a => a.tipo === na.tipo && a.entidad_tipo === na.entidad_tipo && a.entidad_id === na.entidad_id);
      if (!existe) {
        await pool.query(
          "INSERT INTO alertas (tipo, gravedad, titulo, mensaje, entidad_tipo, entidad_id) VALUES ($1, $2, $3, $4, $5, $6)",
          [na.tipo, na.gravedad, na.titulo, na.mensaje, na.entidad_tipo, na.entidad_id]
        );
        generadas++;
      }
    }

    res.json({ success: true, generadas });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getAllAlertas,
  resolverAlerta,
  scanAlertas
};
