# Políticas RLS para Supabase Storage - Bucket "productos"

## Problema Común
Si las imágenes no se eliminan del storage aunque el código reporte éxito, es probable que falten las políticas RLS (Row Level Security) para DELETE.

## Solución: Configurar Políticas RLS

Ve a **Supabase Dashboard** → **Storage** → **Policies** → **productos** y crea las siguientes políticas:

### 1. Política para DELETE (Eliminación)

```sql
CREATE POLICY "Authenticated users can delete product images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'productos' 
  AND auth.role() = 'authenticated'
);
```

### 2. Verificar Políticas Existentes

Para ver las políticas actuales del bucket "productos":

```sql
SELECT * FROM storage.policies 
WHERE bucket_id = 'productos';
```

### 3. Si ya existe una política de DELETE, verificar que sea correcta:

```sql
-- Ver todas las políticas del bucket productos
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
  AND policyname LIKE '%productos%';
```

### 4. Eliminar y Recrear la Política (si es necesario)

```sql
-- Eliminar política existente si hay problemas
DROP POLICY IF EXISTS "Authenticated users can delete product images" ON storage.objects;

-- Crear nueva política
CREATE POLICY "Authenticated users can delete product images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'productos' 
  AND auth.role() = 'authenticated'
);
```

## Políticas Completas Recomendadas

Para un bucket completamente funcional, necesitas estas 4 políticas:

### 1. SELECT (Lectura Pública)
```sql
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'productos');
```

### 2. INSERT (Subir Archivos)
```sql
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'productos' 
  AND auth.role() = 'authenticated'
);
```

### 3. UPDATE (Actualizar Archivos)
```sql
CREATE POLICY "Authenticated users can update"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'productos' 
  AND auth.role() = 'authenticated'
);
```

### 4. DELETE (Eliminar Archivos) ⚠️ IMPORTANTE
```sql
CREATE POLICY "Authenticated users can delete product images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'productos' 
  AND auth.role() = 'authenticated'
);
```

## Verificación

Después de crear las políticas, prueba eliminar una imagen desde la aplicación. Si aún no funciona:

1. Verifica que estés autenticado (debes tener una sesión activa)
2. Revisa la consola del navegador para ver errores específicos
3. Verifica en el dashboard de Supabase que el archivo realmente se eliminó

## Notas

- Las políticas RLS se aplican a nivel de fila en la tabla `storage.objects`
- El bucket debe existir y estar configurado como público o con las políticas adecuadas
- Los usuarios deben estar autenticados para poder eliminar archivos

