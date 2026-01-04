CREATE DATABASE IF NOT EXISTS agromanager CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE agromanager;

-- Tabla de parcelas (multi-tenant por usuario)
CREATE TABLE IF NOT EXISTS parcelas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  hectareas DECIMAL(10,2) NULL,
  cultivo VARCHAR(80) NULL,
  estado VARCHAR(40) NOT NULL DEFAULT 'Activa',
  inversion DECIMAL(12,2) NOT NULL DEFAULT 0,
  usuario_id INT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_parcelas_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Tabla de trabajadores
CREATE TABLE IF NOT EXISTS trabajadores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  cargo VARCHAR(80) NULL,
  salario DECIMAL(12,2) NOT NULL DEFAULT 0,
  horas_trabajadas INT NOT NULL DEFAULT 0,
  estado VARCHAR(40) NOT NULL DEFAULT 'Activo',
  usuario_id INT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_trabajadores_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Tabla ingresos (relaciona opcionalmente con parcela)
CREATE TABLE IF NOT EXISTS ingresos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  concepto VARCHAR(160) NOT NULL,
  monto DECIMAL(12,2) NOT NULL,
  fecha DATE NOT NULL,
  tipo VARCHAR(40) NOT NULL,
  parcela_id INT NULL,
  usuario_id INT NULL,
  FOREIGN KEY (parcela_id) REFERENCES parcelas(id) ON DELETE SET NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_ingresos_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Tabla egresos
CREATE TABLE IF NOT EXISTS egresos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  concepto VARCHAR(160) NOT NULL,
  monto DECIMAL(12,2) NOT NULL,
  fecha DATE NOT NULL,
  tipo VARCHAR(40) NOT NULL,
  categoria VARCHAR(80) NULL,
  usuario_id INT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_egresos_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Tabla maquinaria
CREATE TABLE IF NOT EXISTS maquinaria (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(160) NOT NULL,
  tipo VARCHAR(80) NOT NULL,
  estado VARCHAR(40) NOT NULL DEFAULT 'Operativo',
  ultimo_mantenimiento DATE NULL,
  proximo_mantenimiento DATE NULL,
  usuario_id INT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_maquinaria_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Tabla semillas
CREATE TABLE IF NOT EXISTS semillas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tipo VARCHAR(160) NOT NULL,
  cantidad VARCHAR(40) NULL,
  proveedor VARCHAR(120) NULL,
  costo DECIMAL(12,2) NOT NULL DEFAULT 0,
  usuario_id INT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_semillas_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Tabla plagas
CREATE TABLE IF NOT EXISTS plagas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  nivel VARCHAR(40) NOT NULL,
  ubicacion VARCHAR(160) NULL,
  fecha DATE NOT NULL,
  tratamiento VARCHAR(120) NULL,
  usuario_id INT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_plagas_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
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
  usuario_id INT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_riego_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
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
  usuario_id INT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_fertilizantes_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Tabla campanas (campañas agrícolas)
CREATE TABLE IF NOT EXISTS campanas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(160) NOT NULL,
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  hectareas DECIMAL(10,2) NULL,
  lotes INT NULL,
  inversion_total DECIMAL(12,2) NOT NULL DEFAULT 0,
  gastos_operativos DECIMAL(12,2) NOT NULL DEFAULT 0,
  ingreso_total DECIMAL(12,2) NOT NULL DEFAULT 0,
  rendimiento_ha DECIMAL(10,2) NULL,
  produccion_total DECIMAL(12,2) NULL,
  usuario_id INT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_campanas_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Registros diarios por campaña (avance de cosecha)
CREATE TABLE IF NOT EXISTS campanas_diario (
  id INT AUTO_INCREMENT PRIMARY KEY,
  campana_id INT NOT NULL,
  fecha DATE NOT NULL,
  hectareas_cortadas DECIMAL(10,2) NULL,
  bultos INT NULL,
  notas VARCHAR(255) NULL,
  usuario_id INT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_campanas_diario_campana FOREIGN KEY (campana_id) REFERENCES campanas(id) ON DELETE CASCADE,
  CONSTRAINT fk_campanas_diario_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Remisiones de arroz por campaña
CREATE TABLE IF NOT EXISTS remisiones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  campana_id INT NOT NULL,
  fecha DATE NOT NULL,
  nombre_conductor VARCHAR(160) NULL,
  cc_conductor VARCHAR(40) NULL,
  vehiculo_placa VARCHAR(40) NULL,
  origen VARCHAR(160) NULL,
  destino VARCHAR(160) NULL,
  cantidad VARCHAR(80) NULL,
  variedad VARCHAR(80) NULL,
  tel_conductor VARCHAR(40) NULL,
  tel_propietario VARCHAR(40) NULL,
  valor_flete DECIMAL(12,2) NULL,
  enviado_por VARCHAR(160) NULL,
  enviado_cc VARCHAR(40) NULL,
  firma_conductor VARCHAR(160) NULL,
  firma_propietario VARCHAR(160) NULL,
  nota VARCHAR(255) NULL,
  usuario_id INT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_remisiones_campana FOREIGN KEY (campana_id) REFERENCES campanas(id) ON DELETE CASCADE,
  CONSTRAINT fk_remisiones_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
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
