import { supabase } from '@/lib/supabase';
import { Servicio, MovimientoServicio, RegistroServicio, CreateMovimientoServicioData, CreateRegistroServicioData } from '@/types';
import { handleSupabaseError } from '@/lib/error-handler';
import { getLocalDateTimeISO } from '@/lib/utils';

export const serviciosService = {
  // ============ SERVICIOS ============
  
  async getAllServicios(includeInactive = false): Promise<Servicio[]> {
    let query = supabase
      .from('servicios')
      .select('*')
      .order('nombre');

    if (!includeInactive) {
      query = query.eq('estado', 'activo');
    }

    const { data, error } = await query;

    if (error) throw new Error(handleSupabaseError(error));
    return data as Servicio[];
  },

  async getServicioById(id: string): Promise<Servicio | null> {
    const { data, error } = await supabase
      .from('servicios')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(handleSupabaseError(error));
    }
    return data as Servicio;
  },

  async createServicio(servicio: Omit<Servicio, 'id' | 'created_at' | 'updated_at'>): Promise<Servicio> {
    const { data, error } = await supabase
      .from('servicios')
      .insert({
        nombre: servicio.nombre,
        descripcion: servicio.descripcion || null,
        saldo_actual: servicio.saldo_actual || 0,
        estado: servicio.estado || 'activo',
      })
      .select()
      .single();

    if (error) throw new Error(handleSupabaseError(error));
    return data as Servicio;
  },

  async updateServicio(id: string, updates: Partial<Omit<Servicio, 'id' | 'created_at' | 'updated_at'>>): Promise<Servicio> {
    const { data, error } = await supabase
      .from('servicios')
      .update({
        ...updates,
        updated_at: getLocalDateTimeISO(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(handleSupabaseError(error));
    return data as Servicio;
  },

  async deleteServicio(id: string): Promise<void> {
    const { error } = await supabase
      .from('servicios')
      .delete()
      .eq('id', id);

    if (error) throw new Error(handleSupabaseError(error));
  },

  // ============ MOVIMIENTOS ============

  async getAllMovimientos(filters?: {
    id_servicio?: string;
    fechaDesde?: string;
    fechaHasta?: string;
  }): Promise<MovimientoServicio[]> {
    let query = supabase
      .from('movimientos_servicios')
      .select('*')
      .order('fecha', { ascending: false })
      .order('hora', { ascending: false });

    if (filters?.id_servicio) {
      query = query.eq('id_servicio', filters.id_servicio);
    }

    if (filters?.fechaDesde) {
      query = query.gte('fecha', filters.fechaDesde);
    }

    if (filters?.fechaHasta) {
      query = query.lte('fecha', filters.fechaHasta);
    }

    const { data, error } = await query;

    if (error) throw new Error(handleSupabaseError(error));
    return data as MovimientoServicio[];
  },

  async getMovimientoById(id: string): Promise<MovimientoServicio | null> {
    const { data, error } = await supabase
      .from('movimientos_servicios')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(handleSupabaseError(error));
    }
    return data as MovimientoServicio;
  },

  async createMovimiento(movimientoData: CreateMovimientoServicioData): Promise<MovimientoServicio> {
    // Primero obtener el servicio para obtener el saldo actual
    const servicio = await this.getServicioById(movimientoData.id_servicio);
    if (!servicio) {
      throw new Error('Servicio no encontrado');
    }

    const saldoAnterior = servicio.saldo_actual;
    const saldoNuevo = saldoAnterior + movimientoData.monto;

    const { data, error } = await supabase
      .from('movimientos_servicios')
      .insert({
        id_servicio: movimientoData.id_servicio,
        tipo: movimientoData.tipo || 'aumento',
        monto: movimientoData.monto,
        saldo_anterior: saldoAnterior,
        saldo_nuevo: saldoNuevo,
        fecha: movimientoData.fecha,
        hora: movimientoData.hora,
        id_usuario: movimientoData.id_usuario,
        observacion: movimientoData.observacion || null,
      })
      .select()
      .single();

    if (error) throw new Error(handleSupabaseError(error));
    return data as MovimientoServicio;
  },

  async deleteMovimiento(id: string): Promise<void> {
    // Obtener el movimiento para revertir el saldo
    const movimiento = await this.getMovimientoById(id);
    if (!movimiento) {
      throw new Error('Movimiento no encontrado');
    }

    // Revertir el saldo del servicio
    const servicio = await this.getServicioById(movimiento.id_servicio);
    if (!servicio) {
      throw new Error('Servicio no encontrado');
    }

    const nuevoSaldo = servicio.saldo_actual - movimiento.monto;

    // Actualizar el saldo del servicio
    await this.updateServicio(movimiento.id_servicio, {
      saldo_actual: nuevoSaldo,
    });

    // Eliminar el movimiento
    const { error } = await supabase
      .from('movimientos_servicios')
      .delete()
      .eq('id', id);

    if (error) throw new Error(handleSupabaseError(error));
  },

  // ============ REGISTROS ============

  async getAllRegistros(filters?: {
    id_servicio?: string;
    fechaDesde?: string;
    fechaHasta?: string;
  }): Promise<RegistroServicio[]> {
    let query = supabase
      .from('registros_servicios')
      .select('*')
      .order('fecha', { ascending: false });

    if (filters?.id_servicio) {
      query = query.eq('id_servicio', filters.id_servicio);
    }

    if (filters?.fechaDesde) {
      query = query.gte('fecha', filters.fechaDesde);
    }

    if (filters?.fechaHasta) {
      query = query.lte('fecha', filters.fechaHasta);
    }

    const { data, error } = await query;

    if (error) throw new Error(handleSupabaseError(error));
    return data as RegistroServicio[];
  },

  async getRegistroById(id: string): Promise<RegistroServicio | null> {
    const { data, error } = await supabase
      .from('registros_servicios')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(handleSupabaseError(error));
    }
    return data as RegistroServicio;
  },

  async getRegistroPorFecha(id_servicio: string, fecha: string): Promise<RegistroServicio | null> {
    const { data, error } = await supabase
      .from('registros_servicios')
      .select('*')
      .eq('id_servicio', id_servicio)
      .eq('fecha', fecha)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(handleSupabaseError(error));
    }
    return data as RegistroServicio;
  },

  async createRegistro(registroData: CreateRegistroServicioData): Promise<RegistroServicio> {
    // Verificar que no exista ya un registro para esta fecha y servicio
    const existe = await this.getRegistroPorFecha(registroData.id_servicio, registroData.fecha);
    if (existe) {
      throw new Error('Ya existe un registro para esta fecha y servicio');
    }

    const { data, error } = await supabase
      .from('registros_servicios')
      .insert({
        id_servicio: registroData.id_servicio,
        fecha: registroData.fecha,
        saldo_inicial: registroData.saldo_inicial,
        saldo_final: registroData.saldo_final,
        id_usuario: registroData.id_usuario,
        observacion: registroData.observacion || null,
      })
      .select()
      .single();

    if (error) throw new Error(handleSupabaseError(error));
    return data as RegistroServicio;
  },

  async updateRegistro(id: string, updates: Partial<Omit<RegistroServicio, 'id' | 'created_at' | 'updated_at'>>): Promise<RegistroServicio> {
    const { data, error } = await supabase
      .from('registros_servicios')
      .update({
        ...updates,
        updated_at: getLocalDateTimeISO(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(handleSupabaseError(error));
    return data as RegistroServicio;
  },

  async deleteRegistro(id: string): Promise<void> {
    const { error } = await supabase
      .from('registros_servicios')
      .delete()
      .eq('id', id);

    if (error) throw new Error(handleSupabaseError(error));
  },
};

