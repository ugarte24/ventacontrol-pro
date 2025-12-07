import { createContext, useContext, useState, ReactNode } from 'react';
import { User, UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (usuario: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for MVP
const mockUsers: (User & { password: string })[] = [
  {
    id: '1',
    nombre: 'Admin Principal',
    usuario: 'admin',
    password: 'admin123',
    rol: 'admin',
    estado: 'activo',
    fecha_creacion: '2024-01-01'
  },
  {
    id: '2',
    nombre: 'Juan Vendedor',
    usuario: 'vendedor',
    password: 'vendedor123',
    rol: 'vendedor',
    estado: 'activo',
    fecha_creacion: '2024-01-01'
  }
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = async (usuario: string, password: string): Promise<boolean> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const foundUser = mockUsers.find(
      u => u.usuario === usuario && u.password === password && u.estado === 'activo'
    );

    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
