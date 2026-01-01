-- Migración: Agregar campo estado a la tabla clientes
-- Este script agrega el campo estado (activo/inactivo) a la tabla clientes
-- para implementar soft delete en lugar de eliminación física

-- Agregar columna estado si no existe
ALTER TABLE clientes 
ADD COLUMN IF NOT EXISTS estado VARCHAR(20) DEFAULT 'activo' NOT NULL CHECK (estado IN ('activo', 'inactivo'));

-- Crear índice para mejorar el rendimiento de consultas por estado
CREATE INDEX IF NOT EXISTS idx_clientes_estado ON clientes(estado);

-- Actualizar todos los registros existentes a 'activo' (por si acaso)
UPDATE clientes SET estado = 'activo' WHERE estado IS NULL;

-- Comentario en la columna
COMMENT ON COLUMN clientes.estado IS 'Estado del cliente: activo o inactivo (soft delete)';

