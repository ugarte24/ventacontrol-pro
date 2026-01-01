import { PostgrestError } from '@supabase/supabase-js';

export function handleSupabaseError(error: PostgrestError | Error | null): string {
  if (!error) return 'Error desconocido';

  if ('code' in error) {
    const supabaseError = error as PostgrestError;
    
    switch (supabaseError.code) {
      case 'PGRST116':
        return 'No se encontraron registros';
      case '23505':
        // Error de violación de constraint único
        // Verificar si es específicamente el código duplicado
        const errorMessage = supabaseError.message?.toLowerCase() || '';
        const errorDetails = supabaseError.details?.toLowerCase() || '';
        
        if (errorMessage.includes('codigo') || errorDetails.includes('codigo') || 
            errorMessage.includes('code') || errorDetails.includes('code') ||
            errorMessage.includes('unique') && (errorMessage.includes('codigo') || errorMessage.includes('code'))) {
          return 'El código ya existe. Por favor, usa un código diferente.';
        }
        
        return 'Este registro ya existe';
      case '23503':
        return 'Error de referencia: el registro relacionado no existe';
      case '42501':
        return 'No tienes permisos para realizar esta acción';
      case 'PGRST301':
        return 'Error de autenticación';
      default:
        return supabaseError.message || 'Error en la base de datos';
    }
  }

  return error.message || 'Error desconocido';
}

export function isSupabaseError(error: unknown): error is PostgrestError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error &&
    'details' in error
  );
}


