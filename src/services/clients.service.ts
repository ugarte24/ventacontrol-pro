import { supabase } from '@/lib/supabase';
import { Client } from '@/types';
import { handleSupabaseError } from '@/lib/error-handler';
import { getLocalDateTimeISO } from '@/lib/utils';

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ClientsQueryParams {
  page?: number;
  pageSize?: number;
  includeInactive?: boolean;
  searchTerm?: string;
}

export const clientsService = {
  async getAll(includeInactive = true): Promise<Client[]> {
    let query = supabase
      .from('clientes')
      .select('*');
    
    if (!includeInactive) {
      query = query.eq('estado', 'activo');
    }

    const { data, error } = await query.order('nombre');

    if (error) throw new Error(handleSupabaseError(error));
    return data as Client[];
  },

  async getAllPaginated(params: ClientsQueryParams = {}): Promise<PaginatedResponse<Client>> {
    const {
      page = 1,
      pageSize = 50,
      includeInactive = true,
      searchTerm = '',
    } = params;

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from('clientes')
      .select('*', { count: 'exact' })
      .order('nombre');
    
    if (!includeInactive) {
      query = query.eq('estado', 'activo');
    }

    // Si hay término de búsqueda, aplicarlo
    if (searchTerm.trim()) {
      query = query.or(`nombre.ilike.%${searchTerm}%,ci_nit.ilike.%${searchTerm}%,telefono.ilike.%${searchTerm}%`);
    }

    const { data, error, count } = await query.range(from, to);

    if (error) throw new Error(handleSupabaseError(error));

    const total = count || 0;
    const totalPages = Math.ceil(total / pageSize);

    return {
      data: (data || []) as Client[],
      total,
      page,
      pageSize,
      totalPages,
    };
  },

  async getById(id: string): Promise<Client | null> {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(handleSupabaseError(error));
    }
    return data as Client;
  },

  async search(query: string): Promise<Client[]> {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .or(`nombre.ilike.%${query}%,ci_nit.ilike.%${query}%,telefono.ilike.%${query}%`)
      .order('nombre');

    if (error) throw new Error(handleSupabaseError(error));
    return data as Client[];
  },

  async create(client: Omit<Client, 'id' | 'fecha_registro'>): Promise<Client> {
    // Obtener fecha y hora local del cliente
    const fechaRegistro = getLocalDateTimeISO();
    const createdAt = getLocalDateTimeISO();
    
    const { data, error } = await supabase
      .from('clientes')
      .insert({
        nombre: client.nombre,
        ci_nit: client.ci_nit,
        telefono: client.telefono,
        direccion: client.direccion,
        estado: client.estado || 'activo',
        fecha_registro: fechaRegistro, // Fecha explícita en hora local
        created_at: createdAt, // Timestamp explícito en hora local
      })
      .select()
      .single();

    if (error) throw new Error(handleSupabaseError(error));
    return data as Client;
  },

  async update(id: string, updates: Partial<Client>): Promise<Client> {
    // Obtener timestamp de actualización en hora local
    const updatedAt = getLocalDateTimeISO();
    
    const { data, error } = await supabase
      .from('clientes')
      .update({
        ...updates,
        updated_at: updatedAt, // Timestamp explícito en hora local
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(handleSupabaseError(error));
    return data as Client;
  },

  async delete(id: string): Promise<void> {
    // Soft delete: cambiar estado a inactivo
    // Obtener timestamp de actualización en hora local
    const updatedAt = getLocalDateTimeISO();
    
    const { error } = await supabase
      .from('clientes')
      .update({ 
        estado: 'inactivo',
        updated_at: updatedAt, // Timestamp explícito en hora local
      })
      .eq('id', id);

    if (error) throw new Error(handleSupabaseError(error));
  },

  async toggleStatus(id: string): Promise<Client> {
    // Obtener el estado actual
    const current = await this.getById(id);
    if (!current) {
      throw new Error('Cliente no encontrado');
    }

    // Si no tiene estado definido, asumir 'activo' (para compatibilidad con datos antiguos)
    const currentStatus = current.estado || 'activo';
    const newStatus = currentStatus === 'activo' ? 'inactivo' : 'activo';
    return this.update(id, { estado: newStatus });
  },
};


