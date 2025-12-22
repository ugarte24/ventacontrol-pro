import { Home, ShoppingCart, Package, BarChart3, Users, Settings, LogOut, Receipt, FolderTree, UserCircle, Wallet, ArrowLeftRight, DollarSign } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useAuth } from '@/contexts';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { APP_VERSION } from '@/lib/constants';

const menuItems = [
  { title: 'Dashboard', url: '/dashboard', icon: Home, roles: ['admin', 'vendedor'] },
  { title: 'Nueva Venta', url: '/ventas/nueva', icon: ShoppingCart, roles: ['admin', 'vendedor'] },
  { title: 'Historial de Ventas', url: '/ventas', icon: Receipt, roles: ['admin', 'vendedor'] },
  { title: 'Productos', url: '/productos', icon: Package, roles: ['admin'] },
  { title: 'Categorías', url: '/categorias', icon: FolderTree, roles: ['admin'] },
  { title: 'Clientes', url: '/clientes', icon: UserCircle, roles: ['admin', 'vendedor'] },
  { title: 'Ventas a Crédito', url: '/creditos', icon: DollarSign, roles: ['admin', 'vendedor'] },
  { title: 'Arqueo de Caja', url: '/arqueo', icon: Wallet, roles: ['admin'] },
  { title: 'Movimientos Inventario', url: '/inventario/movimientos', icon: ArrowLeftRight, roles: ['admin'] },
  { title: 'Reportes', url: '/reportes', icon: BarChart3, roles: ['admin'] },
  { title: 'Usuarios', url: '/usuarios', icon: Users, roles: ['admin'] },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const { user, logout } = useAuth();
  const collapsed = state === 'collapsed';

  const filteredItems = menuItems.filter(item => 
    user && item.roles.includes(user.rol)
  );

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-display font-bold text-lg">
            V+
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-display font-semibold text-foreground">VentaPlus</span>
              <span className="text-xs text-muted-foreground">Sistema de Ventas</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className={cn(collapsed && "sr-only")}>
            Menú Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink
                      to={item.url}
                      end={item.url === '/ventas'}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      <item.icon className="h-5 w-5 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary font-medium text-sm">
            {user?.nombre.charAt(0).toUpperCase()}
          </div>
          {!collapsed && (
            <div className="flex flex-1 flex-col overflow-hidden">
              <span className="truncate text-sm font-medium text-foreground">{user?.nombre}</span>
              <span className="text-xs capitalize text-muted-foreground">{user?.rol}</span>
            </div>
          )}
        </div>
        <SidebarMenu className="mt-3">
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={logout}
              tooltip="Cerrar Sesión"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              {!collapsed && <span>Cerrar Sesión</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        {!collapsed && (
          <div className="mt-3 pt-3 border-t border-sidebar-border">
            <p className="text-xs text-center text-muted-foreground">
              Versión {APP_VERSION}
            </p>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
