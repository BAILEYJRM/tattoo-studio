-- Estudios
CREATE TABLE IF NOT EXISTS estudios (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(200) NOT NULL,
  email_admin VARCHAR(150) NOT NULL,
  plan VARCHAR(50) DEFAULT 'basico',
  estado VARCHAR(20) DEFAULT 'activo',
  trial_ends_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Empleados
CREATE TABLE IF NOT EXISTS empleados (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  apellidos VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  telefono VARCHAR(20),
  rol VARCHAR(20) NOT NULL DEFAULT 'artista',
  activo BOOLEAN DEFAULT true,
  nombre_artistico VARCHAR(100),
  comision_porcentaje DECIMAL(5,2) DEFAULT 0,
  color_calendario VARCHAR(7) DEFAULT '#6366f1',
  estilo_principal VARCHAR(100),
  instagram VARCHAR(100),
  puede_crear_citas BOOLEAN DEFAULT true,
  puede_ver_companeros BOOLEAN DEFAULT true,
  notificar_nueva_cita BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Ausencias de empleados
CREATE TABLE IF NOT EXISTS ausencias_empleados (
  id SERIAL PRIMARY KEY,
  empleado_id INTEGER REFERENCES empleados(id) ON DELETE CASCADE,
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  hora_inicio TIME,
  hora_fin TIME,
  motivo VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Eventos de calendario
CREATE TABLE IF NOT EXISTS eventos_calendario (
  id SERIAL PRIMARY KEY,
  empleado_id INTEGER REFERENCES empleados(id),
  titulo VARCHAR(200) NOT NULL,
  descripcion TEXT,
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  tipo VARCHAR(30) DEFAULT 'otro',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Clientes
CREATE TABLE IF NOT EXISTS clientes (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  apellidos VARCHAR(100) NOT NULL,
  segundo_apellido VARCHAR(100),
  email VARCHAR(150) UNIQUE,
  dni VARCHAR(20),
  pais VARCHAR(100),
  provincia VARCHAR(100),
  localidad VARCHAR(100),
  direccion VARCHAR(255),
  codigo_postal VARCHAR(20),
  telefono VARCHAR(20),
  fecha_nacimiento DATE,
  notas TEXT,
  conflictivo BOOLEAN DEFAULT false,
  flexible BOOLEAN DEFAULT false,
  habla_ingles BOOLEAN DEFAULT false,
  es_cliente_estudio BOOLEAN DEFAULT false,
  activo BOOLEAN DEFAULT true,
  no_shows INTEGER DEFAULT 0,
  tutor_legal_nombre VARCHAR(200),
  tutor_legal_dni VARCHAR(20),
  tutor_legal_telefono VARCHAR(20),
  dni_foto_delantera VARCHAR(255),
  dni_foto_trasera VARCHAR(255),
  info_medica TEXT,
  acepta_comunicaciones BOOLEAN DEFAULT true,
  acepta_notificaciones_sistema BOOLEAN DEFAULT true,
  acepta_redes BOOLEAN DEFAULT false,
  cliente_pruebas BOOLEAN DEFAULT false,
  como_nos_conocio VARCHAR(100),
  sexo VARCHAR(10),
  foto_perfil VARCHAR(255),
  instagram VARCHAR(100),
  facebook VARCHAR(100),
  tiktok VARCHAR(100),
  twitter VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Cabinas
CREATE TABLE IF NOT EXISTS cabinas (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  estado VARCHAR(20) NOT NULL DEFAULT 'disponible',
  activo BOOLEAN DEFAULT true,
  tarifa_alquiler DECIMAL(10,2) DEFAULT 0,
  frecuencia_alquiler VARCHAR(20) DEFAULT 'semanal',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Booth Rental / Alquileres de Cabinas (EE.UU. / España)
CREATE TABLE IF NOT EXISTS alquileres_cabina (
  id SERIAL PRIMARY KEY,
  cabina_id INTEGER REFERENCES cabinas(id) ON DELETE CASCADE,
  artista_id INTEGER REFERENCES empleados(id) ON DELETE CASCADE,
  tarifa_monto DECIMAL(10,2) NOT NULL,
  frecuencia VARCHAR(20) DEFAULT 'semanal',
  fecha_proximo_pago DATE NOT NULL,
  estado VARCHAR(20) DEFAULT 'al dia',
  notas TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cobros_alquiler_cabina (
  id SERIAL PRIMARY KEY,
  alquiler_id INTEGER REFERENCES alquileres_cabina(id) ON DELETE CASCADE,
  monto DECIMAL(10,2) NOT NULL,
  fecha_pago DATE NOT NULL,
  metodo_pago VARCHAR(50) DEFAULT 'efectivo',
  notas TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Citas
CREATE TABLE IF NOT EXISTS citas (
  id SERIAL PRIMARY KEY,
  cliente_id INTEGER REFERENCES clientes(id),
  artista_id INTEGER REFERENCES empleados(id),
  cabina_id INTEGER REFERENCES cabinas(id),
  fecha DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  descripcion TEXT,
  tipo VARCHAR(50) DEFAULT 'tatuaje',
  estado VARCHAR(20) DEFAULT 'pendiente',
  precio DECIMAL(10,2),
  importe_senal DECIMAL(10,2) DEFAULT 0,
  senal_cobrada BOOLEAN DEFAULT false,
  forma_pago VARCHAR(20),
  no_presentado BOOLEAN DEFAULT false,
  comision_artista DECIMAL(5,2),
  notas_internas TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Imágenes de citas
CREATE TABLE IF NOT EXISTS cita_imagenes (
  id SERIAL PRIMARY KEY,
  cita_id INTEGER REFERENCES citas(id) ON DELETE CASCADE,
  tipo VARCHAR(20) DEFAULT 'referencia',
  imagen_path VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Productos (inventario)
CREATE TABLE IF NOT EXISTS productos (
  id SERIAL PRIMARY KEY,
  sku VARCHAR(100) UNIQUE NOT NULL,
  nombre VARCHAR(200) NOT NULL,
  descripcion TEXT,
  categoria VARCHAR(50) NOT NULL DEFAULT 'otros',
  codigo_barras VARCHAR(100),
  precio_compra DECIMAL(10,2),
  precio_venta DECIMAL(10,2),
  stock_actual INTEGER DEFAULT 0,
  stock_minimo INTEGER DEFAULT 0,
  lote VARCHAR(100),
  fecha_caducidad DATE,
  proveedor VARCHAR(200),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tintas
CREATE TABLE IF NOT EXISTS tintas (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(200) NOT NULL,
  marca VARCHAR(100),
  color VARCHAR(100),
  codigo VARCHAR(100),
  numero_lote VARCHAR(100),
  fecha_caducidad DATE,
  homologada BOOLEAN DEFAULT true,
  producto_id INTEGER REFERENCES productos(id),
  activa BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Agujas
CREATE TABLE IF NOT EXISTS agujas (
  id SERIAL PRIMARY KEY,
  marca VARCHAR(100),
  modelo VARCHAR(100),
  tipo VARCHAR(100),
  numero_lote VARCHAR(100),
  fecha_caducidad DATE,
  fecha_fabricacion DATE,
  producto_id INTEGER REFERENCES productos(id),
  activa BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Preferencias de Artistas: Tintas
CREATE TABLE IF NOT EXISTS artista_tintas_defecto (
  empleado_id INTEGER REFERENCES empleados(id) ON DELETE CASCADE,
  tinta_id INTEGER REFERENCES tintas(id) ON DELETE CASCADE,
  PRIMARY KEY (empleado_id, tinta_id)
);

-- Preferencias de Artistas: Agujas
CREATE TABLE IF NOT EXISTS artista_agujas_defecto (
  empleado_id INTEGER REFERENCES empleados(id) ON DELETE CASCADE,
  aguja_id INTEGER REFERENCES agujas(id) ON DELETE CASCADE,
  PRIMARY KEY (empleado_id, aguja_id)
);

-- Movimientos de stock
CREATE TABLE IF NOT EXISTS movimientos_stock (
  id SERIAL PRIMARY KEY,
  producto_id INTEGER REFERENCES productos(id),
  tipo VARCHAR(20) NOT NULL,
  cantidad INTEGER NOT NULL,
  motivo VARCHAR(50),
  referencia_id INTEGER,
  notas TEXT,
  empleado_id INTEGER REFERENCES empleados(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Ventas
CREATE TABLE IF NOT EXISTS ventas (
  id SERIAL PRIMARY KEY,
  cliente_id INTEGER REFERENCES clientes(id),
  cita_id INTEGER REFERENCES citas(id),
  fecha DATE NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  metodo_pago VARCHAR(20) DEFAULT 'efectivo',
  estado VARCHAR(20) DEFAULT 'pagado',
  notas TEXT,
  empleado_id INTEGER REFERENCES empleados(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Líneas de venta
CREATE TABLE IF NOT EXISTS venta_lineas (
  id SERIAL PRIMARY KEY,
  venta_id INTEGER REFERENCES ventas(id) ON DELETE CASCADE,
  tipo VARCHAR(20) NOT NULL DEFAULT 'servicio',
  producto_id INTEGER REFERENCES productos(id),
  descripcion TEXT NOT NULL,
  cantidad INTEGER NOT NULL DEFAULT 1,
  precio_unitario DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL
);

-- Limpiezas de cabinas
CREATE TABLE IF NOT EXISTS limpiezas (
  id SERIAL PRIMARY KEY,
  cabina_id INTEGER REFERENCES cabinas(id),
  empleado_id INTEGER REFERENCES empleados(id),
  tipo VARCHAR(50) NOT NULL,
  fecha DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fin TIME,
  observaciones TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Incidencias de cabinas
CREATE TABLE IF NOT EXISTS incidencias (
  id SERIAL PRIMARY KEY,
  cabina_id INTEGER REFERENCES cabinas(id),
  empleado_id INTEGER REFERENCES empleados(id),
  titulo VARCHAR(200) NOT NULL,
  descripcion TEXT,
  foto_path VARCHAR(500),
  estado VARCHAR(20) NOT NULL DEFAULT 'abierta',
  fecha DATE NOT NULL,
  resuelta_en TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Plantillas de consentimiento
CREATE TABLE IF NOT EXISTS plantillas_consentimiento (
  id SERIAL PRIMARY KEY,
  tipo VARCHAR(50) NOT NULL,
  nombre VARCHAR(200) NOT NULL,
  contenido TEXT NOT NULL,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Consentimientos firmados
CREATE TABLE IF NOT EXISTS consentimientos (
  id SERIAL PRIMARY KEY,
  cliente_id INTEGER REFERENCES clientes(id),
  cita_id INTEGER REFERENCES citas(id),
  plantilla_id INTEGER REFERENCES plantillas_consentimiento(id),
  tipo VARCHAR(50) NOT NULL,
  datos_cliente JSONB NOT NULL,
  firma_imagen TEXT,
  pdf_path VARCHAR(500),
  firmado_en TIMESTAMP,
  empleado_id INTEGER REFERENCES empleados(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Gastos
CREATE TABLE IF NOT EXISTS gastos (
  id SERIAL PRIMARY KEY,
  fecha DATE NOT NULL,
  concepto VARCHAR(300) NOT NULL,
  tipo VARCHAR(30) NOT NULL DEFAULT 'fijo',
  categoria VARCHAR(50) DEFAULT 'otros',
  importe DECIMAL(10,2) NOT NULL,
  proveedor VARCHAR(200),
  producto_id INTEGER REFERENCES productos(id),
  notas TEXT,
  empleado_id INTEGER REFERENCES empleados(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Configuración
CREATE TABLE IF NOT EXISTS configuracion_estudio (
  clave VARCHAR(100) PRIMARY KEY,
  valor TEXT,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Días festivos
CREATE TABLE IF NOT EXISTS dias_festivos (
  id SERIAL PRIMARY KEY,
  fecha DATE UNIQUE NOT NULL,
  descripcion VARCHAR(200),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Alertas
CREATE TABLE IF NOT EXISTS alertas (
  id SERIAL PRIMARY KEY,
  tipo VARCHAR(50) NOT NULL,
  gravedad VARCHAR(20) DEFAULT 'media',
  titulo VARCHAR(200) NOT NULL,
  mensaje TEXT,
  entidad_tipo VARCHAR(50),
  entidad_id INTEGER,
  estado VARCHAR(20) DEFAULT 'pendiente',
  resuelta_por INTEGER REFERENCES empleados(id),
  resuelta_en TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Leads
CREATE TABLE IF NOT EXISTS leads (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  telefono VARCHAR(20),
  email VARCHAR(150),
  instagram VARCHAR(100),
  origen VARCHAR(50) NOT NULL,
  fecha_entrada TIMESTAMP DEFAULT NOW(),
  artista_solicitado INTEGER REFERENCES empleados(id),
  estilo_solicitado VARCHAR(100),
  descripcion TEXT,
  notas_internas TEXT,
  responsable_id INTEGER REFERENCES empleados(id),
  estado VARCHAR(30) DEFAULT 'Nuevo',
  proyecto_id INTEGER REFERENCES proyectos(id),
  cliente_id INTEGER REFERENCES clientes(id)
);

-- Proyectos
CREATE TABLE IF NOT EXISTS proyectos (
  id SERIAL PRIMARY KEY,
  cliente_id INTEGER REFERENCES clientes(id) ON DELETE SET NULL,
  nombre VARCHAR(200) NOT NULL,
  descripcion TEXT,
  zona_corporal VARCHAR(100),
  estilo VARCHAR(100),
  color BOOLEAN DEFAULT true,
  tamaño_aproximado VARCHAR(50),
  artista_id INTEGER REFERENCES empleados(id),
  sesiones_estimadas INTEGER,
  duracion_estimada VARCHAR(50),
  precio_estimado DECIMAL(10,2),
  estado VARCHAR(30) DEFAULT 'Nuevo',
  referencias TEXT,
  notas_internas TEXT,
  fecha_creacion TIMESTAMP DEFAULT NOW(),
  origen_comercial VARCHAR(100)
);

-- Presupuestos (Quotes)
CREATE TABLE IF NOT EXISTS presupuestos (
  id SERIAL PRIMARY KEY,
  cliente_id INTEGER REFERENCES clientes(id),
  proyecto_id INTEGER REFERENCES proyectos(id),
  artista_id INTEGER REFERENCES empleados(id),
  fecha DATE DEFAULT CURRENT_DATE,
  validez DATE,
  servicios TEXT,
  sesiones_estimadas INTEGER,
  precio_por_sesion DECIMAL(10,2),
  horas_estimadas DECIMAL(5,2),
  precio_fijo DECIMAL(10,2),
  descuento DECIMAL(5,2) DEFAULT 0,
  impuesto DECIMAL(5,2) DEFAULT 0,
  deposito_requerido DECIMAL(10,2),
  total_estimado DECIMAL(10,2),
  observaciones TEXT,
  condiciones TEXT,
  politica_cancelacion TEXT,
  estado VARCHAR(30) DEFAULT 'Borrador',
  creado_en TIMESTAMP DEFAULT NOW()
);

-- Token seguro para presupuesto público
CREATE TABLE IF NOT EXISTS quote_tokens (
  token VARCHAR(64) PRIMARY KEY,
  presupuesto_id INTEGER REFERENCES presupuestos(id) ON DELETE CASCADE,
  creado_en TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP
);

-- Seguimientos
CREATE TABLE IF NOT EXISTS seguimientos (
  id SERIAL PRIMARY KEY,
  lead_id INTEGER REFERENCES leads(id) ON DELETE SET NULL,
  proyecto_id INTEGER REFERENCES proyectos(id) ON DELETE SET NULL,
  fecha_hora TIMESTAMP NOT NULL,
  responsable_id INTEGER REFERENCES empleados(id),
  motivo VARCHAR(200),
  estado VARCHAR(30) DEFAULT 'Pendiente',
  notas TEXT
);

-- Actividad (timeline)
CREATE TABLE IF NOT EXISTS actividad (
  id SERIAL PRIMARY KEY,
  entidad_tipo VARCHAR(50) NOT NULL,
  entidad_id INTEGER NOT NULL,
  usuario_id INTEGER REFERENCES empleados(id),
  accion VARCHAR(100) NOT NULL,
  detalle JSONB,
  creado_en TIMESTAMP DEFAULT NOW()
);

-- Motivos de pérdida (lookup)
CREATE TABLE IF NOT EXISTS motivos_perdida (
  id SERIAL PRIMARY KEY,
  descripcion VARCHAR(200) NOT NULL
);