import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { LogIn, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const success = await login(usuario, password);
    
    if (success) {
      toast.success('¡Bienvenido a VentaPlus!');
      navigate('/dashboard');
    } else {
      toast.error('Credenciales incorrectas');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
            <span className="font-display text-2xl font-bold">V+</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground">VentaPlus</h1>
          <p className="mt-2 text-muted-foreground">Sistema de Gestión de Ventas</p>
        </div>

        {/* Login Form */}
        <div className="rounded-2xl border bg-card p-8 shadow-card">
          <div className="mb-6">
            <h2 className="font-display text-xl font-semibold text-foreground">Iniciar Sesión</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Ingresa tus credenciales para acceder
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="usuario">Usuario</Label>
              <Input
                id="usuario"
                type="text"
                placeholder="Tu nombre de usuario"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                required
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="h-11 w-full gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="animate-pulse">Ingresando...</span>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  Ingresar
                </>
              )}
            </Button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 rounded-lg bg-muted/50 p-4">
            <p className="mb-2 text-xs font-medium text-muted-foreground">Credenciales de prueba:</p>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p><strong>Admin:</strong> admin / admin123</p>
              <p><strong>Vendedor:</strong> vendedor / vendedor123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
