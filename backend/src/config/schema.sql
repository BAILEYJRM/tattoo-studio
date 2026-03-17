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
  created_at TIMESTAMP DEFAULT NOW()
);

-- Citas
CREATE TABLE IF NOT EXISTS citas (
  id SERIAL PRIMARY KEY,
  cliente_id INTEGER REFERENCES clientes(id),
  artista_id INTEGER REFERENCES empleados(id),
  fecha DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  descripcion TEXT,
  estado VARCHAR(20) DEFAULT 'pendiente',
  precio DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT NOW()
);