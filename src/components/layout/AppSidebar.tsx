import { useState, useMemo, useEffect } from 'react';
import { Home, ShoppingCart, Package, BarChart3, Users, Settings, LogOut, Receipt, FolderTree, UserCircle, Wallet, ArrowLeftRight, DollarSign, Wrench, Calendar, History, Search, ChevronDown, ChevronRight } from 'lucide-react';
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { APP_VERSION } from '@/lib/constants';

const menuSections = [
  {
    label: 'Principal',
    items: [
      { title: 'Panel de Control', url: '/dashboard', icon: Home, roles: ['admin', 'vendedor'] },
    ],
  },
  {
    label: 'Ventas',
    items: [
      { title: 'Nueva Venta', url: '/ventas/nueva', icon: ShoppingCart, roles: ['admin', 'vendedor'] },
      { title: 'Historial de Ventas', url: '/ventas', icon: Receipt, roles: ['admin', 'vendedor'] },
      { title: 'Ventas a Crédito', url: '/creditos', icon: DollarSign, roles: ['admin', 'vendedor'] },
    ],
  },
  {
    label: 'Servicios',
    items: [
      { title: 'Servicios', url: '/servicios', icon: Wrench, roles: ['admin', 'vendedor'] },
      { title: 'Registro Servicios', url: '/servicios/registro', icon: Calendar, roles: ['admin', 'vendedor'] },
      { title: 'Historial Servicios', url: '/servicios/historial', icon: History, roles: ['admin', 'vendedor'] },
    ],
  },
  {
    label: 'Inventario',
    items: [
      { title: 'Productos', url: '/productos', icon: Package, roles: ['admin'] },
      { title: 'Categorías', url: '/categorias', icon: FolderTree, roles: ['admin'] },
      { title: 'Movimientos Inventario', url: '/inventario/movimientos', icon: ArrowLeftRight, roles: ['admin'] },
    ],
  },
  {
    label: 'Administración',
    items: [
      { title: 'Clientes', url: '/clientes', icon: UserCircle, roles: ['admin', 'vendedor'] },
      { title: 'Arqueo de Caja', url: '/arqueo', icon: Wallet, roles: ['admin'] },
      { title: 'Reportes', url: '/reportes', icon: BarChart3, roles: ['admin'] },
      { title: 'Usuarios', url: '/usuarios', icon: Users, roles: ['admin'] },
    ],
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const { user, logout } = useAuth();
  const collapsed = state === 'collapsed';
  const [searchTerm, setSearchTerm] = useState('');
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    'Principal': true,
    'Ventas': true,
    'Servicios': true,
    'Inventario': true,
    'Administración': true,
  });

  // Filtrar y preparar secciones según búsqueda y rol
  const filteredSections = useMemo(() => {
    return menuSections.map((section) => {
      // Filtrar items según el rol del usuario
      let filteredItems = section.items.filter(item => 
        user && item.roles.includes(user.rol)
      );

      // Si hay término de búsqueda, filtrar también por título
      if (searchTerm.trim()) {
        const searchLower = searchTerm.toLowerCase();
        filteredItems = filteredItems.filter(item =>
          item.title.toLowerCase().includes(searchLower)
        );
      }

      return {
        ...section,
        items: filteredItems,
      };
    }).filter(section => section.items.length > 0); // Solo mostrar secciones con items
  }, [user, searchTerm]);

  const toggleSection = (label: string) => {
    setOpenSections(prev => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  // Si hay búsqueda, abrir todas las secciones que tengan resultados
  useEffect(() => {
    if (searchTerm.trim()) {
      const newOpenSections: Record<string, boolean> = {};
      filteredSections.forEach(section => {
        newOpenSections[section.label] = true;
      });
      setOpenSections(prev => ({ ...prev, ...newOpenSections }));
    }
  }, [searchTerm, filteredSections]);

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border p-4 space-y-3">
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
        {!collapsed && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar en el menú..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9"
              autoFocus={false}
              onFocus={(e) => {
                // Prevenir auto-focus en móvil
                if (window.innerWidth < 768) {
                  e.target.blur();
                }
              }}
            />
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className="px-2 py-1">
        <div className="space-y-0.5">
          {filteredSections.map((section) => {
            const isOpen = openSections[section.label] ?? true;

            return (
              <SidebarGroup key={section.label} className="mb-0 p-0">
                <Collapsible
                  open={isOpen}
                  onOpenChange={() => toggleSection(section.label)}
                >
                  <CollapsibleTrigger asChild>
                    <SidebarGroupLabel 
                      className={cn(
                        "flex items-center justify-between cursor-pointer hover:bg-sidebar-accent/50 rounded px-2 py-1 transition-colors mb-0 h-auto min-h-0",
                        collapsed && "sr-only"
                      )}
                    >
                      <span className="text-sm font-medium">{section.label}</span>
                      {!collapsed && (
                        isOpen ? (
                          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                        )
                      )}
                    </SidebarGroupLabel>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-0.5">
                    <SidebarGroupContent className="mt-0 pt-0 pb-0">
                      <SidebarMenu className="space-y-0.5">
                        {section.items.map((item) => (
                          <SidebarMenuItem key={item.title} className="mb-0">
                            <SidebarMenuButton asChild tooltip={item.title} className="p-0 h-auto min-h-0">
                            <NavLink
                              to={item.url}
                              end={['/ventas', '/servicios'].includes(item.url)}
                                className="flex items-center gap-2 rounded px-2 py-1 pl-4 text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                                activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                              >
                                <item.icon className="h-3.5 w-3.5 shrink-0" />
                                {!collapsed && <span className="text-sm">{item.title}</span>}
                              </NavLink>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        ))}
                      </SidebarMenu>
                    </SidebarGroupContent>
                  </CollapsibleContent>
                </Collapsible>
              </SidebarGroup>
            );
          })}
        </div>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-2">
        <div className={cn("flex items-center gap-2", collapsed && "justify-center")}>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-medium text-sm">
            {user?.nombre.charAt(0).toUpperCase()}
          </div>
          {!collapsed && (
            <div className="flex flex-1 flex-col overflow-hidden">
              <span className="truncate text-sm font-medium text-foreground">{user?.nombre}</span>
              <span className="text-xs capitalize text-muted-foreground">{user?.rol}</span>
            </div>
          )}
        </div>
        <SidebarMenu className="mt-1.5">
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={logout}
              tooltip="Cerrar Sesión"
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              {!collapsed && <span className="text-sm">Cerrar Sesión</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        {!collapsed && (
          <div className="mt-1.5 pt-1.5 border-t border-sidebar-border">
            <p className="text-xs text-center text-muted-foreground">
              Versión {APP_VERSION}
            </p>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
