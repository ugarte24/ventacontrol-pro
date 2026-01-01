import { supabase } from '@/lib/supabase';

export const storageService = {
  async uploadProductImage(file: File, productId: string): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${productId}-${Date.now()}.${fileExt}`;
    const filePath = `productos/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('productos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('productos')
      .getPublicUrl(filePath);

    return data.publicUrl;
  },

  async deleteProductImage(filePath: string): Promise<void> {
    if (!filePath) {
      return;
    }

    // Extraer el path del URL completo
    // El URL puede tener diferentes formatos:
    // 1. https://[project].supabase.co/storage/v1/object/public/productos/productos/[filename]
    // 2. https://[project].supabase.co/storage/v1/object/sign/productos/productos/[filename]?token=...
    // 3. productos/[filename] (ya es un path)
    
    let pathToDelete: string;
    
    // Si ya es un path relativo (empieza con "productos/")
    if (filePath.startsWith('productos/')) {
      pathToDelete = filePath;
    } 
    // Si es un URL completo, extraer el path
    else if (filePath.includes('/productos/')) {
      // El URL tiene formato: .../storage/v1/object/public/productos/productos/[filename]
      // Necesitamos extraer el path relativo al bucket
      // Buscar la última ocurrencia de '/productos/' para obtener el path completo dentro del bucket
      const lastIndex = filePath.lastIndexOf('/productos/');
      if (lastIndex !== -1) {
        // Extraer todo después de la última ocurrencia de '/productos/'
        let extractedPath = filePath.substring(lastIndex + '/productos/'.length);
        // Remover query strings y fragments
        extractedPath = extractedPath.split('?')[0].split('#')[0];
        
        // El path debe incluir "productos/" porque los archivos se guardan en productos/[filename]
        // Si el path extraído ya incluye "productos/", usarlo tal cual
        if (extractedPath.startsWith('productos/')) {
          pathToDelete = extractedPath;
        } else {
          // Si no tiene "productos/", agregarlo
          pathToDelete = `productos/${extractedPath}`;
        }
      } else {
        throw new Error('Formato de URL no válido');
      }
    } else {
      throw new Error('Formato de URL no válido');
    }

    // En Supabase Storage, el método remove() espera un array de paths relativos al bucket
    // El path debe ser relativo al bucket, no incluir el nombre del bucket
    // IMPORTANTE: Asegúrate de que las políticas RLS permitan DELETE en el bucket 'productos'
    const { error, data } = await supabase.storage
      .from('productos')
      .remove([pathToDelete]);

    if (error) {
      // Si el error es de permisos, dar un mensaje más claro
      if (error.message?.includes('permission') || error.message?.includes('policy') || error.statusCode === 403) {
        throw new Error('No tienes permisos para eliminar archivos. Verifica las políticas RLS del bucket "productos" en Supabase.');
      }
      
      throw error;
    }
  },

  getPublicUrl(path: string): string {
    const { data } = supabase.storage
      .from('productos')
      .getPublicUrl(path);

    return data.publicUrl;
  },
};


