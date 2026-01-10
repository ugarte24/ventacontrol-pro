-- ============================================================================
-- SCRIPT DE DATOS FICTICIOS - VENTAPLUS
-- ============================================================================
-- Este script carga datos ficticios en la base de datos para pruebas
-- Ejecutar en el SQL Editor de Supabase después de ejecutar 00_MASTER_SCHEMA.sql
-- 
-- IMPORTANTE:
-- - Los usuarios NO se crean aquí (deben crearse desde Supabase Auth)
-- - Este script genera: categorías, productos, clientes y ventas
-- - Ajusta las cantidades según necesites
-- ============================================================================

-- ============================================================================
-- 1. CATEGORÍAS (Crear primero, son necesarias para productos)
-- ============================================================================

INSERT INTO categorias (nombre, descripcion, estado, created_at, updated_at)
VALUES
  ('Bebidas', 'Bebidas gaseosas, jugos, aguas', 'activo', NOW(), NOW()),
  ('Alimentos', 'Productos alimenticios básicos', 'activo', NOW(), NOW()),
  ('Lácteos', 'Leche, queso, yogurt', 'activo', NOW(), NOW()),
  ('Limpieza', 'Productos de limpieza e higiene', 'activo', NOW(), NOW()),
  ('Snacks', 'Papas, galletas, golosinas', 'activo', NOW(), NOW()),
  ('Panadería', 'Pan, pasteles, productos de panadería', 'activo', NOW(), NOW()),
  ('Congelados', 'Productos congelados', 'activo', NOW(), NOW()),
  ('Carnes', 'Carnes frescas y procesadas', 'activo', NOW(), NOW()),
  ('Frutas y Verduras', 'Productos frescos', 'activo', NOW(), NOW()),
  ('Abarrotes', 'Productos de abarrotes varios', 'activo', NOW(), NOW())
ON CONFLICT (nombre) DO NOTHING;

-- ============================================================================
-- 2. PRODUCTOS (2000+ productos para probar paginación)
-- ============================================================================

-- Función para generar productos masivamente
DO $$
DECLARE
  categoria_record RECORD;
  codigo_counter INTEGER;
  nombres_bebidas TEXT[] := ARRAY[
    'Coca Cola', 'Pepsi', 'Sprite', 'Fanta', '7UP', 'Inca Kola', 
    'Guaraná', 'Gatorade', 'Powerade', 'Agua Cielo', 'Agua San Luis',
    'Jugo Del Valle', 'Jugo Pulp', 'Jugo Frugos', 'Chicha Morada',
    'Refresco de Maracuyá', 'Refresco de Piña', 'Refresco de Naranja'
  ];
  nombres_alimentos TEXT[] := ARRAY[
    'Arroz', 'Azúcar', 'Aceite', 'Fideos', 'Avena', 'Quinua',
    'Lentejas', 'Garbanzos', 'Frijoles', 'Harina', 'Levadura',
    'Sal', 'Pimienta', 'Ajo', 'Cebolla', 'Tomate', 'Papa',
    'Yuca', 'Camote', 'Plátano'
  ];
  nombres_lacteos TEXT[] := ARRAY[
    'Leche Gloria', 'Leche Laive', 'Queso Mantecoso', 'Queso Fresco',
    'Yogurt Gloria', 'Yogurt Laive', 'Mantequilla', 'Crema de Leche',
    'Leche Condensada', 'Leche Evaporada', 'Queso Edam', 'Queso Gouda'
  ];
  nombres_limpieza TEXT[] := ARRAY[
    'Detergente', 'Lavavajillas', 'Jabón en Polvo', 'Suavizante',
    'Blanqueador', 'Limpiador Multiuso', 'Desinfectante', 'Papel Higiénico',
    'Toallas de Papel', 'Trapo', 'Esponja', 'Guantes'
  ];
  nombres_snacks TEXT[] := ARRAY[
    'Papas Lays', 'Doritos', 'Cheetos', 'Oreo', 'Galletas Soda',
    'Chicles', 'Caramelos', 'Chocolate', 'Maní', 'Nueces',
    'Palitos de Queso', 'Pretzels', 'Nachos', 'Tortillas'
  ];
  nombre_actual TEXT;
  categoria_nombre TEXT;
  precio_base NUMERIC;
  codigo_base TEXT;
  producto_id UUID;
  stock_base INTEGER;
BEGIN
  -- Obtener categorías
  FOR categoria_record IN SELECT id, nombre FROM categorias WHERE estado = 'activo' LOOP
    categoria_nombre := categoria_record.nombre;
    codigo_counter := 1;
    
    -- Generar productos según la categoría
    CASE categoria_nombre
      WHEN 'Bebidas' THEN
        FOREACH nombre_actual IN ARRAY nombres_bebidas LOOP
          FOR i IN 1..120 LOOP -- ~120 productos por nombre con diferentes tamaños
            precio_base := (15 + (random() * 50))::NUMERIC(10,2);
            stock_base := (10 + (random() * 200))::INTEGER;
            codigo_base := 'BEB' || LPAD((codigo_counter)::TEXT, 4, '0');
            
            INSERT INTO productos (
              nombre, descripcion, precio_venta, codigo, id_categoria,
              stock_actual, stock_minimo, estado, fecha_creacion, created_at, updated_at
            ) VALUES (
              nombre_actual || ' ' || (200 + i*100)::TEXT || 'ml',
              'Descripción de ' || nombre_actual,
              precio_base,
              codigo_base,
              categoria_record.id,
              stock_base,
              GREATEST(5, stock_base / 10),
              'activo',
              NOW() - (random() * 365)::INTEGER * INTERVAL '1 day',
              NOW() - (random() * 365)::INTEGER * INTERVAL '1 day',
              NOW() - (random() * 365)::INTEGER * INTERVAL '1 day'
            );
            
            codigo_counter := codigo_counter + 1;
          END LOOP;
        END LOOP;
        
      WHEN 'Alimentos' THEN
        FOREACH nombre_actual IN ARRAY nombres_alimentos LOOP
          FOR i IN 1..100 LOOP
            precio_base := (5 + (random() * 30))::NUMERIC(10,2);
            stock_base := (20 + (random() * 300))::INTEGER;
            codigo_base := 'ALI' || LPAD((codigo_counter)::TEXT, 4, '0');
            
            INSERT INTO productos (
              nombre, descripcion, precio_venta, codigo, id_categoria,
              stock_actual, stock_minimo, estado, fecha_creacion, created_at, updated_at
            ) VALUES (
              nombre_actual || ' ' || (500 + i*100)::TEXT || 'g',
              'Descripción de ' || nombre_actual,
              precio_base,
              codigo_base,
              categoria_record.id,
              stock_base,
              GREATEST(10, stock_base / 10),
              CASE WHEN random() > 0.1 THEN 'activo' ELSE 'inactivo' END,
              NOW() - (random() * 365)::INTEGER * INTERVAL '1 day',
              NOW() - (random() * 365)::INTEGER * INTERVAL '1 day',
              NOW() - (random() * 365)::INTEGER * INTERVAL '1 day'
            );
            
            codigo_counter := codigo_counter + 1;
          END LOOP;
        END LOOP;
        
      WHEN 'Lácteos' THEN
        FOREACH nombre_actual IN ARRAY nombres_lacteos LOOP
          FOR i IN 1..80 LOOP
            precio_base := (8 + (random() * 25))::NUMERIC(10,2);
            stock_base := (15 + (random() * 150))::INTEGER;
            codigo_base := 'LAC' || LPAD((codigo_counter)::TEXT, 4, '0');
            
            INSERT INTO productos (
              nombre, descripcion, precio_venta, codigo, id_categoria,
              stock_actual, stock_minimo, estado, fecha_creacion, created_at, updated_at
            ) VALUES (
              nombre_actual || ' ' || (250 + i*50)::TEXT || (CASE WHEN i%2=0 THEN 'ml' ELSE 'g' END),
              'Descripción de ' || nombre_actual,
              precio_base,
              codigo_base,
              categoria_record.id,
              stock_base,
              GREATEST(5, stock_base / 10),
              'activo',
              NOW() - (random() * 365)::INTEGER * INTERVAL '1 day',
              NOW() - (random() * 365)::INTEGER * INTERVAL '1 day',
              NOW() - (random() * 365)::INTEGER * INTERVAL '1 day'
            );
            
            codigo_counter := codigo_counter + 1;
          END LOOP;
        END LOOP;
        
      WHEN 'Limpieza' THEN
        FOREACH nombre_actual IN ARRAY nombres_limpieza LOOP
          FOR i IN 1..90 LOOP
            precio_base := (10 + (random() * 40))::NUMERIC(10,2);
            stock_base := (5 + (random() * 100))::INTEGER;
            codigo_base := 'LIM' || LPAD((codigo_counter)::TEXT, 4, '0');
            
            INSERT INTO productos (
              nombre, descripcion, precio_venta, codigo, id_categoria,
              stock_actual, stock_minimo, estado, fecha_creacion, created_at, updated_at
            ) VALUES (
              nombre_actual || ' ' || (CASE WHEN i%3=0 THEN '500g' WHEN i%3=1 THEN '1kg' ELSE '2kg' END),
              'Descripción de ' || nombre_actual,
              precio_base,
              codigo_base,
              categoria_record.id,
              stock_base,
              GREATEST(3, stock_base / 10),
              'activo',
              NOW() - (random() * 365)::INTEGER * INTERVAL '1 day',
              NOW() - (random() * 365)::INTEGER * INTERVAL '1 day',
              NOW() - (random() * 365)::INTEGER * INTERVAL '1 day'
            );
            
            codigo_counter := codigo_counter + 1;
          END LOOP;
        END LOOP;
        
      WHEN 'Snacks' THEN
        FOREACH nombre_actual IN ARRAY nombres_snacks LOOP
          FOR i IN 1..70 LOOP
            precio_base := (3 + (random() * 20))::NUMERIC(10,2);
            stock_base := (20 + (random() * 200))::INTEGER;
            codigo_base := 'SNK' || LPAD((codigo_counter)::TEXT, 4, '0');
            
            INSERT INTO productos (
              nombre, descripcion, precio_venta, codigo, id_categoria,
              stock_actual, stock_minimo, estado, fecha_creacion, created_at, updated_at
            ) VALUES (
              nombre_actual || ' ' || (50 + i*25)::TEXT || 'g',
              'Descripción de ' || nombre_actual,
              precio_base,
              codigo_base,
              categoria_record.id,
              stock_base,
              GREATEST(10, stock_base / 10),
              'activo',
              NOW() - (random() * 365)::INTEGER * INTERVAL '1 day',
              NOW() - (random() * 365)::INTEGER * INTERVAL '1 day',
              NOW() - (random() * 365)::INTEGER * INTERVAL '1 day'
            );
            
            codigo_counter := codigo_counter + 1;
          END LOOP;
        END LOOP;
        
      ELSE
        -- Para otras categorías, crear algunos productos genéricos
        FOR i IN 1..50 LOOP
          precio_base := (10 + (random() * 50))::NUMERIC(10,2);
          stock_base := (10 + (random() * 150))::INTEGER;
          codigo_base := UPPER(SUBSTRING(categoria_nombre, 1, 3)) || LPAD((codigo_counter)::TEXT, 4, '0');
          
          INSERT INTO productos (
            nombre, descripcion, precio_venta, codigo, id_categoria,
            stock_actual, stock_minimo, estado, fecha_creacion, created_at, updated_at
          ) VALUES (
            'Producto ' || categoria_nombre || ' ' || i::TEXT,
            'Descripción del producto',
            precio_base,
            codigo_base,
            categoria_record.id,
            stock_base,
            GREATEST(5, stock_base / 10),
            'activo',
            NOW() - (random() * 365)::INTEGER * INTERVAL '1 day',
            NOW() - (random() * 365)::INTERVAL '1 day',
            NOW() - (random() * 365)::INTERVAL '1 day'
          );
          
          codigo_counter := codigo_counter + 1;
        END LOOP;
    END CASE;
  END LOOP;
END $$;

-- ============================================================================
-- 3. CLIENTES (2000+ clientes)
-- ============================================================================

DO $$
DECLARE
  nombres TEXT[] := ARRAY[
    'Juan', 'María', 'Carlos', 'Ana', 'Luis', 'Laura', 'Pedro', 'Carmen',
    'José', 'Sofía', 'Miguel', 'Patricia', 'Roberto', 'Lucía', 'Fernando', 'Elena',
    'Daniel', 'Isabel', 'Ricardo', 'Marta', 'Andrés', 'Rosa', 'Manuel', 'Teresa',
    'Francisco', 'Carmen', 'Alejandro', 'Antonia', 'Javier', 'Dolores', 'Diego', 'Mercedes'
  ];
  apellidos TEXT[] := ARRAY[
    'García', 'Rodríguez', 'González', 'Fernández', 'López', 'Martínez', 'Sánchez', 'Pérez',
    'Gómez', 'Martín', 'Jiménez', 'Ruiz', 'Hernández', 'Díaz', 'Moreno', 'Álvarez',
    'Muñoz', 'Romero', 'Alonso', 'Gutiérrez', 'Navarro', 'Torres', 'Domínguez', 'Vázquez',
    'Ramos', 'Gil', 'Ramírez', 'Serrano', 'Blanco', 'Suárez', 'Molina', 'Morales'
  ];
  calles TEXT[] := ARRAY[
    'Av. Principal', 'Calle Los Olivos', 'Jr. Libertad', 'Av. San Martín',
    'Calle Real', 'Jr. Unión', 'Av. Bolívar', 'Calle Comercio',
    'Jr. Ayacucho', 'Av. Grau', 'Calle Lima', 'Jr. Tacna'
  ];
  nombre_completo TEXT;
  ci_nit TEXT;
  telefono TEXT;
  direccion TEXT;
  fecha_reg DATE;
  estado_cliente TEXT;
BEGIN
  FOR i IN 1..2000 LOOP
    nombre_completo := nombres[1 + (random() * (array_length(nombres, 1) - 1))::INTEGER] || ' ' ||
                       nombres[1 + (random() * (array_length(nombres, 1) - 1))::INTEGER] || ' ' ||
                       apellidos[1 + (random() * (array_length(apellidos, 1) - 1))::INTEGER] || ' ' ||
                       apellidos[1 + (random() * (array_length(apellidos, 1) - 1))::INTEGER];
    
    -- CI/NIT (70% tiene CI, 20% tiene NIT, 10% no tiene)
    IF random() < 0.7 THEN
      ci_nit := (1000000 + (random() * 8999999))::INTEGER::TEXT;
    ELSIF random() < 0.9 THEN
      ci_nit := (10000000000 + (random() * 89999999999))::BIGINT::TEXT;
    ELSE
      ci_nit := NULL;
    END IF;
    
    -- Teléfono (90% tiene teléfono)
    IF random() < 0.9 THEN
      telefono := '9' || (100000000 + (random() * 899999999))::INTEGER::TEXT;
    ELSE
      telefono := NULL;
    END IF;
    
    -- Dirección
    direccion := calles[1 + (random() * (array_length(calles, 1) - 1))::INTEGER] || ' ' ||
                 (100 + (random() * 9999))::INTEGER::TEXT;
    
    -- Fecha de registro (últimos 2 años)
    fecha_reg := CURRENT_DATE - (random() * 730)::INTEGER;
    
    -- Estado (90% activo, 10% inactivo)
    estado_cliente := CASE WHEN random() < 0.9 THEN 'activo' ELSE 'inactivo' END;
    
    INSERT INTO clientes (
      nombre, ci_nit, telefono, direccion, fecha_registro, estado,
      created_at, updated_at
    ) VALUES (
      nombre_completo,
      ci_nit,
      telefono,
      direccion,
      fecha_reg,
      estado_cliente,
      fecha_reg::TIMESTAMP WITH TIME ZONE,
      fecha_reg::TIMESTAMP WITH TIME ZONE
    );
  END LOOP;
END $$;

-- ============================================================================
-- 4. VENTAS (Necesita usuarios existentes)
-- ============================================================================
-- NOTA: Este script asume que ya existen usuarios en la tabla usuarios
-- Las ventas se crearán solo si hay al menos un usuario en la tabla

DO $$
DECLARE
  usuario_record RECORD;
  cliente_record RECORD;
  producto_record RECORD;
  venta_id UUID;
  fecha_venta DATE;
  hora_venta TIME;
  metodo_pago TEXT;
  total_venta NUMERIC(10,2);
  cantidad_items INTEGER;
  cantidad_producto INTEGER;
  precio_unitario NUMERIC(10,2);
  subtotal_item NUMERIC(10,2);
  total_calculado NUMERIC(10,2);
  meses_credito INTEGER;
  tasa_interes NUMERIC(5,2);
  cuota_inicial NUMERIC(10,2);
  fecha_vencimiento DATE;
  estado_credito TEXT;
  productos_disponibles UUID[];
  productos_por_venta INTEGER;
  i INTEGER;
  dia INTEGER;
  venta_num INTEGER;
BEGIN
  -- Obtener productos disponibles
  SELECT array_agg(id) INTO productos_disponibles
  FROM productos
  WHERE estado = 'activo' AND stock_actual > 0
  LIMIT 500; -- Limitar para evitar arrays muy grandes
  
  -- Solo crear ventas si hay usuarios y productos
  IF EXISTS (SELECT 1 FROM usuarios LIMIT 1) AND array_length(productos_disponibles, 1) > 0 THEN
    -- Crear ventas para los últimos 90 días
    FOR usuario_record IN SELECT id FROM usuarios WHERE estado = 'activo' LIMIT 10 LOOP
      FOR dia IN 0..89 LOOP
        fecha_venta := CURRENT_DATE - dia;
        
        -- Crear entre 5-20 ventas por día por usuario
        FOR venta_num IN 1..(5 + (random() * 15)::INTEGER) LOOP
          -- Hora aleatoria del día
          hora_venta := (random() * 86400)::INTEGER * INTERVAL '1 second';
          
          -- Método de pago (60% efectivo, 20% QR, 15% transferencia, 5% crédito)
          IF random() < 0.6 THEN
            metodo_pago := 'efectivo';
          ELSIF random() < 0.8 THEN
            metodo_pago := 'qr';
          ELSIF random() < 0.95 THEN
            metodo_pago := 'transferencia';
          ELSE
            metodo_pago := 'credito';
          END IF;
          
          -- Obtener cliente aleatorio (70% con cliente, 30% sin cliente)
          IF random() < 0.7 THEN
            SELECT id INTO cliente_record FROM clientes 
            WHERE estado = 'activo' 
            ORDER BY random() 
            LIMIT 1;
          ELSE
            cliente_record := NULL;
          END IF;
          
          -- Calcular total de la venta
          productos_por_venta := 1 + (random() * 5)::INTEGER;
          total_calculado := 0;
          
          -- Crear la venta
          IF metodo_pago = 'credito' THEN
            -- Ventas a crédito
            meses_credito := 1 + (random() * 6)::INTEGER;
            tasa_interes := CASE WHEN random() < 0.5 THEN 0 ELSE (2 + (random() * 8))::NUMERIC(5,2) END;
            cuota_inicial := CASE WHEN random() < 0.3 THEN 0 ELSE (50 + (random() * 200))::NUMERIC(10,2) END;
            fecha_vencimiento := fecha_venta + (meses_credito || ' months')::INTERVAL;
            estado_credito := CASE 
              WHEN cuota_inicial > 0 THEN 'parcial'
              ELSE 'pendiente'
            END;
            
            -- Primero crear la venta para obtener el ID
            INSERT INTO ventas (
              fecha, hora, total, metodo_pago, id_cliente, id_vendedor, estado,
              meses_credito, cuota_inicial, tasa_interes, fecha_vencimiento,
              monto_pagado, estado_credito, created_at, updated_at
            ) VALUES (
              fecha_venta, hora_venta, 0, metodo_pago, 
              COALESCE(cliente_record.id, NULL), usuario_record.id, 'completada',
              meses_credito, cuota_inicial, tasa_interes, fecha_vencimiento,
              cuota_inicial, estado_credito, fecha_venta::TIMESTAMP WITH TIME ZONE + hora_venta, 
              fecha_venta::TIMESTAMP WITH TIME ZONE + hora_venta
            ) RETURNING id INTO venta_id;
          ELSE
            -- Ventas normales
            INSERT INTO ventas (
              fecha, hora, total, metodo_pago, id_cliente, id_vendedor, estado,
              created_at, updated_at
            ) VALUES (
              fecha_venta, hora_venta, 0, metodo_pago,
              COALESCE(cliente_record.id, NULL), usuario_record.id, 'completada',
              fecha_venta::TIMESTAMP WITH TIME ZONE + hora_venta,
              fecha_venta::TIMESTAMP WITH TIME ZONE + hora_venta
            ) RETURNING id INTO venta_id;
          END IF;
          
          -- Crear detalles de venta
          FOR i IN 1..productos_por_venta LOOP
            -- Seleccionar producto aleatorio
            producto_record.id := productos_disponibles[1 + (random() * (array_length(productos_disponibles, 1) - 1))::INTEGER];
            
            -- Obtener precio del producto
            SELECT precio_venta INTO precio_unitario
            FROM productos
            WHERE id = producto_record.id;
            
            -- Cantidad entre 1 y 10
            cantidad_producto := 1 + (random() * 9)::INTEGER;
            subtotal_item := (precio_unitario * cantidad_producto)::NUMERIC(10,2);
            total_calculado := total_calculado + subtotal_item;
            
            -- Insertar detalle
            INSERT INTO detalle_venta (
              id_venta, id_producto, cantidad, precio_unitario, subtotal, created_at
            ) VALUES (
              venta_id, producto_record.id, cantidad_producto, precio_unitario, subtotal_item,
              fecha_venta::TIMESTAMP WITH TIME ZONE + hora_venta
            );
          END LOOP;
          
          -- Actualizar total de la venta
          UPDATE ventas
          SET total = total_calculado
          WHERE id = venta_id;
        END LOOP;
      END LOOP;
    END LOOP;
  END IF;
END $$;

-- ============================================================================
-- RESUMEN
-- ============================================================================

SELECT 
  'Categorías creadas' as tipo,
  COUNT(*)::TEXT as cantidad
FROM categorias
UNION ALL
SELECT 
  'Productos creados' as tipo,
  COUNT(*)::TEXT as cantidad
FROM productos
UNION ALL
SELECT 
  'Clientes creados' as tipo,
  COUNT(*)::TEXT as cantidad
FROM clientes
UNION ALL
SELECT 
  'Ventas creadas' as tipo,
  COUNT(*)::TEXT as cantidad
FROM ventas;
