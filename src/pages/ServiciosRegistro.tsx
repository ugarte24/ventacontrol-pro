import { useState, useMemo, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Calendar,
  TrendingUp,
  TrendingDown,
  Wallet,
  Loader,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { useServicios } from '@/hooks/useServicios';
import { 
  useRegistrosServicios,
  useRegistroServicioPorFecha,
  useCreateRegistroServicio,
  useUpdateRegistroServicio,
  useDeleteRegistroServicio,
  useMovimientosServicios
} from '@/hooks/useServicios';
import { useAuth } from '@/contexts';
import { Servicio, RegistroServicio } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/date-picker';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { getLocalDateISO } from '@/lib/utils';
import { toast } from 'sonner';

// Esquemas de validación
const registroSchema = z.object({
  saldo_inicial: z.number().min(0, 'El saldo inicial no puede ser negativo'),
  saldo_final: z.number().min(0, 'El saldo final no puede ser negativo'),
  observacion: z.string().optional(),
});

type RegistroForm = z.infer<typeof registroSchema>;

export default function ServiciosRegistro() {
  const { user } = useAuth();
  const fechaHoy = getLocalDateISO();
  
  const [fecha, setFecha] = useState(fechaHoy);
  const [selectedServicio, setSelectedServicio] = useState<Servicio | null>(null);
  const [showRegistroDialog, setShowRegistroDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [registroToDelete, setRegistroToDelete] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const { data: servicios, isLoading: loadingServicios } = useServicios();
  const { data: registros, isLoading: loadingRegistros } = useRegistrosServicios({
    fechaDesde: fecha,
    fechaHasta: fecha,
  });

  // Obtener movimientos del día para calcular monto aumentado
  const { data: movimientos } = useMovimientosServicios({
    fechaDesde: fecha,
    fechaHasta: fecha,
  });

  const createRegistro = useCreateRegistroServicio();
  const updateRegistro = useUpdateRegistroServicio();
  const deleteRegistro = useDeleteRegistroServicio();

  const registroForm = useForm<RegistroForm>({
    resolver: zodResolver(registroSchema),
    defaultValues: {
      saldo_inicial: 0,
      saldo_final: 0,
      observacion: '',
    },
  });

  // Crear mapa de registros por servicio
  const registrosPorServicio = useMemo(() => {
    const map = new Map<string, RegistroServicio>();
    registros?.forEach(reg => {
      map.set(reg.id_servicio, reg);
    });
    return map;
  }, [registros]);

  // Crear mapa de movimientos por servicio
  const movimientosPorServicio = useMemo(() => {
    const map = new Map<string, number>();
    movimientos?.forEach(mov => {
      const actual = map.get(mov.id_servicio) || 0;
      map.set(mov.id_servicio, actual + mov.monto);
    });
    return map;
  }, [movimientos]);

  // Paginación
  const totalPages = Math.ceil((servicios?.length || 0) / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedServicios = servicios?.slice(startIndex, endIndex) || [];

  // Resetear página cuando cambien los servicios
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [servicios?.length, currentPage, totalPages]);

  const handleOpenRegistroDialog = (servicio: Servicio) => {
    setSelectedServicio(servicio);
    
    // Buscar si ya existe un registro para esta fecha
    const registroExistente = registrosPorServicio.get(servicio.id);
    
    if (registroExistente) {
      // Si existe, cargar los valores para editar
      registroForm.reset({
        saldo_inicial: registroExistente.saldo_inicial,
        saldo_final: registroExistente.saldo_final,
        observacion: registroExistente.observacion || '',
      });
    } else {
      // Si no existe, usar el saldo actual como inicial y final
      registroForm.reset({
        saldo_inicial: servicio.saldo_actual,
        saldo_final: servicio.saldo_actual,
        observacion: '',
      });
    }
    
    setShowRegistroDialog(true);
  };

  const handleSaveRegistro = async (data: RegistroForm) => {
    if (!selectedServicio || !user) return;

    try {
      const registroExistente = registrosPorServicio.get(selectedServicio.id);

      if (registroExistente) {
        // Actualizar registro existente
        await updateRegistro.mutateAsync({
          id: registroExistente.id,
          updates: {
            saldo_inicial: data.saldo_inicial,
            saldo_final: data.saldo_final,
            observacion: data.observacion || undefined,
          },
        });
      } else {
        // Crear nuevo registro
        await createRegistro.mutateAsync({
          id_servicio: selectedServicio.id,
          fecha: fecha,
          saldo_inicial: data.saldo_inicial,
          saldo_final: data.saldo_final,
          id_usuario: user.id,
          observacion: data.observacion || undefined,
        });
      }

      setShowRegistroDialog(false);
      setSelectedServicio(null);
      registroForm.reset();
    } catch (error) {
      // El error ya se maneja en el hook
    }
  };

  const handleDeleteRegistro = async () => {
    if (!registroToDelete) return;

    try {
      await deleteRegistro.mutateAsync(registroToDelete);
      setShowDeleteDialog(false);
      setRegistroToDelete(null);
    } catch (error) {
      // El error ya se maneja en el hook
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const [year, month, day] = dateString.split('-');
      return `${day}/${month}/${year}`;
    } catch {
      return dateString;
    }
  };

  return (
    <DashboardLayout title="Registro de Servicios">
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
              Registro Diario de Servicios
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Registra el saldo inicial y final de cada servicio por día
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="space-y-2">
              <Label htmlFor="fecha-registro">Fecha</Label>
              <DatePicker
                id="fecha-registro"
                value={fecha}
                onChange={setFecha}
                max={fechaHoy}
              />
            </div>
          </div>
        </div>

        {/* Tabla de Servicios */}
        <Card>
          <CardHeader>
            <CardTitle>Servicios - {formatDate(fecha)}</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingServicios || loadingRegistros ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : !servicios || servicios.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No hay servicios registrados
              </div>
            ) : (
              <div className="rounded-lg border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Servicio</TableHead>
                      <TableHead className="text-right">Saldo Inicial</TableHead>
                      <TableHead className="text-right">Saldo Final</TableHead>
                      <TableHead className="text-right">Aumentado</TableHead>
                      <TableHead className="text-right">Transaccionado</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-center">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedServicios.map((servicio) => {
                      const registro = registrosPorServicio.get(servicio.id);
                      const montoAumentado = movimientosPorServicio.get(servicio.id) || 0;
                      const tieneRegistro = !!registro;

                      return (
                        <TableRow key={servicio.id}>
                          <TableCell className="font-medium">{servicio.nombre}</TableCell>
                          <TableCell className="text-right">
                            {registro ? (
                              <span className="font-semibold">
                                Bs. {registro.saldo_inicial.toFixed(2)}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {registro ? (
                              <span className="font-semibold">
                                Bs. {registro.saldo_final.toFixed(2)}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {montoAumentado > 0 ? (
                              <span className="text-green-600 font-semibold">
                                +Bs. {montoAumentado.toFixed(2)}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">Bs. 0.00</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {registro ? (
                              <span className={registro.monto_transaccionado >= 0 ? 'text-green-600' : 'text-red-600'}>
                                {registro.monto_transaccionado >= 0 ? '+' : ''}
                                Bs. {registro.monto_transaccionado.toFixed(2)}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {tieneRegistro ? (
                              <Badge variant="default" className="gap-1">
                                <CheckCircle2 className="h-3 w-3" />
                                Registrado
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="gap-1">
                                <XCircle className="h-3 w-3" />
                                Pendiente
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenRegistroDialog(servicio)}
                              >
                                {tieneRegistro ? 'Editar' : 'Registrar'}
                              </Button>
                              {tieneRegistro && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setRegistroToDelete(registro.id);
                                    setShowDeleteDialog(true);
                                  }}
                                  className="text-destructive hover:text-destructive"
                                >
                                  Eliminar
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
            {servicios && servicios.length > itemsPerPage && (
              <div className="mt-4 flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => {
                          if (currentPage > 1) setCurrentPage(currentPage - 1);
                        }}
                        className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <PaginationItem key={page}>
                            <PaginationLink
                              onClick={() => setCurrentPage(page)}
                              isActive={currentPage === page}
                              className="cursor-pointer"
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      } else if (page === currentPage - 2 || page === currentPage + 2) {
                        return (
                          <PaginationItem key={page}>
                            <PaginationEllipsis />
                          </PaginationItem>
                        );
                      }
                      return null;
                    })}
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => {
                          if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                        }}
                        className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialog Registrar/Editar */}
      <Dialog open={showRegistroDialog} onOpenChange={setShowRegistroDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {registrosPorServicio.get(selectedServicio?.id || '') ? 'Editar Registro' : 'Registrar Servicio'}
            </DialogTitle>
            <DialogDescription>
              {selectedServicio?.nombre} - {formatDate(fecha)}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={registroForm.handleSubmit(handleSaveRegistro)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="saldo_inicial">Saldo Inicial (Bs.) *</Label>
              <Input
                id="saldo_inicial"
                type="number"
                step="0.01"
                min="0"
                {...registroForm.register('saldo_inicial', { valueAsNumber: true })}
              />
              {registroForm.formState.errors.saldo_inicial && (
                <p className="text-sm text-destructive">
                  {registroForm.formState.errors.saldo_inicial.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="saldo_final">Saldo Final (Bs.) *</Label>
              <Input
                id="saldo_final"
                type="number"
                step="0.01"
                min="0"
                {...registroForm.register('saldo_final', { valueAsNumber: true })}
              />
              {registroForm.formState.errors.saldo_final && (
                <p className="text-sm text-destructive">
                  {registroForm.formState.errors.saldo_final.message}
                </p>
              )}
              {selectedServicio && (
                <p className="text-xs text-muted-foreground">
                  Saldo actual: Bs. {selectedServicio.saldo_actual.toFixed(2)}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="observacion-registro">Observación</Label>
              <Textarea
                id="observacion-registro"
                {...registroForm.register('observacion')}
                placeholder="Notas adicionales..."
                rows={3}
              />
            </div>
            <div className="rounded-lg border p-4 bg-muted/50">
              <p className="text-xs text-muted-foreground mb-1">Resumen del día</p>
              <div className="space-y-1">
                {selectedServicio && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span>Aumentado:</span>
                      <span className="font-semibold text-green-600">
                        +Bs. {(movimientosPorServicio.get(selectedServicio.id) || 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Transaccionado:</span>
                      <span className="font-semibold">
                        {(() => {
                          const saldoInicial = registroForm.watch('saldo_inicial');
                          const saldoFinal = registroForm.watch('saldo_final');
                          const aumentado = movimientosPorServicio.get(selectedServicio.id) || 0;
                          const transaccionado = saldoFinal - saldoInicial - aumentado;
                          return (
                            <span className={transaccionado >= 0 ? 'text-green-600' : 'text-red-600'}>
                              {transaccionado >= 0 ? '+' : ''}Bs. {transaccionado.toFixed(2)}
                            </span>
                          );
                        })()}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowRegistroDialog(false);
                  setSelectedServicio(null);
                  registroForm.reset();
                }}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={createRegistro.isPending || updateRegistro.isPending}
              >
                {(createRegistro.isPending || updateRegistro.isPending) && (
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                )}
                Guardar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Eliminar */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar registro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará el registro de esta fecha. No se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setRegistroToDelete(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteRegistro}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteRegistro.isPending}
            >
              {deleteRegistro.isPending && <Loader className="mr-2 h-4 w-4 animate-spin" />}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}

