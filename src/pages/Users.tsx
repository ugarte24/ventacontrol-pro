import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Plus, Users as UsersIcon, Shield, User, MoreHorizontal, Edit } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const mockUsersData = [
  {
    id: '1',
    nombre: 'Admin Principal',
    usuario: 'admin',
    rol: 'admin',
    estado: 'activo',
    fecha_creacion: '2024-01-01'
  },
  {
    id: '2',
    nombre: 'Juan Vendedor',
    usuario: 'vendedor',
    rol: 'vendedor',
    estado: 'activo',
    fecha_creacion: '2024-01-15'
  },
  {
    id: '3',
    nombre: 'María García',
    usuario: 'maria.g',
    rol: 'vendedor',
    estado: 'activo',
    fecha_creacion: '2024-02-01'
  },
  {
    id: '4',
    nombre: 'Carlos Pérez',
    usuario: 'carlos.p',
    rol: 'vendedor',
    estado: 'inactivo',
    fecha_creacion: '2024-01-20'
  },
];

export default function Users() {
  const admins = mockUsersData.filter(u => u.rol === 'admin').length;
  const vendedores = mockUsersData.filter(u => u.rol === 'vendedor').length;
  const activos = mockUsersData.filter(u => u.estado === 'activo').length;

  return (
    <DashboardLayout title="Gestión de Usuarios">
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-3 animate-fade-in">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <UsersIcon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Usuarios</p>
                  <p className="font-display text-2xl font-bold text-foreground">
                    {mockUsersData.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/10">
                  <Shield className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Administradores</p>
                  <p className="font-display text-2xl font-bold text-foreground">
                    {admins}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary">
                  <User className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Vendedores</p>
                  <p className="font-display text-2xl font-bold text-foreground">
                    {vendedores}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card className="animate-slide-up">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-display">Lista de Usuarios</CardTitle>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nuevo Usuario
            </Button>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Nombre de Usuario</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha de Registro</TableHead>
                    <TableHead className="text-center">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockUsersData.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-primary/10 text-primary font-medium">
                              {user.nombre.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{user.nombre}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">@{user.usuario}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={user.rol === 'admin' ? 'default' : 'secondary'}
                          className="capitalize"
                        >
                          {user.rol === 'admin' ? (
                            <><Shield className="mr-1 h-3 w-3" /> Admin</>
                          ) : (
                            <><User className="mr-1 h-3 w-3" /> Vendedor</>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={user.estado === 'activo' ? 'default' : 'secondary'}
                          className={user.estado === 'activo' ? 'bg-success' : ''}
                        >
                          {user.estado}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(user.fecha_creacion).toLocaleDateString('es-BO')}
                      </TableCell>
                      <TableCell className="text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Shield className="mr-2 h-4 w-4" />
                              Cambiar Rol
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
