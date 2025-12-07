import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { useAuth } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import { Separator } from '@/components/ui/separator';

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
}

export function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <CartProvider>
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar />
          <SidebarInset className="flex flex-1 flex-col">
            <header className="flex h-16 shrink-0 items-center gap-4 border-b bg-card px-6">
              <SidebarTrigger className="-ml-2" />
              <Separator orientation="vertical" className="h-6" />
              {title && (
                <h1 className="font-display text-lg font-semibold text-foreground">{title}</h1>
              )}
              <div className="ml-auto flex items-center gap-4">
                <span className="text-sm text-muted-foreground">
                  {new Date().toLocaleDateString('es-BO', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </span>
              </div>
            </header>
            <main className="flex-1 overflow-auto p-6">
              {children}
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </CartProvider>
  );
}
