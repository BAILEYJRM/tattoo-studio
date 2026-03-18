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
  email VARCHAR(150) UNIQUE,
  telefono VARCHAR(20),
  fecha_nacimiento DATE,
  notas TEXT,
  conflictivo BOOLEAN DEFAULT false,
  flexible BOOLEAN DEFAULT false,
  habla_ingles BOOLEAN DEFAULT false,
  es_cliente_estudio BOOLEAN DEFAULT false,
  no_shows INTEGER DEFAULT 0,
  tutor_legal_nombre VARCHAR(200),
  tutor_legal_dni VARCHAR(20),
  tutor_legal_telefono VARCHAR(20),
  dni_foto_delantera VARCHAR(255),
  dni_foto_trasera VARCHAR(255),
  info_medica TEXT,
  acepta_comunicaciones BOOLEAN DEFAULT true,
  acepta_redes BOOLEAN DEFAULT false,
  sexo VARCHAR(10),
  foto_perfil VARCHAR(255),
  instagram VARCHAR(100),
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

-- Cabinas
CREATE TABLE IF NOT EXISTS cabinas (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  estado VARCHAR(20) NOT NULL DEFAULT 'disponible',
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
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