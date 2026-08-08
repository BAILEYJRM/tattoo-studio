const pool = require('../config/database');

const getRecuentoDiario = async (req, res) => {
  try {
    const { fecha } = req.query;
    if (!fecha) return res.status(400).json({ error: 'Falta fecha' });

    // Citas del día (confirmadas y completadas)
    const citasRes = await pool.query(
      `SELECT
        c.id, c.hora_inicio, c.hora_fin, c.descripcion, c.estado,
        c.precio, c.importe_senal, c.senal_cobrada, c.forma_pago,
        cl.nombre || ' ' || cl.apellidos AS cliente_nombre,
        e.id AS artista_id,
        e.nombre || ' ' || e.apellidos AS artista_nombre,
        e.color_calendario AS artista_color,
        COALESCE(c.comision_artista, e.comision_porcentaje, 0) AS comision_porcentaje,
        ROUND(COALESCE(c.precio,0) * COALESCE(c.comision_artista, e.comision_porcentaje, 0) / 100, 2) AS comision_importe,
        ROUND(COALESCE(c.precio,0) - COALESCE(c.precio,0) * COALESCE(c.comision_artista, e.comision_porcentaje, 0) / 100, 2) AS beneficio_estudio
       FROM citas c
       LEFT JOIN clientes cl ON c.cliente_id = cl.id
       LEFT JOIN empleados e ON c.artista_id = e.id
       WHERE c.fecha = $1 AND c.estado IN ('confirmada','completada')
       ORDER BY c.hora_inicio`,
      [fecha]
    );
    const citas = citasRes.rows;

    // Ventas del día
    const ventasRes = await pool.query(
      `SELECT v.id, v.total, v.metodo_pago AS forma_pago, v.notas,
        cl.nombre || ' ' || cl.apellidos AS cliente_nombre
       FROM ventas v
       LEFT JOIN clientes cl ON v.cliente_id = cl.id
       WHERE v.fecha = $1 AND v.estado = 'pagado'
       ORDER BY v.created_at`,
      [fecha]
    );
    const ventas = ventasRes.rows;

    // Resumen por artista
    const porArtistaRes = await pool.query(
      `SELECT
        e.id, e.nombre || ' ' || e.apellidos AS artista_nombre, e.color_calendario,
        COUNT(*) AS trabajos,
        COALESCE(SUM(c.precio), 0) AS total_facturado,
        ROUND(COALESCE(SUM(c.precio * COALESCE(c.comision_artista, e.comision_porcentaje, 0) / 100), 0), 2) AS comision,
        ROUND(COALESCE(SUM(c.precio - c.precio * COALESCE(c.comision_artista, e.comision_porcentaje, 0) / 100), 0), 2) AS beneficio_estudio
       FROM citas c
       LEFT JOIN empleados e ON c.artista_id = e.id
       WHERE c.fecha = $1 AND c.estado IN ('confirmada','completada')
       GROUP BY e.id, e.nombre, e.apellidos, e.color_calendario
       ORDER BY total_facturado DESC`,
      [fecha]
    );

    // Calcular resumen global
    const totalServicios = citas.reduce((s, c) => s + Number(c.precio || 0), 0);
    const totalProductos = ventas.reduce((s, v) => s + Number(v.total || 0), 0);
    const totalSenales = citas.filter(c => c.senal_cobrada).reduce((s, c) => s + Number(c.importe_senal || 0), 0);
    const gananciasEstudio = citas.reduce((s, c) => s + Number(c.beneficio_estudio || 0), 0);
    const gananciasArtistas = citas.reduce((s, c) => s + Number(c.comision_importe || 0), 0);

    const formasPago = ['efectivo', 'tarjeta', 'bizum', 'transferencia'];
    const totalPorForma = {};
    formasPago.forEach((fp) => {
      const cit = citas.filter(c => c.forma_pago === fp).reduce((s, c) => s + Number(c.precio || 0), 0);
      const vent = ventas.filter(v => v.forma_pago === fp).reduce((s, v) => s + Number(v.total || 0), 0);
      totalPorForma[fp] = cit + vent;
    });

    res.json({
      citas,
      ventas,
      por_artista: porArtistaRes.rows,
      resumen: {
        total_servicios: totalServicios,
        total_productos: totalProductos,
        total_senales: totalSenales,
        ganancias_estudio: gananciasEstudio,
        ganancias_artistas: gananciasArtistas,
        total_dia: totalServicios + totalProductos,
        ...totalPorForma,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getLiquidacionArtista = async (req, res) => {
  try {
    const { artista_id, fecha_inicio, fecha_fin } = req.query;
    if (!artista_id || !fecha_inicio || !fecha_fin) {
      return res.status(400).json({ error: 'Faltan parámetros: artista_id, fecha_inicio, fecha_fin' });
    }

    const citasRes = await pool.query(
      `SELECT
        c.id, c.fecha, c.hora_inicio, c.hora_fin, c.descripcion, c.estado,
        c.precio, c.importe_senal, c.senal_cobrada, c.forma_pago,
        cl.nombre || ' ' || cl.apellidos AS cliente_nombre,
        COALESCE(c.comision_artista, e.comision_porcentaje, 0) AS comision_porcentaje,
        ROUND(COALESCE(c.precio,0) * COALESCE(c.comision_artista, e.comision_porcentaje, 0) / 100, 2) AS comision_importe,
        ROUND(COALESCE(c.precio,0) - COALESCE(c.precio,0) * COALESCE(c.comision_artista, e.comision_porcentaje, 0) / 100, 2) AS beneficio_estudio
       FROM citas c
       LEFT JOIN clientes cl ON c.cliente_id = cl.id
       LEFT JOIN empleados e ON c.artista_id = e.id
       WHERE c.artista_id = $1 AND c.fecha BETWEEN $2 AND $3
         AND c.estado IN ('confirmada','completada')
       ORDER BY c.fecha, c.hora_inicio`,
      [artista_id, fecha_inicio, fecha_fin]
    );
    const citas = citasRes.rows;

    const empRes = await pool.query(
      'SELECT nombre, apellidos, nombre_artistico, color_calendario, comision_porcentaje FROM empleados WHERE id=$1',
      [artista_id]
    );

    const totales = {
      total_trabajos: citas.length,
      total_facturado: citas.reduce((s, c) => s + Number(c.precio || 0), 0),
      total_senales: citas.filter(c => c.senal_cobrada).reduce((s, c) => s + Number(c.importe_senal || 0), 0),
      total_comision_artista: citas.reduce((s, c) => s + Number(c.comision_importe || 0), 0),
      total_beneficio_estudio: citas.reduce((s, c) => s + Number(c.beneficio_estudio || 0), 0),
    };

    res.json({ artista: empRes.rows[0], citas, totales });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getLiquidacionEstudio = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;
    if (!fecha_inicio || !fecha_fin) {
      return res.status(400).json({ error: 'Faltan parámetros: fecha_inicio, fecha_fin' });
    }

    // Ingresos servicios
    const serviciosRes = await pool.query(
      `SELECT
        COALESCE(SUM(c.precio), 0) AS total_servicios,
        ROUND(COALESCE(SUM(c.precio * COALESCE(c.comision_artista, e.comision_porcentaje, 0) / 100), 0), 2) AS total_comisiones,
        ROUND(COALESCE(SUM(c.precio - c.precio * COALESCE(c.comision_artista, e.comision_porcentaje, 0) / 100), 0), 2) AS beneficio_servicios,
        COUNT(*) AS num_servicios
       FROM citas c
       LEFT JOIN empleados e ON c.artista_id = e.id
       WHERE c.fecha BETWEEN $1 AND $2 AND c.estado IN ('confirmada','completada')`,
      [fecha_inicio, fecha_fin]
    );

    // Ingresos productos
    const productosRes = await pool.query(
      `SELECT COALESCE(SUM(v.total), 0) AS total_productos, COUNT(*) AS num_ventas
       FROM ventas v
       WHERE v.fecha BETWEEN $1 AND $2 AND v.estado = 'pagado'`,
      [fecha_inicio, fecha_fin]
    );

    // Gastos
    const gastosRes = await pool.query(
      `SELECT COALESCE(SUM(importe), 0) AS total_gastos, COUNT(*) AS num_gastos
       FROM gastos WHERE fecha BETWEEN $1 AND $2`,
      [fecha_inicio, fecha_fin]
    );

    // Desglose por artista
    const porArtistaRes = await pool.query(
      `SELECT
        e.nombre || ' ' || e.apellidos AS artista_nombre, e.color_calendario,
        COUNT(*) AS trabajos,
        COALESCE(SUM(c.precio), 0) AS facturado,
        ROUND(COALESCE(SUM(c.precio * COALESCE(c.comision_artista, e.comision_porcentaje, 0) / 100), 0), 2) AS comision,
        ROUND(COALESCE(SUM(c.precio - c.precio * COALESCE(c.comision_artista, e.comision_porcentaje, 0) / 100), 0), 2) AS beneficio_estudio
       FROM citas c
       LEFT JOIN empleados e ON c.artista_id = e.id
       WHERE c.fecha BETWEEN $1 AND $2 AND c.estado IN ('confirmada','completada')
       GROUP BY e.id, e.nombre, e.apellidos, e.color_calendario
       ORDER BY facturado DESC`,
      [fecha_inicio, fecha_fin]
    );

    // Artículos más vendidos
    const articulosRes = await pool.query(
      `SELECT vl.descripcion, SUM(vl.cantidad) AS cantidad, SUM(vl.subtotal) AS total
       FROM venta_lineas vl
       JOIN ventas v ON vl.venta_id = v.id
       WHERE v.fecha BETWEEN $1 AND $2 AND v.estado = 'pagado'
       GROUP BY vl.descripcion
       ORDER BY total DESC
       LIMIT 10`,
      [fecha_inicio, fecha_fin]
    );

    const s = serviciosRes.rows[0];
    const p = productosRes.rows[0];
    const g = gastosRes.rows[0];

    const total_ingresos = Number(s.total_servicios) + Number(p.total_productos);
    const beneficio_neto = total_ingresos - Number(g.total_gastos);

    res.json({
      resumen: {
        total_servicios: Number(s.total_servicios),
        total_comisiones: Number(s.total_comisiones),
        beneficio_servicios: Number(s.beneficio_servicios),
        num_servicios: Number(s.num_servicios),
        total_productos: Number(p.total_productos),
        num_ventas: Number(p.num_ventas),
        total_gastos: Number(g.total_gastos),
        num_gastos: Number(g.num_gastos),
        total_ingresos,
        beneficio_neto,
      },
      por_artista: porArtistaRes.rows,
      articulos: articulosRes.rows,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getRecuentoDiario, getLiquidacionArtista, getLiquidacionEstudio };
