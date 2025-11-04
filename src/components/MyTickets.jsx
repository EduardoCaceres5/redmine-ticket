import { useState, useEffect } from "react";
import { useKeycloak } from '@react-keycloak/web';
import { Link } from 'react-router-dom';
import axios from "axios";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Loader2,
  TicketIcon,
  Eye,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  Plus,
  X,
  ArrowLeft,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const MyTickets = () => {
  const { keycloak } = useKeycloak();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Cargar tickets del usuario
  useEffect(() => {
    const fetchMyTickets = async () => {
      if (!keycloak.tokenParsed?.sub) {
        toast.error("No se pudo obtener la información del usuario");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/api/tickets/my-tickets`, {
          params: {
            keycloak_sub: keycloak.tokenParsed.sub
          }
        });

        setTickets(response.data.issues || []);
      } catch (error) {
        console.error("Error al cargar tickets:", error);
        toast.error("Error al cargar tus tickets");
      } finally {
        setLoading(false);
      }
    };

    fetchMyTickets();
  }, [keycloak]);

  // Cargar detalle de un ticket
  const handleViewDetails = async (ticketId) => {
    try {
      setLoadingDetail(true);
      const response = await axios.get(`${API_URL}/api/tickets/${ticketId}`);
      setSelectedTicket(response.data.issue);
    } catch (error) {
      console.error("Error al cargar detalle:", error);
      toast.error("Error al cargar el detalle del ticket");
    } finally {
      setLoadingDetail(false);
    }
  };

  // Función para obtener el color del badge según el estado
  const getStatusBadge = (status) => {
    const statusName = status?.name?.toLowerCase() || "";

    if (statusName.includes("nuevo") || statusName.includes("new")) {
      return <Badge variant="default" className="bg-blue-500">{status.name}</Badge>;
    }
    if (statusName.includes("proceso") || statusName.includes("progress") || statusName.includes("asignado")) {
      return <Badge variant="default" className="bg-yellow-500">{status.name}</Badge>;
    }
    if (statusName.includes("resuelto") || statusName.includes("resolved") || statusName.includes("cerrado") || statusName.includes("closed")) {
      return <Badge variant="default" className="bg-green-500">{status.name}</Badge>;
    }
    return <Badge variant="secondary">{status.name}</Badge>;
  };

  // Función para obtener el color del badge según la prioridad
  const getPriorityBadge = (priority) => {
    const priorityName = priority?.name?.toLowerCase() || "";

    if (priorityName.includes("baja") || priorityName.includes("low")) {
      return <Badge variant="outline" className="border-green-500 text-green-700">{priority.name}</Badge>;
    }
    if (priorityName.includes("normal")) {
      return <Badge variant="outline" className="border-blue-500 text-blue-700">{priority.name}</Badge>;
    }
    if (priorityName.includes("alta") || priorityName.includes("high")) {
      return <Badge variant="outline" className="border-orange-500 text-orange-700">{priority.name}</Badge>;
    }
    if (priorityName.includes("urgente") || priorityName.includes("urgent") || priorityName.includes("inmediata")) {
      return <Badge variant="outline" className="border-red-500 text-red-700">{priority.name}</Badge>;
    }
    return <Badge variant="outline">{priority.name}</Badge>;
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Mis Tickets de Soporte</h1>
        <p className="text-muted-foreground">
          Revisa el estado de tus solicitudes de soporte
        </p>
      </div>

      {tickets.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <TicketIcon className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No tienes tickets registrados</h3>
            <p className="text-muted-foreground text-center">
              Cuando crees un ticket de soporte, aparecerá aquí
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className={`grid gap-6 ${selectedTicket ? 'lg:grid-cols-2' : 'grid-cols-1 lg:grid-cols-2'}`}>
          {/* Lista de tickets - oculta en móvil cuando hay ticket seleccionado */}
          <div className={`space-y-4 ${selectedTicket ? 'hidden lg:block' : 'block'}`}>
            {tickets.map((ticket) => (
              <motion.div
                key={ticket.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: selectedTicket?.id === ticket.id ? 0.95 : 1
                }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ scale: selectedTicket?.id === ticket.id ? 0.95 : 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{
                  duration: 0.3,
                  ease: "easeInOut"
                }}
              >
                <Card
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedTicket?.id === ticket.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => handleViewDetails(ticket.id)}
                >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <TicketIcon className="w-5 h-5" />
                        #{ticket.id} - {ticket.subject}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {ticket.project?.name}
                      </CardDescription>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewDetails(ticket.id);
                      }}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {getStatusBadge(ticket.status)}
                    {getPriorityBadge(ticket.priority)}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(ticket.created_on)}
                    </div>
                  </div>
                </CardContent>
              </Card>
              </motion.div>
            ))}
          </div>

          {/* Detalle del ticket seleccionado - muestra en pantalla completa en móvil */}
          <div className={`lg:sticky lg:top-4 lg:h-fit ${selectedTicket ? 'block' : 'hidden lg:block'}`}>
            <AnimatePresence mode="wait">
              {loadingDetail ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card>
                    <CardContent className="flex items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </CardContent>
                  </Card>
                </motion.div>
              ) : selectedTicket ? (
                <motion.div
                  key={`ticket-${selectedTicket.id}`}
                  initial={{ opacity: 0, x: 50, scale: 0.9 }}
                  animate={{ opacity: 1, x: 0, scale: 1.02 }}
                  exit={{ opacity: 0, x: -50, scale: 0.9 }}
                  transition={{
                    duration: 0.4,
                    ease: [0.34, 1.56, 0.64, 1]
                  }}
                >
                  <Card>
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 flex-1">
                      {/* Botón de volver - solo visible en móvil */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedTicket(null)}
                        className="lg:hidden h-8 w-8 p-0 shrink-0"
                        title="Volver a la lista"
                      >
                        <ArrowLeft className="h-4 w-4" />
                      </Button>
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <TicketIcon className="w-5 h-5" />
                          Ticket #{selectedTicket.id}
                        </CardTitle>
                        <CardDescription>
                          {selectedTicket.project?.name}
                        </CardDescription>
                      </div>
                    </div>
                    {/* Botón de cerrar - solo visible en desktop */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedTicket(null)}
                      className="hidden lg:block h-8 w-8 p-0 shrink-0"
                      title="Cerrar detalle"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Asunto</h3>
                    <p className="text-sm">{selectedTicket.subject}</p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Estado y Prioridad</h3>
                    <div className="flex flex-wrap gap-2">
                      {getStatusBadge(selectedTicket.status)}
                      {getPriorityBadge(selectedTicket.priority)}
                      {selectedTicket.tracker && (
                        <Badge variant="outline">{selectedTicket.tracker.name}</Badge>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Descripción</h3>
                    <div className="text-sm bg-muted p-3 rounded-md whitespace-pre-wrap max-h-96 overflow-y-auto">
                      {selectedTicket.description}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <h3 className="font-semibold mb-1">Creado</h3>
                      <p className="text-muted-foreground">
                        {formatDate(selectedTicket.created_on)}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Actualizado</h3>
                      <p className="text-muted-foreground">
                        {formatDate(selectedTicket.updated_on)}
                      </p>
                    </div>
                  </div>

                  {selectedTicket.attachments && selectedTicket.attachments.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">Archivos Adjuntos</h3>
                      <div className="space-y-2">
                        {selectedTicket.attachments.map((file) => (
                          <a
                            key={file.id}
                            href={file.content_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-primary hover:underline"
                          >
                            <TicketIcon className="w-4 h-4" />
                            {file.filename}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedTicket.journals && selectedTicket.journals.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">Historial de Cambios</h3>
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {selectedTicket.journals.map((journal) => (
                          <div
                            key={journal.id}
                            className="border-l-2 border-muted pl-3 text-sm"
                          >
                            <div className="font-medium">
                              {journal.user?.name || 'Sistema'}
                            </div>
                            <div className="text-xs text-muted-foreground mb-1">
                              {formatDate(journal.created_on)}
                            </div>
                            {journal.notes && (
                              <p className="text-muted-foreground whitespace-pre-wrap">
                                {journal.notes}
                              </p>
                            )}
                            {journal.details && journal.details.length > 0 && (
                              <div className="mt-1 text-xs">
                                {journal.details.map((detail, idx) => (
                                  <div key={idx} className="text-muted-foreground">
                                    {detail.name}: {detail.old_value || '(vacío)'} → {detail.new_value}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <Eye className="w-16 h-16 text-muted-foreground mb-4" />
                      <h3 className="text-xl font-semibold mb-2">Selecciona un ticket</h3>
                      <p className="text-muted-foreground text-center">
                        Haz clic en un ticket para ver sus detalles
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Botón flotante para crear nuevo ticket */}
      <Link to="/nuevo-ticket">
        <Button
          size="lg"
          className="fixed bottom-24 right-6 h-14 px-6 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 bg-blue-900 hover:bg-blue-950 text-white flex items-center gap-2"
          title="Crear nuevo ticket"
        >
          <Plus className="h-6 w-6 text-white" strokeWidth={2.5} />
          <span className="font-semibold text-base text-white">Nuevo Ticket</span>
        </Button>
      </Link>
    </div>
  );
};

export default MyTickets;
