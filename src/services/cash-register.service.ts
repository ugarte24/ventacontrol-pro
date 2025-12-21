import { supabase } from '@/lib/supabase';
import { CashRegister } from '@/types';
import { handleSupabaseError } from '@/lib/error-handler';
import { getLocalDateTimeISO } from '@/lib/utils';

export const cashRegisterService = {
  // Obtener arqueo abierto del día actual
  async getOpenRegister(): Promise<CashRegister | null> {
    // Obtener fecha local (no UTC) para evitar problemas de zona horaria
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const { data, error } = await supabase
      .from('arqueos_caja')
      .select('*')
      .eq('fecha', today)
      .eq('estado', 'abierto')
      .maybeSingle();

    if (error) {
      // Si es un error de "no encontrado" o 406, retornar null
      if (error.code === 'PGRST116' || error.code === '406' || error.message?.includes('Not Acceptable')) {
        return null;
      }
      throw new Error(handleSupabaseError(error));
    }
    
    return data as CashRegister | null;
  },

  // Obtener todos los arqueos
  async getAll(): Promise<CashRegister[]> {
    const { data, error } = await supabase
      .from('arqueos_caja')
      .select('*')
      .order('fecha', { ascending: false })
      .order('hora_apertura', { ascending: false });

    if (error) throw new Error(handleSupabaseError(error));
    return data as CashRegister[];
  },

  // Obtener arqueo por ID
  async getById(id: string): Promise<CashRegister | null> {
    const { data, error } = await supabase
      .from('arqueos_caja')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(handleSupabaseError(error));
    }
    return data as CashRegister;
  },

  // Calcular total de ventas en efectivo del día
  async getTodayCashSales(): Promise<number> {
    // Obtener fecha local (no UTC) para evitar problemas de zona horaria
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const { data, error } = await supabase
      .from('ventas')
      .select('total')
      .eq('fecha', today)
      .eq('metodo_pago', 'efectivo')
      .eq('estado', 'completada');

    if (error) throw new Error(handleSupabaseError(error));
    
    return data.reduce((sum, sale) => sum + sale.total, 0);
  },

  // Calcular total de todas las ventas del día (excluyendo créditos)
  async getTodayTotalSales(): Promise<number> {
    // Obtener fecha local (no UTC) para evitar problemas de zona horaria
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const { data, error } = await supabase
      .from('ventas')
      .select('total')
      .eq('fecha', today)
      .eq('estado', 'completada')
      .neq('metodo_pago', 'credito'); // Excluir ventas a crédito

    if (error) throw new Error(handleSupabaseError(error));
    
    return data.reduce((sum, sale) => sum + sale.total, 0);
  },

  // Abrir caja
  async openRegister(montoInicial: number, idAdministrador: string): Promise<CashRegister> {
    // Obtener fecha local (no UTC) para evitar problemas de zona horaria
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const horaApertura = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    // Calcular total de ventas del día
    const totalVentas = await this.getTodayTotalSales();
    
    // Obtener timestamps en hora local
    const createdAt = getLocalDateTimeISO();
    const updatedAt = getLocalDateTimeISO();

    const { data, error } = await supabase
      .from('arqueos_caja')
      .insert({
        fecha: today,
        hora_apertura: horaApertura,
        monto_inicial: montoInicial,
        total_ventas: totalVentas,
        efectivo_real: null,
        diferencia: 0,
        id_administrador: idAdministrador,
        observacion: null,
        estado: 'abierto',
        created_at: createdAt, // Timestamp explícito en hora local
        updated_at: updatedAt, // Timestamp explícito en hora local
      })
      .select()
      .single();

    if (error) throw new Error(handleSupabaseError(error));
    return data as CashRegister;
  },

  // Cerrar caja
  async closeRegister(
    id: string,
    efectivoReal: number,
    observacion?: string
  ): Promise<CashRegister> {
    const now = new Date();
    const horaCierre = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    // Obtener el arqueo actual
    const arqueo = await this.getById(id);
    if (!arqueo) {
      throw new Error('Arqueo no encontrado');
    }

    // Calcular diferencia
    const totalEsperado = arqueo.monto_inicial + arqueo.total_ventas;
    const diferencia = efectivoReal - totalEsperado;

    // Obtener timestamp de actualización en hora local
    const updatedAt = getLocalDateTimeISO();
    
    const { data, error } = await supabase
      .from('arqueos_caja')
      .update({
        hora_cierre: horaCierre,
        efectivo_real: efectivoReal,
        diferencia: diferencia,
        observacion: observacion || null,
        estado: 'cerrado',
        updated_at: updatedAt, // Timestamp explícito en hora local
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(handleSupabaseError(error));
    return data as CashRegister;
  },

  // Actualizar total de ventas del arqueo abierto
  async updateSalesTotal(id: string): Promise<void> {
    const totalVentas = await this.getTodayTotalSales();
    // Obtener timestamp de actualización en hora local
    const updatedAt = getLocalDateTimeISO();
    
    const { error } = await supabase
      .from('arqueos_caja')
      .update({ 
        total_ventas: totalVentas,
        updated_at: updatedAt, // Timestamp explícito en hora local
      })
      .eq('id', id);

    if (error) throw new Error(handleSupabaseError(error));
  },

  // Actualizar arqueo
  async update(
    id: string,
    updates: {
      monto_inicial?: number;
      efectivo_real?: number | null;
      observacion?: string | null;
      hora_apertura?: string;
      hora_cierre?: string | null;
    }
  ): Promise<CashRegister> {
    // Obtener el arqueo actual
    const arqueo = await this.getById(id);
    if (!arqueo) {
      throw new Error('Arqueo no encontrado');
    }

    // Calcular diferencia si se actualiza efectivo_real
    let diferencia = arqueo.diferencia;
    if (updates.efectivo_real !== undefined) {
      const montoInicial = updates.monto_inicial ?? arqueo.monto_inicial;
      const totalEsperado = montoInicial + arqueo.total_ventas;
      diferencia = updates.efectivo_real - totalEsperado;
    } else if (updates.monto_inicial !== undefined) {
      const efectivoReal = arqueo.efectivo_real ?? 0;
      const totalEsperado = updates.monto_inicial + arqueo.total_ventas;
      diferencia = efectivoReal - totalEsperado;
    }

    // Obtener timestamp de actualización en hora local
    const updatedAt = getLocalDateTimeISO();
    
    const { data, error } = await supabase
      .from('arqueos_caja')
      .update({
        ...updates,
        diferencia,
        updated_at: updatedAt, // Timestamp explícito en hora local
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(handleSupabaseError(error));
    return data as CashRegister;
  },
};

