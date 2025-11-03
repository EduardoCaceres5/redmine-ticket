import { useState } from "react";
import Navbar from "./components/Navbar";
import TicketForm from "./components/TicketForm";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Toaster } from "@/components/ui/sonner";
import { CheckCircle2 } from "lucide-react";

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

  return (
    <div className="min-h-screen bg-slate-50">
      <Toaster position="top-right" richColors />
      <Navbar />

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
    </div>
  );
}

export default App;
