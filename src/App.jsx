import { useState } from "react";
import { ReactKeycloakProvider } from '@react-keycloak/web';
import Navbar from "./components/Navbar";
import TicketForm from "./components/TicketForm";
import PrivateRoute from "./components/PrivateRoute";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Toaster } from "@/components/ui/sonner";
import { CheckCircle2 } from "lucide-react";
import keycloak, { onAuthSuccess } from './keycloak';

// Configuración de inicialización de Keycloak
const keycloakProviderInitConfig = {
  onLoad: 'check-sso',
  checkLoginIframe: false, // Desactivar iframe para Chrome
  pkceMethod: 'S256' // Usar PKCE para mayor seguridad
};

function App() {
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdTicket, setCreatedTicket] = useState(null);

  const handleTicketCreated = (ticket) => {
    setCreatedTicket(ticket);
    setShowSuccess(true);

    // Ocultar mensaje después de 5 segundos
    setTimeout(() => {
      setShowSuccess(false);
      setCreatedTicket(null);
    }, 5000);
  };

  // Evento que se ejecuta cuando hay cambios en la autenticación
  const onKeycloakEvent = (event) => {
    if (event === 'onAuthSuccess') {
      onAuthSuccess();
    }
  };

  return (
    <ReactKeycloakProvider
      authClient={keycloak}
      initOptions={keycloakProviderInitConfig}
      onEvent={onKeycloakEvent}
    >
      <div className="min-h-screen bg-slate-50">
        <Toaster position="top-right" richColors />
        <Navbar />

        <PrivateRoute>
          <div className="container mx-auto px-4 py-8 max-w-4xl">
            {showSuccess && createdTicket && (
              <Alert variant="success" className="mb-6">
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle>Ticket creado exitosamente</AlertTitle>
                <AlertDescription>
                  Ticket #{createdTicket.id}: {createdTicket.subject}
                </AlertDescription>
              </Alert>
            )}

            <TicketForm onTicketCreated={handleTicketCreated} />

            <footer className="mt-8 text-center text-sm text-slate-500">
              Sistema integrado con Redmine
            </footer>
          </div>
        </PrivateRoute>
      </div>
    </ReactKeycloakProvider>
  );
}

export default App;
