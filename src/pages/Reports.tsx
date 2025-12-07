import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { mockSales, mockProducts } from '@/types';
import { BarChart3, TrendingUp, Package, Users, Download, Calendar } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const salesData = [
  { name: 'Lun', ventas: 450 },
  { name: 'Mar', ventas: 520 },
  { name: 'Mié', ventas: 380 },
  { name: 'Jue', ventas: 610 },
  { name: 'Vie', ventas: 750 },
  { name: 'Sáb', ventas: 920 },
  { name: 'Dom', ventas: 340 },
];

const topProducts = mockProducts
  .map(p => ({ name: p.nombre.split(' ')[0], ventas: Math.floor(Math.random() * 50) + 10 }))
  .sort((a, b) => b.ventas - a.ventas)
  .slice(0, 5);

export default function Reports() {
  const totalSemanal = salesData.reduce((sum, day) => sum + day.ventas, 0);
  const promedioDiario = totalSemanal / 7;

  return (
    <DashboardLayout title="Reportes">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between animate-fade-in">
          <div>
            <h2 className="font-display text-xl font-semibold text-foreground">
              Análisis de Ventas
            </h2>
            <p className="text-sm text-muted-foreground">
              Resumen de la semana actual
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Calendar className="h-4 w-4" />
              Esta Semana
            </Button>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 animate-fade-in">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Ventas Semanales</p>
                  <p className="font-display text-2xl font-bold">Bs. {totalSemanal.toFixed(2)}</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Promedio Diario</p>
                  <p className="font-display text-2xl font-bold">Bs. {promedioDiario.toFixed(2)}</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-secondary flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Productos Activos</p>
                  <p className="font-display text-2xl font-bold">{mockProducts.length}</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-secondary flex items-center justify-center">
                  <Package className="h-6 w-6 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Transacciones</p>
                  <p className="font-display text-2xl font-bold">{mockSales.length * 7}</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-secondary flex items-center justify-center">
                  <Users className="h-6 w-6 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Sales Trend */}
          <Card className="animate-slide-up">
            <CardHeader>
              <CardTitle className="font-display">Tendencia de Ventas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salesData}>
                    <defs>
                      <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(224, 71%, 45%)" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="hsl(224, 71%, 45%)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
                    <XAxis 
                      dataKey="name" 
                      stroke="hsl(220, 9%, 46%)"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="hsl(220, 9%, 46%)"
                      fontSize={12}
                      tickFormatter={(value) => `Bs.${value}`}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(0, 0%, 100%)',
                        border: '1px solid hsl(220, 13%, 91%)',
                        borderRadius: '8px',
                      }}
                      formatter={(value) => [`Bs. ${value}`, 'Ventas']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="ventas" 
                      stroke="hsl(224, 71%, 45%)" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorVentas)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Top Products */}
          <Card className="animate-slide-up">
            <CardHeader>
              <CardTitle className="font-display">Productos Más Vendidos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topProducts} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
                    <XAxis 
                      type="number" 
                      stroke="hsl(220, 9%, 46%)"
                      fontSize={12}
                    />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      stroke="hsl(220, 9%, 46%)"
                      fontSize={12}
                      width={80}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(0, 0%, 100%)',
                        border: '1px solid hsl(220, 13%, 91%)',
                        borderRadius: '8px',
                      }}
                      formatter={(value) => [`${value} unidades`, 'Ventas']}
                    />
                    <Bar 
                      dataKey="ventas" 
                      fill="hsl(162, 63%, 41%)" 
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
