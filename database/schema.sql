-- Sistema de Gestión Hotelera - Esquema de Base de Datos MySQL
-- Creado: 2025-10-08

-- Crear base de datos
CREATE DATABASE IF NOT EXISTS hotel_management;
USE hotel_management;

-- Tabla de Usuarios del Sistema
CREATE TABLE usuarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol ENUM('admin', 'recepcionista', 'gerente', 'contador') NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultima_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de Huéspedes
CREATE TABLE huespedes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    tipo_documento ENUM('DNI', 'Pasaporte', 'Cedula') NOT NULL,
    numero_documento VARCHAR(50) UNIQUE NOT NULL,
    fecha_nacimiento DATE,
    nacionalidad VARCHAR(50),
    email VARCHAR(100),
    telefono VARCHAR(20),
    direccion TEXT,
    ciudad VARCHAR(100),
    pais VARCHAR(100),
    notas TEXT,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultima_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de Tipos de Habitación
CREATE TABLE tipos_habitacion (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(50) NOT NULL,
    descripcion TEXT,
    capacidad_personas INT NOT NULL,
    numero_camas INT NOT NULL,
    tipo_camas VARCHAR(100),
    precio_base DECIMAL(10, 2) NOT NULL,
    metros_cuadrados DECIMAL(6, 2),
    amenidades TEXT, -- JSON string con amenidades
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Habitaciones
CREATE TABLE habitaciones (
    id INT PRIMARY KEY AUTO_INCREMENT,
    numero VARCHAR(10) UNIQUE NOT NULL,
    piso INT NOT NULL,
    tipo_habitacion_id INT NOT NULL,
    estado ENUM('disponible', 'ocupada', 'limpieza', 'mantenimiento', 'reservada') DEFAULT 'disponible',
    notas TEXT,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultima_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tipo_habitacion_id) REFERENCES tipos_habitacion(id)
);

-- Tabla de Reservas
CREATE TABLE reservas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    codigo_reserva VARCHAR(20) UNIQUE NOT NULL,
    huesped_id INT NOT NULL,
    habitacion_id INT NOT NULL,
    fecha_entrada DATE NOT NULL,
    fecha_salida DATE NOT NULL,
    numero_huespedes INT NOT NULL,
    estado ENUM('pendiente', 'confirmada', 'check_in', 'check_out', 'cancelada') DEFAULT 'pendiente',
    precio_total DECIMAL(10, 2) NOT NULL,
    anticipo DECIMAL(10, 2) DEFAULT 0,
    observaciones TEXT,
    usuario_id INT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_check_in TIMESTAMP NULL,
    fecha_check_out TIMESTAMP NULL,
    ultima_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (huesped_id) REFERENCES huespedes(id),
    FOREIGN KEY (habitacion_id) REFERENCES habitaciones(id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- Tabla de Servicios Adicionales
CREATE TABLE servicios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    categoria ENUM('restaurante', 'spa', 'lavanderia', 'transporte', 'otros') NOT NULL,
    precio DECIMAL(10, 2) NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Consumos/Servicios por Reserva
CREATE TABLE reserva_servicios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    reserva_id INT NOT NULL,
    servicio_id INT NOT NULL,
    cantidad INT DEFAULT 1,
    precio_unitario DECIMAL(10, 2) NOT NULL,
    precio_total DECIMAL(10, 2) NOT NULL,
    fecha_consumo TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notas TEXT,
    FOREIGN KEY (reserva_id) REFERENCES reservas(id),
    FOREIGN KEY (servicio_id) REFERENCES servicios(id)
);

-- Tabla de Facturas
CREATE TABLE facturas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    numero_factura VARCHAR(20) UNIQUE NOT NULL,
    reserva_id INT NOT NULL,
    huesped_id INT NOT NULL,
    fecha_emision DATE NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    impuestos DECIMAL(10, 2) DEFAULT 0,
    descuentos DECIMAL(10, 2) DEFAULT 0,
    total DECIMAL(10, 2) NOT NULL,
    metodo_pago ENUM('efectivo', 'tarjeta', 'transferencia', 'mixto') NOT NULL,
    estado ENUM('pendiente', 'pagada', 'anulada') DEFAULT 'pendiente',
    observaciones TEXT,
    usuario_id INT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reserva_id) REFERENCES reservas(id),
    FOREIGN KEY (huesped_id) REFERENCES huespedes(id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- Tabla de Pagos
CREATE TABLE pagos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    factura_id INT NOT NULL,
    monto DECIMAL(10, 2) NOT NULL,
    metodo_pago ENUM('efectivo', 'tarjeta', 'transferencia') NOT NULL,
    referencia VARCHAR(100),
    fecha_pago TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usuario_id INT,
    notas TEXT,
    FOREIGN KEY (factura_id) REFERENCES facturas(id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- Tabla de Mantenimiento de Habitaciones
CREATE TABLE mantenimientos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    habitacion_id INT NOT NULL,
    tipo ENUM('limpieza', 'reparacion', 'inspeccion') NOT NULL,
    descripcion TEXT NOT NULL,
    estado ENUM('pendiente', 'en_proceso', 'completado') DEFAULT 'pendiente',
    prioridad ENUM('baja', 'media', 'alta', 'urgente') DEFAULT 'media',
    fecha_reporte TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_inicio TIMESTAMP NULL,
    fecha_completado TIMESTAMP NULL,
    usuario_reporta_id INT,
    usuario_asignado_id INT,
    costo DECIMAL(10, 2) DEFAULT 0,
    notas TEXT,
    FOREIGN KEY (habitacion_id) REFERENCES habitaciones(id),
    FOREIGN KEY (usuario_reporta_id) REFERENCES usuarios(id),
    FOREIGN KEY (usuario_asignado_id) REFERENCES usuarios(id)
);

-- Tabla de Configuración del Sistema
CREATE TABLE configuracion (
    id INT PRIMARY KEY AUTO_INCREMENT,
    clave VARCHAR(100) UNIQUE NOT NULL,
    valor TEXT NOT NULL,
    descripcion TEXT,
    ultima_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Índices para mejorar el rendimiento
CREATE INDEX idx_reservas_fechas ON reservas(fecha_entrada, fecha_salida);
CREATE INDEX idx_reservas_estado ON reservas(estado);
CREATE INDEX idx_habitaciones_estado ON habitaciones(estado);
CREATE INDEX idx_facturas_estado ON facturas(estado);
CREATE INDEX idx_huespedes_documento ON huespedes(numero_documento);

-- Insertar datos iniciales
-- Usuario administrador por defecto (password: admin123 - debe cambiarse)
INSERT INTO usuarios (nombre, email, password, rol) VALUES 
('Administrador', 'admin@hotel.com', '$2b$10$ElUU5orSQjM6Phq78STlpuiU579Lmttsg/Dx9Cc.IMEq5hTTgXPUm', 'admin');

-- Configuración inicial
INSERT INTO configuracion (clave, valor, descripcion) VALUES
('nombre_hotel', 'Hotel Paradise', 'Nombre del hotel'),
('direccion', 'Av. Principal 123', 'Dirección del hotel'),
('telefono', '+123456789', 'Teléfono de contacto'),
('email', 'info@hotel.com', 'Email de contacto'),
('impuesto_iva', '21', 'Porcentaje de IVA'),
('moneda', 'USD', 'Moneda del sistema'),
('check_in_hora', '14:00', 'Hora de check-in'),
('check_out_hora', '11:00', 'Hora de check-out');

-- Tipos de habitación de ejemplo
INSERT INTO tipos_habitacion (nombre, descripcion, capacidad_personas, numero_camas, tipo_camas, precio_base, metros_cuadrados, amenidades) VALUES
('Individual', 'Habitación individual con cama simple', 1, 1, '1 cama simple', 50.00, 15.00, '["WiFi", "TV", "Aire acondicionado", "Baño privado"]'),
('Doble', 'Habitación doble con cama matrimonial', 2, 1, '1 cama matrimonial', 80.00, 20.00, '["WiFi", "TV", "Aire acondicionado", "Baño privado", "Minibar"]'),
('Triple', 'Habitación triple con tres camas', 3, 3, '3 camas simples', 100.00, 25.00, '["WiFi", "TV", "Aire acondicionado", "Baño privado", "Minibar"]'),
('Suite', 'Suite de lujo con sala de estar', 2, 1, '1 cama king size', 150.00, 40.00, '["WiFi", "TV", "Aire acondicionado", "Baño privado", "Minibar", "Jacuzzi", "Sala de estar"]');

-- Habitaciones de ejemplo
INSERT INTO habitaciones (numero, piso, tipo_habitacion_id, estado) VALUES
('101', 1, 1, 'disponible'),
('102', 1, 2, 'disponible'),
('103', 1, 2, 'disponible'),
('201', 2, 3, 'disponible'),
('202', 2, 3, 'disponible'),
('301', 3, 4, 'disponible');

-- Servicios adicionales de ejemplo
INSERT INTO servicios (nombre, descripcion, categoria, precio) VALUES
('Desayuno', 'Desayuno buffet', 'restaurante', 15.00),
('Almuerzo', 'Almuerzo menú del día', 'restaurante', 25.00),
('Cena', 'Cena a la carta', 'restaurante', 30.00),
('Masaje relajante', 'Masaje de 60 minutos', 'spa', 50.00),
('Lavandería', 'Servicio de lavandería por prenda', 'lavanderia', 5.00),
('Transporte aeropuerto', 'Traslado desde/hacia aeropuerto', 'transporte', 40.00);
