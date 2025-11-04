import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { ReactKeycloakProvider } from '@react-keycloak/web';
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import TicketForm from "./components/TicketForm";
import MyTickets from "./components/MyTickets";
import PrivateRoute from "./components/PrivateRoute";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import keycloak, { onAuthSuccess } from './keycloak';

// Configuración de inicialización de Keycloak
const keycloakProviderInitConfig = {
  onLoad: 'check-sso',
  checkLoginIframe: false, // Desactivar iframe para Chrome
  pkceMethod: 'S256' // Usar PKCE para mayor seguridad
};

// Componente de rutas que usa useNavigate
function AppRoutes() {
  const navigate = useNavigate();

  const handleTicketCreated = (ticket) => {
    // Mostrar toast de éxito
    toast.success(`Ticket #${ticket.id} creado exitosamente`, {
      description: ticket.subject,
      duration: 5000,
    });

    // Redirigir a la lista de tickets
    navigate('/');
  };

  return (
    <PrivateRoute>
      <Routes>
        {/* Ruta principal: ver mis tickets */}
        <Route path="/" element={<MyTickets />} />

        {/* Ruta para crear nuevo ticket */}
        <Route
          path="/nuevo-ticket"
          element={
            <div className="container mx-auto px-4 py-8 max-w-4xl">
              <TicketForm onTicketCreated={handleTicketCreated} />
            </div>
          }
        />

        {/* Redirigir rutas no encontradas a la página principal */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </PrivateRoute>
  );
}

function App() {

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
      <BrowserRouter>
        <div className="min-h-screen bg-slate-50 flex flex-col">
          <Toaster position="top-right" richColors />
          <Navbar />
          <main className="flex-1">
            <AppRoutes />
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </ReactKeycloakProvider>
  );
}

export default App;
