CREATE DATABASE IF NOT EXISTS agromanager CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE agromanager;

-- Tabla de parcelas
CREATE TABLE IF NOT EXISTS parcelas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  hectareas DECIMAL(10,2) NULL,
  cultivo VARCHAR(80) NULL,
  estado VARCHAR(40) NOT NULL DEFAULT 'Activa',
  inversion DECIMAL(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Tabla de trabajadores
CREATE TABLE IF NOT EXISTS trabajadores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  cargo VARCHAR(80) NULL,
  salario DECIMAL(12,2) NOT NULL DEFAULT 0,
  horas_trabajadas INT NOT NULL DEFAULT 0,
  estado VARCHAR(40) NOT NULL DEFAULT 'Activo',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Tabla ingresos (relaciona opcionalmente con parcela)
CREATE TABLE IF NOT EXISTS ingresos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  concepto VARCHAR(160) NOT NULL,
  monto DECIMAL(12,2) NOT NULL,
  fecha DATE NOT NULL,
  tipo VARCHAR(40) NOT NULL,
  parcela_id INT NULL,
  FOREIGN KEY (parcela_id) REFERENCES parcelas(id) ON DELETE SET NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Tabla egresos
CREATE TABLE IF NOT EXISTS egresos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  concepto VARCHAR(160) NOT NULL,
  monto DECIMAL(12,2) NOT NULL,
  fecha DATE NOT NULL,
  tipo VARCHAR(40) NOT NULL,
  categoria VARCHAR(80) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Tabla maquinaria
CREATE TABLE IF NOT EXISTS maquinaria (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(160) NOT NULL,
  tipo VARCHAR(80) NOT NULL,
  estado VARCHAR(40) NOT NULL DEFAULT 'Operativo',
  ultimo_mantenimiento DATE NULL,
  proximo_mantenimiento DATE NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Tabla semillas
CREATE TABLE IF NOT EXISTS semillas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tipo VARCHAR(160) NOT NULL,
  cantidad VARCHAR(40) NULL,
  proveedor VARCHAR(120) NULL,
  costo DECIMAL(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Tabla plagas
CREATE TABLE IF NOT EXISTS plagas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  nivel VARCHAR(40) NOT NULL,
  ubicacion VARCHAR(160) NULL,
  fecha DATE NOT NULL,
  tratamiento VARCHAR(120) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Tabla riego
CREATE TABLE IF NOT EXISTS riego (
  id INT AUTO_INCREMENT PRIMARY KEY,
  parcela_id INT NULL,
  tipo VARCHAR(80) NULL,
  ultimo_riego DATE NULL,
  proximo_riego DATE NULL,
  consumo_agua VARCHAR(40) NULL,
  FOREIGN KEY (parcela_id) REFERENCES parcelas(id) ON DELETE SET NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Tabla fertilizantes
CREATE TABLE IF NOT EXISTS fertilizantes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(160) NOT NULL,
  cantidad VARCHAR(40) NULL,
  fecha_aplicacion DATE NULL,
  parcela_id INT NULL,
  costo DECIMAL(12,2) NOT NULL DEFAULT 0,
  FOREIGN KEY (parcela_id) REFERENCES parcelas(id) ON DELETE SET NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Datos de ejemplo iniciales para parcelas
INSERT INTO parcelas (nombre, hectareas, cultivo, estado, inversion) VALUES
('Parcela Norte A', 12.5, 'Maíz', 'Activa', 25000),
('Parcela Sur B', 8.3, 'Soja', 'En preparación', 18000);

-- Trabajadores ejemplo
INSERT INTO trabajadores (nombre, cargo, salario, horas_trabajadas, estado) VALUES
('Juan Pérez', 'Operario', 2500, 160, 'Activo'),
('María González', 'Supervisor', 3500, 160, 'Activo');

-- Ingresos ejemplo
INSERT INTO ingresos (concepto, monto, fecha, tipo, parcela_id) VALUES
('Venta de Maíz', 85000, '2025-11-10', 'Venta', 1),
('Venta de Soja', 60750, '2025-11-08', 'Venta', 2);

-- Egresos ejemplo
INSERT INTO egresos (concepto, monto, fecha, tipo, categoria) VALUES
('Fertilizantes NPK', 15000, '2025-11-05', 'Insumos', 'Fertilizantes'),
('Combustible', 8500, '2025-11-07', 'Operación', 'Combustible');
