import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { mockSales } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Search, Calendar, Download, ShoppingBag, Eye } from 'lucide-react';
import { useState } from 'react';

export default function SalesHistory() {
  const [searchTerm, setSearchTerm] = useState('');

  const totalHoy = mockSales.reduce((sum, sale) => sum + sale.total, 0);

  const getPaymentBadgeVariant = (method: string) => {
    switch (method) {
      case 'efectivo': return 'default';
      case 'qr': return 'secondary';
      case 'transferencia': return 'outline';
      default: return 'default';
    }
  };

  return (
    <DashboardLayout title="Historial de Ventas">
      <div className="space-y-6">
        {/* Summary Card */}
        <div className="grid gap-4 sm:grid-cols-3 animate-fade-in">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <ShoppingBag className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Hoy</p>
                  <p className="font-display text-2xl font-bold text-foreground">
                    Bs. {totalHoy.toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary">
                  <Calendar className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ventas Hoy</p>
                  <p className="font-display text-2xl font-bold text-foreground">
                    {mockSales.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/10">
                  <Download className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ticket Promedio</p>
                  <p className="font-display text-2xl font-bold text-foreground">
                    Bs. {(totalHoy / mockSales.length).toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters & Table */}
        <Card className="animate-slide-up">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-display">Ventas del Día</CardTitle>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Exportar
            </Button>
          </CardHeader>
          <CardContent>
            {/* Search */}
            <div className="mb-4 relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por ID de venta..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Table */}
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Hora</TableHead>
                    <TableHead>Productos</TableHead>
                    <TableHead>Método</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-center">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockSales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell className="font-medium">#{sale.id}</TableCell>
                      <TableCell>{sale.hora}</TableCell>
                      <TableCell>{sale.items} items</TableCell>
                      <TableCell>
                        <Badge variant={getPaymentBadgeVariant(sale.metodo_pago)} className="capitalize">
                          {sale.metodo_pago}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={sale.estado === 'completada' ? 'default' : 'destructive'}
                          className="capitalize"
                        >
                          {sale.estado}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        Bs. {sale.total.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
