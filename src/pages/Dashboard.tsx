import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/ui/stat-card';
import { useAuth } from '@/contexts/AuthContext';
import { mockSales, mockProducts } from '@/types';
import { DollarSign, ShoppingBag, TrendingUp, Package, Clock, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const totalVentasHoy = mockSales.reduce((sum, sale) => sum + sale.total, 0);
  const numeroVentas = mockSales.length;
  const ticketPromedio = totalVentasHoy / numeroVentas;
  const productosStockBajo = mockProducts.filter(p => p.stock_actual <= p.stock_minimo);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="animate-slide-up">
          <h2 className="font-display text-2xl font-bold text-foreground">
            {getGreeting()}, {user?.nombre.split(' ')[0]} 👋
          </h2>
          <p className="text-muted-foreground">
            Aquí tienes el resumen de hoy
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Ventas del Día"
            value={`Bs. ${totalVentasHoy.toFixed(2)}`}
            icon={DollarSign}
            variant="primary"
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            title="Número de Ventas"
            value={numeroVentas}
            subtitle="transacciones hoy"
            icon={ShoppingBag}
          />
          <StatCard
            title="Ticket Promedio"
            value={`Bs. ${ticketPromedio.toFixed(2)}`}
            icon={TrendingUp}
            variant="success"
          />
          <StatCard
            title="Stock Bajo"
            value={productosStockBajo.length}
            subtitle="productos por reponer"
            icon={Package}
            variant={productosStockBajo.length > 0 ? 'warning' : 'default'}
          />
        </div>

        {/* Quick Actions + Recent Sales */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Quick Actions */}
          <Card className="lg:col-span-1 animate-fade-in">
            <CardHeader>
              <CardTitle className="font-display text-lg">Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              <Button 
                className="h-12 justify-start gap-3" 
                onClick={() => navigate('/ventas/nueva')}
              >
                <ShoppingBag className="h-5 w-5" />
                Nueva Venta
              </Button>
              {user?.rol === 'admin' && (
                <>
                  <Button 
                    variant="outline" 
                    className="h-12 justify-start gap-3"
                    onClick={() => navigate('/productos')}
                  >
                    <Package className="h-5 w-5" />
                    Ver Productos
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-12 justify-start gap-3"
                    onClick={() => navigate('/reportes')}
                  >
                    <TrendingUp className="h-5 w-5" />
                    Ver Reportes
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* Recent Sales */}
          <Card className="lg:col-span-2 animate-fade-in">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="font-display text-lg">Últimas Ventas</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('/ventas')}>
                Ver todas
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockSales.map((sale) => (
                  <div 
                    key={sale.id} 
                    className="flex items-center justify-between rounded-lg border bg-card p-4 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <ShoppingBag className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Venta #{sale.id}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {sale.hora} • {sale.items} productos
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground">Bs. {sale.total.toFixed(2)}</p>
                      <Badge variant="outline" className="capitalize">
                        {sale.metodo_pago}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Low Stock Alert */}
        {user?.rol === 'admin' && productosStockBajo.length > 0 && (
          <Card className="border-warning/30 bg-warning/5 animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-display text-lg text-warning">
                <AlertTriangle className="h-5 w-5" />
                Alertas de Stock
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {productosStockBajo.map((product) => (
                  <div 
                    key={product.id}
                    className="flex items-center justify-between rounded-lg border bg-card p-3"
                  >
                    <div>
                      <p className="font-medium text-foreground">{product.nombre}</p>
                      <p className="text-sm text-muted-foreground">Código: {product.codigo}</p>
                    </div>
                    <Badge variant="destructive">
                      {product.stock_actual} unid.
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
