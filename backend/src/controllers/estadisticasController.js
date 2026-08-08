const pool = require('../config/database');

// Helper: devuelve defaults de fecha si no se pasan
function rango(req) {
  const now = new Date();
  const inicio = req.query.fecha_inicio || `${now.getFullYear()}-01-01`;
  const fin    = req.query.fecha_fin    || now.toISOString().split('T')[0];
  return { inicio, fin };
}

// ── Resumen general ───────────────────────────────────────────────────────────
const getResumen = async (req, res) => {
  try {
    const { inicio, fin } = rango(req);

    const [citasR, clientesR, facturacionR, gastosR, consentR, distR] = await Promise.all([
      pool.query(
        `SELECT COUNT(*) AS total,
                ROUND(COUNT(*)::numeric / GREATEST(($2::date - $1::date + 1), 1), 2) AS media_diaria
         FROM citas WHERE fecha BETWEEN $1 AND $2 AND estado NOT IN ('cancelada')`,
        [inicio, fin]
      ),
      pool.query(
        `SELECT
           COUNT(DISTINCT c.cliente_id) AS clientes_periodo,
           COUNT(DISTINCT CASE WHEN cl.created_at BETWEEN $1 AND $2 THEN cl.id END) AS clientes_nuevos
         FROM citas c
         JOIN clientes cl ON cl.id = c.cliente_id
         WHERE c.fecha BETWEEN $1 AND $2 AND c.estado NOT IN ('cancelada')`,
        [inicio, fin]
      ),
      pool.query(
        `SELECT COALESCE(SUM(
           CASE WHEN c.precio IS NOT NULL THEN c.precio
                WHEN c.no_presentado THEN 0
                ELSE 0 END
         ), 0) AS total_servicios,
         COALESCE((SELECT SUM(total) FROM ventas WHERE fecha BETWEEN $1 AND $2 AND estado = 'pagado'), 0) AS total_productos
         FROM citas c
         WHERE c.fecha BETWEEN $1 AND $2 AND c.estado = 'completada'`,
        [inicio, fin]
      ),
      pool.query(
        `SELECT COALESCE(SUM(importe), 0) AS total FROM gastos WHERE fecha BETWEEN $1 AND $2`,
        [inicio, fin]
      ),
      pool.query(
        `SELECT COUNT(*) AS total FROM consentimientos WHERE DATE(firmado_en) BETWEEN $1 AND $2`,
        [inicio, fin]
      ),
      pool.query(
        `SELECT
           COUNT(*) FILTER (WHERE descripcion ILIKE '%tatuaje%' OR descripcion ILIKE '%tattoo%' OR tipo IS NULL OR tipo = 'tatuaje') AS tatuaje,
           COUNT(*) FILTER (WHERE descripcion ILIKE '%piercing%' OR tipo = 'piercing') AS piercing,
           COUNT(*) FILTER (WHERE descripcion ILIKE '%microblading%' OR descripcion ILIKE '%micro%' OR tipo = 'microblading') AS microblading,
           COUNT(*) FILTER (WHERE descripcion ILIKE '%laser%' OR descripcion ILIKE '%láser%' OR tipo = 'laser') AS laser
         FROM citas WHERE fecha BETWEEN $1 AND $2 AND estado NOT IN ('cancelada')`,
        [inicio, fin]
      ),
    ]);

    const servicios = Number(facturacionR.rows[0].total_servicios);
    const productos = Number(facturacionR.rows[0].total_productos);
    const gastos    = Number(gastosR.rows[0].total);
    const facturacion_total = servicios + productos;

    // Comisiones artistas
    const comR = await pool.query(
      `SELECT COALESCE(SUM(
         ROUND(COALESCE(c.precio,0) * COALESCE(c.comision_artista, e.comision_porcentaje, 0) / 100, 2)
       ), 0) AS total_comisiones
       FROM citas c
       LEFT JOIN empleados e ON e.id = c.artista_id
       WHERE c.fecha BETWEEN $1 AND $2 AND c.estado = 'completada'`,
      [inicio, fin]
    );

    res.json({
      periodo: { inicio, fin },
      citas_totales: Number(citasR.rows[0].total),
      media_diaria: Number(citasR.rows[0].media_diaria),
      clientes_periodo: Number(clientesR.rows[0].clientes_periodo),
      clientes_nuevos: Number(clientesR.rows[0].clientes_nuevos),
      facturacion_total: facturacion_total,
      ingresos_servicios: servicios,
      ingresos_productos: productos,
      total_gastos: gastos,
      total_comisiones: Number(comR.rows[0].total_comisiones),
      beneficio_total: facturacion_total - gastos,
      consentimientos_generados: Number(consentR.rows[0].total),
      distribucion_servicios: {
        tatuaje:     Number(distR.rows[0].tatuaje),
        piercing:    Number(distR.rows[0].piercing),
        microblading: Number(distR.rows[0].microblading),
        laser:       Number(distR.rows[0].laser),
      },
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// ── Rendimiento por artista ───────────────────────────────────────────────────
const getRendimientoArtistas = async (req, res) => {
  try {
    const { inicio, fin } = rango(req);
    const r = await pool.query(
      `SELECT
         e.id, e.nombre || ' ' || e.apellidos AS nombre, e.color_calendario,
         COUNT(c.id) AS trabajos,
         COALESCE(SUM(c.precio), 0) AS facturado,
         COALESCE(SUM(
           ROUND(COALESCE(c.precio,0) * COALESCE(c.comision_artista, e.comision_porcentaje, 0) / 100, 2)
         ), 0) AS comision,
         COALESCE(SUM(c.precio), 0) - COALESCE(SUM(
           ROUND(COALESCE(c.precio,0) * COALESCE(c.comision_artista, e.comision_porcentaje, 0) / 100, 2)
         ), 0) AS beneficio_estudio,
         CASE WHEN COUNT(c.id) > 0
              THEN ROUND(COALESCE(SUM(c.precio), 0) / COUNT(c.id), 2)
              ELSE 0 END AS media_por_trabajo,
         COUNT(DISTINCT c.cliente_id) AS clientes_unicos
       FROM empleados e
       LEFT JOIN citas c ON c.artista_id = e.id
         AND c.fecha BETWEEN $1 AND $2
         AND c.estado = 'completada'
       GROUP BY e.id, e.nombre, e.apellidos, e.color_calendario
       HAVING COUNT(c.id) > 0
       ORDER BY facturado DESC`,
      [inicio, fin]
    );
    res.json(r.rows.map((row) => ({
      ...row,
      trabajos: Number(row.trabajos),
      facturado: Number(row.facturado),
      comision: Number(row.comision),
      beneficio_estudio: Number(row.beneficio_estudio),
      media_por_trabajo: Number(row.media_por_trabajo),
      clientes_unicos: Number(row.clientes_unicos),
    })));
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// ── Top clientes ──────────────────────────────────────────────────────────────
const getTopClientes = async (req, res) => {
  try {
    const { inicio, fin } = rango(req);
    const limite = Math.min(parseInt(req.query.limite) || 10, 20);

    const [porCitas, porGasto] = await Promise.all([
      pool.query(
        `SELECT cl.nombre || ' ' || cl.apellidos AS cliente_nombre,
                COUNT(c.id) AS total_citas,
                COALESCE(SUM(c.precio), 0) AS total_gastado
         FROM citas c JOIN clientes cl ON cl.id = c.cliente_id
         WHERE c.fecha BETWEEN $1 AND $2 AND c.estado = 'completada'
         GROUP BY cl.id, cl.nombre, cl.apellidos
         ORDER BY total_citas DESC LIMIT $3`,
        [inicio, fin, limite]
      ),
      pool.query(
        `SELECT cl.nombre || ' ' || cl.apellidos AS cliente_nombre,
                COUNT(c.id) AS total_citas,
                COALESCE(SUM(c.precio), 0) AS total_gastado
         FROM citas c JOIN clientes cl ON cl.id = c.cliente_id
         WHERE c.fecha BETWEEN $1 AND $2 AND c.estado = 'completada' AND c.precio IS NOT NULL
         GROUP BY cl.id, cl.nombre, cl.apellidos
         ORDER BY total_gastado DESC LIMIT $3`,
        [inicio, fin, limite]
      ),
    ]);

    const fmt = (rows) => rows.map((r) => ({
      cliente_nombre: r.cliente_nombre,
      total_citas: Number(r.total_citas),
      total_gastado: Number(r.total_gastado),
    }));

    res.json({ por_citas: fmt(porCitas.rows), por_gasto: fmt(porGasto.rows) });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// ── Evolución mensual ─────────────────────────────────────────────────────────
const getEvolucionMensual = async (req, res) => {
  try {
    const anio = parseInt(req.query.año) || new Date().getFullYear();

    const [citasR, ventasR, gastosR, clientesR] = await Promise.all([
      pool.query(
        `SELECT EXTRACT(MONTH FROM fecha)::int AS mes,
                COALESCE(SUM(precio), 0) AS ingresos_servicios,
                COUNT(*) AS citas
         FROM citas
         WHERE EXTRACT(YEAR FROM fecha) = $1 AND estado = 'completada'
         GROUP BY mes ORDER BY mes`,
        [anio]
      ),
      pool.query(
        `SELECT EXTRACT(MONTH FROM fecha)::int AS mes, COALESCE(SUM(total), 0) AS ingresos_productos
         FROM ventas WHERE EXTRACT(YEAR FROM fecha) = $1 AND estado = 'pagado'
         GROUP BY mes ORDER BY mes`,
        [anio]
      ),
      pool.query(
        `SELECT EXTRACT(MONTH FROM fecha)::int AS mes, COALESCE(SUM(importe), 0) AS gastos
         FROM gastos WHERE EXTRACT(YEAR FROM fecha) = $1
         GROUP BY mes ORDER BY mes`,
        [anio]
      ),
      pool.query(
        `SELECT EXTRACT(MONTH FROM created_at)::int AS mes, COUNT(*) AS clientes_nuevos
         FROM clientes WHERE EXTRACT(YEAR FROM created_at) = $1
         GROUP BY mes ORDER BY mes`,
        [anio]
      ),
    ]);

    const MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    const resultado = MESES.map((nombre, idx) => {
      const m = idx + 1;
      const c = citasR.rows.find((r) => r.mes === m);
      const v = ventasR.rows.find((r) => r.mes === m);
      const g = gastosR.rows.find((r) => r.mes === m);
      const cl = clientesR.rows.find((r) => r.mes === m);
      const ingresos_servicios = Number(c?.ingresos_servicios || 0);
      const ingresos_productos = Number(v?.ingresos_productos || 0);
      const gastos = Number(g?.gastos || 0);
      const ingresos = ingresos_servicios + ingresos_productos;
      return {
        mes: nombre, mes_num: m,
        ingresos_servicios, ingresos_productos, ingresos,
        gastos, beneficio: ingresos - gastos,
        citas: Number(c?.citas || 0),
        clientes_nuevos: Number(cl?.clientes_nuevos || 0),
      };
    });

    res.json({ año: anio, meses: resultado });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// ── Distribución de edades ────────────────────────────────────────────────────
const getDistribucionEdades = async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT
         COUNT(*) FILTER (WHERE edad < 18)           AS menor_18,
         COUNT(*) FILTER (WHERE edad BETWEEN 18 AND 25) AS rango_18_25,
         COUNT(*) FILTER (WHERE edad BETWEEN 26 AND 35) AS rango_26_35,
         COUNT(*) FILTER (WHERE edad BETWEEN 36 AND 45) AS rango_36_45,
         COUNT(*) FILTER (WHERE edad BETWEEN 46 AND 55) AS rango_46_55,
         COUNT(*) FILTER (WHERE edad > 55)           AS mayor_55,
         COUNT(*) AS total
       FROM (
         SELECT DATE_PART('year', AGE(fecha_nacimiento))::int AS edad
         FROM clientes WHERE fecha_nacimiento IS NOT NULL AND activo = true
       ) sub`
    );
    const row = r.rows[0];
    const total = Number(row.total) || 1;
    const rangos = [
      { label: 'Menor de 18', count: Number(row.menor_18) },
      { label: '18 – 25',     count: Number(row.rango_18_25) },
      { label: '26 – 35',     count: Number(row.rango_26_35) },
      { label: '36 – 45',     count: Number(row.rango_36_45) },
      { label: '46 – 55',     count: Number(row.rango_46_55) },
      { label: 'Mayor de 55', count: Number(row.mayor_55) },
    ].map((r) => ({ ...r, porcentaje: Math.round((r.count / total) * 100) }));
    res.json({ total: Number(row.total), rangos });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// ── Métodos de pago ───────────────────────────────────────────────────────────
const getMetodosPago = async (req, res) => {
  try {
    const { inicio, fin } = rango(req);
    const r = await pool.query(
      `SELECT
         COALESCE(SUM(precio) FILTER (WHERE forma_pago = 'efectivo'), 0)       AS efectivo,
         COALESCE(SUM(precio) FILTER (WHERE forma_pago = 'tarjeta'), 0)        AS tarjeta,
         COALESCE(SUM(precio) FILTER (WHERE forma_pago = 'bizum'), 0)          AS bizum,
         COALESCE(SUM(precio) FILTER (WHERE forma_pago = 'transferencia'), 0)  AS transferencia,
         COALESCE(SUM(precio), 0) AS total
       FROM citas
       WHERE fecha BETWEEN $1 AND $2 AND estado = 'completada' AND forma_pago IS NOT NULL`,
      [inicio, fin]
    );
    const row = r.rows[0];
    const total = Number(row.total) || 1;
    const metodos = ['efectivo','tarjeta','bizum','transferencia'].map((k) => ({
      metodo: k,
      total: Number(row[k]),
      porcentaje: Math.round((Number(row[k]) / total) * 100),
    }));
    res.json({ total: Number(row.total), metodos });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// ── Impacto ecológico ─────────────────────────────────────────────────────────
const getImpactoEco = async (req, res) => {
  try {
    const r = await pool.query('SELECT COUNT(*) AS total FROM consentimientos');
    const consentimientos = Number(r.rows[0].total);
    const paginas = consentimientos * 3;
    res.json({
      consentimientos_digitales: consentimientos,
      paginas_ahorradas: paginas,
      agua_ahorrada_litros: paginas * 10,
      co2_evitado_kg: +(paginas * 0.005).toFixed(2),
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

module.exports = {
  getResumen, getRendimientoArtistas, getTopClientes,
  getEvolucionMensual, getDistribucionEdades, getMetodosPago, getImpactoEco,
};
