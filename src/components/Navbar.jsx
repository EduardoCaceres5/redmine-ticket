import { useKeycloak } from '@react-keycloak/web';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut, User, TicketIcon } from 'lucide-react';
import logo from "../assets/logo.png";

function Navbar() {
  const { keycloak, initialized } = useKeycloak();

  const handleLogout = () => {
    keycloak.logout();
  };

  return (
    <nav className="bg-white border-b border-slate-200 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between min-h-16 py-3 gap-4">
          {/* Logo y título */}
          <Link to="/" className="flex items-center space-x-2 sm:space-x-3 min-w-0">
            <img src={logo} alt="VUE Logo" className="h-8 sm:h-10 w-auto flex-shrink-0" />
            <div className="flex flex-col min-w-0">
              <h1 className="text-base sm:text-xl font-bold text-slate-900 truncate">
                Sistema de Tickets
              </h1>
              <p className="hidden sm:block text-xs text-slate-500">
                Gestión de soporte técnico
              </p>
            </div>
          </Link>

          {/* Navegación y usuario */}
          {initialized && keycloak.authenticated && (
            <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
              {/* Enlace Mis Tickets */}
              <Link to="/">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-700 hover:text-slate-900 flex items-center gap-2"
                >
                  <TicketIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Mis Tickets</span>
                </Button>
              </Link>
              {/* Info del usuario - oculta en móvil pequeño */}
              <div className="hidden md:flex flex-col items-end">
                <div className="flex items-center space-x-2 text-sm text-slate-700">
                  <User className="h-4 w-4" />
                  <span className="font-semibold">
                    {keycloak.tokenParsed?.name ||
                     keycloak.tokenParsed?.preferred_username ||
                     'Usuario'}
                  </span>
                </div>
                {keycloak.tokenParsed?.email && (
                  <span className="text-xs text-slate-500">
                    {keycloak.tokenParsed.email}
                  </span>
                )}
              </div>

              {/* Info del usuario compacta - visible en tablet */}
              <div className="hidden sm:flex md:hidden flex-col items-end">
                <div className="flex items-center space-x-1 text-sm text-slate-700">
                  <User className="h-4 w-4" />
                  <span className="font-semibold text-xs">
                    {keycloak.tokenParsed?.preferred_username || 'Usuario'}
                  </span>
                </div>
              </div>

              {/* Botón de logout */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center space-x-1 sm:space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Cerrar sesión</span>
                <span className="sm:hidden">Salir</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
