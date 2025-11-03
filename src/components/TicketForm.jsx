import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Loader2,
  X,
  Upload,
  Image as ImageIcon,
  Search,
  ChevronDown,
  File,
  FileText,
  FilePdf,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Esquema de validación con Zod
const ticketSchema = z.object({
  project_id: z
    .union([z.string(), z.number()])
    .refine((val) => val !== "" && val !== null && val !== undefined, {
      message: "Debe seleccionar un sistema",
    })
    .transform((val) => (typeof val === "string" ? parseInt(val) : val))
    .refine((val) => !isNaN(val) && val > 0, {
      message: "Debe seleccionar un sistema válido",
    }),
  subject: z.string().min(3, "El asunto debe tener al menos 3 caracteres"),
  description: z
    .string()
    .min(10, "La descripción debe tener al menos 10 caracteres"),
  modulo: z.string().optional(),
  numero_tramite: z.string().optional(),
  identificador_operacion: z.string().optional(),
});

// Función auxiliar para obtener el icono según el tipo de archivo
const getFileIcon = (fileType) => {
  if (fileType.startsWith("image/")) {
    return ImageIcon;
  } else if (fileType === "application/pdf") {
    return FilePdf;
  } else if (
    fileType.includes("text") ||
    fileType.includes("document") ||
    fileType.includes("word")
  ) {
    return FileText;
  }
  return File;
};

function TicketForm({ onTicketCreated }) {
  const [formData, setFormData] = useState({
    subject: "",
    description: "",
    modulo: "",
    numero_tramite: "",
    identificador_operacion: "",
    project_id: 0, // Iniciará vacío para forzar selección
    tracker_id: "",
    priority_id: "",
  });

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const dropdownRef = useRef(null);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
        setSearchTerm("");
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  // Cargar datos iniciales (proyectos, trackers, prioridades)
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [projectsRes, trackersRes, prioritiesRes] = await Promise.all([
          axios.get(`${API_URL}/api/projects`),
          axios.get(`${API_URL}/api/trackers`),
          axios.get(`${API_URL}/api/priorities`),
        ]);

        setProjects(projectsRes.data.projects || []);

        // No establecer project_id por defecto para obligar al usuario a seleccionar

        // Buscar tracker "Support" o usar el primero
        const supportTracker = trackersRes.data.trackers?.find(
          (t) =>
            t.name.toLowerCase().includes("support") ||
            t.name.toLowerCase().includes("soporte")
        );
        const defaultTracker = supportTracker || trackersRes.data.trackers?.[0];
        if (defaultTracker) {
          setFormData((prev) => ({ ...prev, tracker_id: defaultTracker.id }));
        }

        // Buscar prioridad "Normal"
        const normalPriority = prioritiesRes.data.issue_priorities?.find((p) =>
          p.name.toLowerCase().includes("normal")
        );
        const defaultPriority =
          normalPriority ||
          prioritiesRes.data.issue_priorities?.[
            Math.floor(prioritiesRes.data.issue_priorities.length / 2)
          ];
        if (defaultPriority) {
          setFormData((prev) => ({ ...prev, priority_id: defaultPriority.id }));
        }

        setLoadingData(false);
      } catch (err) {
        console.error("Error cargando datos iniciales:", err);
        toast.error(
          "Error al conectar con el servidor. Verifica que el backend esté ejecutándose."
        );
        setLoadingData(false);
      }
    };

    fetchInitialData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Limpiar error del campo cuando el usuario empieza a escribir
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);

    setSelectedFiles(files);

    // Crear previsualizaciones
    const previews = files.map((file) => ({
      file,
      url: file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
      name: file.name,
      type: file.type,
    }));

    setFilePreviews(previews);
  };

  const removeFile = (index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviews = filePreviews.filter((_, i) => i !== index);

    // Liberar URL del objeto si existe
    if (filePreviews[index].url) {
      URL.revokeObjectURL(filePreviews[index].url);
    }

    setSelectedFiles(newFiles);
    setFilePreviews(newPreviews);
  };

  // Filtrar proyectos según el término de búsqueda
  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Obtener el nombre del proyecto seleccionado
  const selectedProject = projects.find((p) => p.id == formData.project_id);

  const handleProjectSelect = (projectId) => {
    setFormData((prev) => ({ ...prev, project_id: projectId }));
    setIsDropdownOpen(false);
    setSearchTerm("");

    // Limpiar error de project_id si existe
    if (errors.project_id) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.project_id;
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Preparar datos para validación (convertir valores vacíos a strings)
    const dataToValidate = {
      ...formData,
      project_id: formData.project_id || "",
      subject: formData.subject || "",
      description: formData.description || "",
      modulo: formData.modulo || "",
      numero_tramite: formData.numero_tramite || "",
      identificador_operacion: formData.identificador_operacion || "",
    };

    // Validar con Zod
    const validation = ticketSchema.safeParse(dataToValidate);

    if (!validation.success) {
      // Convertir errores de Zod a objeto de errores
      const zodErrors = {};
      validation.error.issues.forEach((issue) => {
        zodErrors[issue.path[0]] = issue.message;
      });
      setErrors(zodErrors);

      // Mostrar notificación de error
      toast.error("Por favor, corrija los errores en el formulario", {
        duration: 4000,
      });
      return;
    }

    // Limpiar errores si todo es válido
    setErrors({});
    setLoading(true);

    try {
      // Crear FormData para enviar archivos
      const submitData = new FormData();

      // Agregar campos del formulario
      Object.keys(formData).forEach((key) => {
        if (formData[key]) {
          submitData.append(key, formData[key]);
        }
      });

      // Agregar archivos
      selectedFiles.forEach((file) => {
        submitData.append("attachments", file);
      });

      const response = await axios.post(`${API_URL}/api/tickets`, submitData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Notificar éxito
      toast.success(`Ticket #${response.data.ticket.id} creado exitosamente`, {
        description: response.data.ticket.subject,
        duration: 5000,
      });

      if (onTicketCreated) {
        onTicketCreated(response.data.ticket);
      }

      // Limpiar formulario
      setFormData({
        subject: "",
        description: "",
        modulo: "",
        numero_tramite: "",
        identificador_operacion: "",
        project_id: formData.project_id,
        tracker_id: formData.tracker_id,
        priority_id: formData.priority_id,
      });

      // Limpiar archivos y previsualizaciones
      filePreviews.forEach((preview) => {
        if (preview.url) {
          URL.revokeObjectURL(preview.url);
        }
      });
      setSelectedFiles([]);
      setFilePreviews([]);

      // Limpiar errores
      setErrors({});
    } catch (err) {
      console.error("Error creando ticket:", err);
      toast.error(
        err.response?.data?.details ||
          err.response?.data?.error ||
          "Error al crear el ticket. Intenta nuevamente.",
        {
          duration: 6000,
        }
      );
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Cargando datos del sistema...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Crear Nuevo Ticket</CardTitle>
        <CardDescription>
          Completa el formulario para crear un nuevo ticket de soporte
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
          {/* Clasificación - MOVIDO ARRIBA */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Clasificación</h3>

            <div className="space-y-2">
              <Label htmlFor="project_id">
                Sistema <span className="text-red-500">*</span>
              </Label>
              <div className="relative" ref={dropdownRef}>
                {/* Campo clickeable que abre el dropdown */}
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm border rounded-md bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 ${
                    errors.project_id
                      ? "border-red-500 focus:ring-red-400"
                      : "border-slate-300 focus:ring-slate-400"
                  }`}
                >
                  <span
                    className={
                      formData.project_id ? "text-slate-900" : "text-slate-500"
                    }
                  >
                    {selectedProject
                      ? selectedProject.name.toUpperCase()
                      : "Seleccionar sistema..."}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 text-slate-500 transition-transform ${
                      isDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Dropdown con buscador */}
                {isDropdownOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-slate-300 rounded-md shadow-lg">
                    {/* Buscador */}
                    <div className="p-2 border-b border-slate-200">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          type="text"
                          placeholder="Buscar sistema..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-9 py-2 text-sm"
                          autoComplete="off"
                          autoFocus
                        />
                      </div>
                    </div>

                    {/* Lista de opciones */}
                    <div className="max-h-60 overflow-y-auto">
                      {filteredProjects.length > 0 ? (
                        filteredProjects.map((project) => (
                          <button
                            key={project.id}
                            type="button"
                            onClick={() => handleProjectSelect(project.id)}
                            className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-100 ${
                              formData.project_id == project.id
                                ? "bg-slate-100 font-semibold"
                                : ""
                            }`}
                          >
                            {project.name.toUpperCase()}
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-sm text-slate-500 text-center">
                          No se encontraron sistemas
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Input oculto para envío del formulario */}
                <input
                  type="hidden"
                  name="project_id"
                  value={formData.project_id}
                />
              </div>
              {errors.project_id && (
                <p className="text-sm text-red-600 mt-1">{errors.project_id}</p>
              )}
            </div>
          </div>

          {/* Información del Ticket */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Información General</h3>

            <div className="space-y-2">
              <Label htmlFor="subject">
                Asunto <span className="text-red-500">*</span>
              </Label>
              <Input
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="Breve descripción del problema"
                autoComplete="off"
                className={
                  errors.subject ? "border-red-500 focus:ring-red-400" : ""
                }
              />
              {errors.subject && (
                <p className="text-sm text-red-600">{errors.subject}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">
                Descripción <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={6}
                placeholder="Describe detalladamente el problema o solicitud"
                autoComplete="off"
                className={
                  errors.description ? "border-red-500 focus:ring-red-400" : ""
                }
              />
              {errors.description && (
                <p className="text-sm text-red-600">{errors.description}</p>
              )}
            </div>
          </div>

          {/* Identificadores */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Identificadores</h3>

            <div className="space-y-2">
              <Label htmlFor="modulo">Módulo</Label>
              <Input
                id="modulo"
                name="modulo"
                value={formData.modulo}
                onChange={handleChange}
                placeholder="Ej: Ventas, Compras, Inventario"
                autoComplete="off"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="numero_tramite">Número de Trámite</Label>
                <Input
                  id="numero_tramite"
                  name="numero_tramite"
                  value={formData.numero_tramite}
                  onChange={handleChange}
                  placeholder="Ej: 12345"
                  autoComplete="off"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="identificador_operacion">
                  Identificador de Operación
                </Label>
                <Input
                  id="identificador_operacion"
                  name="identificador_operacion"
                  value={formData.identificador_operacion}
                  onChange={handleChange}
                  placeholder="Ej: OP-2024-001"
                  autoComplete="off"
                />
              </div>
            </div>
          </div>

          {/* Adjuntos */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Adjuntos</h3>

            <div className="space-y-2">
              <Label htmlFor="attachments">Archivos (opcional)</Label>
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="attachments"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-2 text-slate-500" />
                    <p className="mb-2 text-sm text-slate-500">
                      <span className="font-semibold">Click para subir</span> o
                      arrastra y suelta
                    </p>
                    <p className="text-xs text-slate-500">
                      PDF, imágenes, documentos y más
                    </p>
                  </div>
                  <Input
                    id="attachments"
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Previsualizaciones de archivos */}
              {filePreviews.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                  {filePreviews.map((preview, index) => {
                    const FileIconComponent = getFileIcon(preview.type);
                    const isImage = preview.url !== null;

                    return (
                      <div
                        key={index}
                        className="relative group rounded-lg overflow-hidden border border-slate-200 bg-white"
                      >
                        {isImage ? (
                          <img
                            src={preview.url}
                            alt={preview.name}
                            className="w-full h-32 object-cover"
                          />
                        ) : (
                          <div className="w-full h-32 flex items-center justify-center bg-slate-100">
                            <FileIconComponent className="w-12 h-12 text-slate-400" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 text-white rounded-full p-2 hover:bg-red-600"
                            title="Eliminar archivo"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="p-2 bg-slate-50">
                          <p
                            className="text-xs text-slate-600 truncate"
                            title={preview.name}
                          >
                            <FileIconComponent className="w-3 h-3 inline mr-1" />
                            {preview.name}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Creando ticket..." : "Crear Ticket"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default TicketForm;
