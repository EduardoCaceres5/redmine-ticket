import { useKeycloak } from '@react-keycloak/web';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { LogIn, Shield } from 'lucide-react';

/**
 * Componente de Loading mientras Keycloak se inicializa
 */
const Loading = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <Card className="w-96">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-slate-600">Cargando...</p>
        </div>
      </CardContent>
    </Card>
  </div>
);

/**
 * Componente que se muestra cuando el usuario no está autenticado
 */
const LoginRequired = ({ onLogin }) => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <Card className="w-96">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
          <Shield className="w-6 h-6 text-blue-600" />
        </div>
        <CardTitle>Autenticación requerida</CardTitle>
        <CardDescription>
          Por favor, inicia sesión para acceder al sistema de tickets
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          onClick={onLogin}
          className="w-full"
        >
          <LogIn className="mr-2 h-4 w-4" />
          Iniciar Sesión
        </Button>
      </CardContent>
    </Card>
  </div>
);

/**
 * Componente de ruta protegida que requiere autenticación con Keycloak
 */
const PrivateRoute = ({ children }) => {
  const { keycloak, initialized } = useKeycloak();

  // Mientras se inicializa Keycloak, mostrar loading
  if (!initialized) {
    return <Loading />;
  }

  // Si no está autenticado, mostrar página de login
  if (!keycloak.authenticated) {
    return <LoginRequired onLogin={() => keycloak.login()} />;
  }

  // Si está autenticado, mostrar el contenido
  return <>{children}</>;
};

export default PrivateRoute;
