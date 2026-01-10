import { supabase } from '@/lib/supabase';
import { Product } from '@/types';
import { handleSupabaseError } from '@/lib/error-handler';
import { getLocalDateTimeISO } from '@/lib/utils';

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ProductsQueryParams {
  page?: number;
  pageSize?: number;
  includeInactive?: boolean;
  searchTerm?: string;
}

export const productsService = {
  async getAll(includeInactive = true): Promise<Product[]> {
    let query = supabase
      .from('productos')
      .select('*')
      .order('created_at', { ascending: false });

    if (!includeInactive) {
      query = query.eq('estado', 'activo');
    }

    const { data, error } = await query;

    if (error) throw new Error(handleSupabaseError(error));
    return data as Product[];
  },

  async getAllPaginated(params: ProductsQueryParams = {}): Promise<PaginatedResponse<Product>> {
    const {
      page = 1,
      pageSize = 50,
      includeInactive = true,
      searchTerm = '',
    } = params;

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from('productos')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (!includeInactive) {
      query = query.eq('estado', 'activo');
    }

    // Si hay término de búsqueda, aplicarlo
    if (searchTerm.trim()) {
      query = query.or(`nombre.ilike.%${searchTerm}%,codigo.ilike.%${searchTerm}%`);
    }

    const { data, error, count } = await query;

    if (error) throw new Error(handleSupabaseError(error));

    const total = count || 0;
    const totalPages = Math.ceil(total / pageSize);

    return {
      data: (data || []) as Product[],
      total,
      page,
      pageSize,
      totalPages,
    };
  },

  async getById(id: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(handleSupabaseError(error));
    }
    return data as Product;
  },

  async getByCode(codigo: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .eq('codigo', codigo)
      .eq('estado', 'activo')
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(handleSupabaseError(error));
    }
    return data as Product;
  },

  async search(query: string): Promise<Product[]> {
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .eq('estado', 'activo')
      .or(`nombre.ilike.%${query}%,codigo.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) throw new Error(handleSupabaseError(error));
    return data as Product[];
  },

  async create(product: Omit<Product, 'id' | 'fecha_creacion'>): Promise<Product> {
    // Obtener fecha y hora local del cliente
    const fechaCreacion = getLocalDateTimeISO();
    const createdAt = getLocalDateTimeISO();
    const updatedAt = getLocalDateTimeISO();
    
    const { data, error } = await supabase
      .from('productos')
      .insert({
        nombre: product.nombre,
        descripcion: product.descripcion,
        precio_venta: product.precio_venta,
        codigo: product.codigo,
        id_categoria: product.id_categoria,
        stock_actual: product.stock_actual,
        stock_minimo: product.stock_minimo,
        imagen_url: product.imagen_url,
        estado: product.estado || 'activo',
        fecha_creacion: fechaCreacion, // Fecha explícita en hora local
        created_at: createdAt, // Timestamp explícito en hora local
        updated_at: updatedAt, // Timestamp explícito en hora local
      })
      .select()
      .single();

    if (error) throw new Error(handleSupabaseError(error));
    return data as Product;
  },

  async update(id: string, updates: Partial<Product>): Promise<Product> {
    // Obtener timestamp de actualización en hora local
    const updatedAt = getLocalDateTimeISO();
    
    const { data, error } = await supabase
      .from('productos')
      .update({
        ...updates,
        updated_at: updatedAt, // Timestamp explícito en hora local
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(handleSupabaseError(error));
    return data as Product;
  },

  async delete(id: string): Promise<void> {
    // Soft delete: cambiar estado a inactivo
    // Obtener timestamp de actualización en hora local
    const updatedAt = getLocalDateTimeISO();
    
    const { error } = await supabase
      .from('productos')
      .update({ 
        estado: 'inactivo',
        updated_at: updatedAt, // Timestamp explícito en hora local
      })
      .eq('id', id);

    if (error) throw new Error(handleSupabaseError(error));
  },

  async getLowStock(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .eq('estado', 'activo')
      .lte('stock_actual', supabase.raw('stock_minimo'))
      .order('stock_actual');

    if (error) throw new Error(handleSupabaseError(error));
    return data as Product[];
  },

  async adjustStock(id: string, nuevoStock: number, idUsuario?: string): Promise<Product> {
    // Obtener stock actual
    const { data: currentProduct, error: getError } = await supabase
      .from('productos')
      .select('stock_actual')
      .eq('id', id)
      .single();

    if (getError || !currentProduct) {
      throw new Error(`Error al obtener stock: ${handleSupabaseError(getError)}`);
    }

    const stockAnterior = currentProduct.stock_actual;
    const diferencia = nuevoStock - stockAnterior;

    // Actualizar stock
    const { data, error } = await supabase
      .from('productos')
      .update({ stock_actual: nuevoStock })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(handleSupabaseError(error));

    // Crear movimiento de inventario si hay diferencia
    if (diferencia !== 0) {
      // Usar fecha del cliente (navegador) en hora local
      const ahora = new Date();
      const año = ahora.getFullYear();
      const mes = String(ahora.getMonth() + 1).padStart(2, '0');
      const dia = String(ahora.getDate()).padStart(2, '0');
      const fecha = `${año}-${mes}-${dia}`; // YYYY-MM-DD en hora local

      // Obtener timestamp de creación en hora local
      const createdAt = getLocalDateTimeISO();
      
      const { error: movementError } = await supabase
        .from('movimientos_inventario')
        .insert({
          id_producto: id,
          tipo_movimiento: diferencia > 0 ? 'entrada' : 'salida',
          cantidad: Math.abs(diferencia),
          motivo: 'ajuste',
          fecha: fecha,
          id_usuario: idUsuario || null,
          observacion: `Ajuste de stock: ${stockAnterior} → ${nuevoStock}`,
          created_at: createdAt, // Timestamp explícito en hora local
        });

      if (movementError) {
        console.error('Error al crear movimiento de inventario:', movementError);
        // No revertimos el cambio de stock, solo registramos el error
      }
    }

    return data as Product;
  },

  async toggleStatus(id: string): Promise<Product> {
    // Obtener el estado actual
    const current = await this.getById(id);
    if (!current) {
      throw new Error('Producto no encontrado');
    }

    const newStatus = current.estado === 'activo' ? 'inactivo' : 'activo';
    return this.update(id, { estado: newStatus });
  },

  async getStats(): Promise<{ total: number; activos: number; stockBajo: number }> {
    // Obtener conteos totales de manera eficiente
    const [totalResult, activosResult, activosData] = await Promise.all([
      supabase
        .from('productos')
        .select('id', { count: 'exact', head: true }),
      supabase
        .from('productos')
        .select('id', { count: 'exact', head: true })
        .eq('estado', 'activo'),
      supabase
        .from('productos')
        .select('stock_actual, stock_minimo')
        .eq('estado', 'activo'),
    ]);

    // Calcular stock bajo en memoria (solo para productos activos, que suele ser un subconjunto más pequeño)
    const stockBajo = activosData.data?.filter(p => p.stock_actual <= p.stock_minimo).length || 0;

    return {
      total: totalResult.count || 0,
      activos: activosResult.count || 0,
      stockBajo,
    };
  },
};


