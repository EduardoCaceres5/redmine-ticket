# Frontend - Sistema de Tickets Redmine

Aplicación frontend en React + Vite para crear tickets de soporte en Redmine.

## Características

- Formulario intuitivo para crear tickets
- Campos personalizados: Módulo, Número de Trámite, Identificador de Operación
- Integración con Redmine para proyectos, trackers y prioridades
- Interfaz moderna y responsive
- Validaciones en tiempo real
- Mensajes de éxito y error

## Configuración

1. Instalar dependencias:
```bash
npm install
```

2. Configurar variables de entorno:
   - Copiar `.env.example` a `.env`
   - Configurar la URL del backend

```env
VITE_API_URL=http://localhost:3000
```

## Ejecutar

### Modo desarrollo:
```bash
npm run dev
```

La aplicación se ejecutará en `http://localhost:5173` (puerto por defecto de Vite)

### Build para producción:
```bash
npm run build
```

### Preview del build:
```bash
npm run preview
```

## Estructura del Proyecto

```
frontend/
├── src/
│   ├── components/
│   │   ├── TicketForm.jsx      # Formulario principal
│   │   └── TicketForm.css      # Estilos del formulario
│   ├── App.jsx                 # Componente principal
│   ├── App.css                 # Estilos globales de la app
│   ├── main.jsx                # Punto de entrada
│   └── index.css               # Estilos base
├── public/                     # Archivos estáticos
├── .env                        # Variables de entorno
├── package.json                # Dependencias
└── vite.config.js             # Configuración de Vite
```

## Uso

1. Asegúrate de que el backend esté ejecutándose en `http://localhost:3000`
2. Completa el formulario con la información del ticket:
   - **Asunto**: Título breve del problema
   - **Descripción**: Detalle completo del problema
   - **Módulo**: Sistema o módulo afectado (opcional)
   - **Número de Trámite**: Identificador del trámite relacionado (opcional)
   - **Identificador de Operación**: Código de operación (opcional)
   - **Proyecto**: Selecciona el proyecto en Redmine
   - **Tipo**: Tipo de issue (Bug, Feature, Support, etc.)
   - **Prioridad**: Nivel de urgencia
3. Click en "Crear Ticket"
4. El ticket se creará en Redmine y recibirás una confirmación

## Tecnologías

- **React 19**: Framework UI
- **Vite**: Build tool y dev server
- **Axios**: Cliente HTTP para comunicación con el backend
- **CSS**: Estilos personalizados (sin frameworks)

## Personalización

### Cambiar colores:
Edita `src/App.css` y `src/components/TicketForm.css`

### Agregar campos:
1. Actualiza el estado en `TicketForm.jsx`
2. Agrega inputs en el JSX
3. Actualiza el backend para procesar los nuevos campos

## Troubleshooting

### Error de CORS:
Asegúrate de que el backend tenga CORS habilitado (ya está configurado en el backend proporcionado)

### No se cargan proyectos/trackers:
Verifica que:
1. El backend esté ejecutándose
2. Las credenciales de Redmine en el backend sean correctas
3. La URL del backend en `.env` sea correcta
