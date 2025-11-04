import { useKeycloak } from '@react-keycloak/web';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut, User, TicketIcon, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import logo from "../assets/logo.png";

function Navbar() {
  const { keycloak, initialized } = useKeycloak();

  const handleLogout = () => {
    keycloak.logout();
  };

  // Función para obtener las iniciales del usuario
  const getInitials = (name) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const userName = keycloak.tokenParsed?.name ||
                   keycloak.tokenParsed?.preferred_username ||
                   'Usuario';
  const userEmail = keycloak.tokenParsed?.email;

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
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
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

              {/* Dropdown Menu del Usuario */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 h-9 px-2 hover:bg-slate-100"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs bg-slate-200">
                        {getInitials(userName)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden md:inline text-sm font-medium text-slate-700">
                      {userName}
                    </span>
                    <ChevronDown className="h-4 w-4 text-slate-500 hidden md:inline" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{userName}</p>
                      {userEmail && (
                        <p className="text-xs leading-none text-slate-500">
                          {userEmail}
                        </p>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Cerrar sesión</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
