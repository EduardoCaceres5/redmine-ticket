# Información del Usuario desde el Frontend

## Datos Enviados al Backend

El frontend envía información del usuario autenticado con Keycloak en cada creación de ticket. Esta información se envía en el campo `user_info` como JSON string dentro del FormData.

### Estructura de `user_info`

```json
{
  "email": "usuario@ejemplo.com",
  "username": "juan.perez",
  "name": "Juan Pérez",
  "sub": "f47ac10b-58cc-4372-a567-0e02b2c3d479"
}
```

### Campos Incluidos

| Campo | Descripción | Uso |
|-------|-------------|-----|
| `email` | Email del usuario en Keycloak | Se agrega a la descripción del ticket |
| `username` | Username/login del usuario | Se agrega a la descripción del ticket |
| `name` | Nombre completo del usuario | Se agrega a la descripción del ticket |
| `sub` | Subject/ID único en Keycloak | Trazabilidad y auditoría en logs |

## Implementación en el Backend (SIMPLIFICADA)

**Este enfoque es mucho más simple**: no requiere buscar usuarios en Redmine ni sincronización. La información del usuario simplemente se agrega a la descripción del ticket.

### 1. Extracción de la Información

```javascript
// En tu ruta POST /api/tickets
app.post('/api/tickets', upload.array('attachments'), async (req, res) => {
  // Extraer información del usuario
  let userInfo = null;
  try {
    userInfo = req.body.user_info ? JSON.parse(req.body.user_info) : null;
  } catch (error) {
    console.warn('Error al parsear user_info:', error);
  }

  // Validar que se haya proporcionado información del usuario
  if (!userInfo || !userInfo.email) {
    return res.status(400).json({
      error: 'Información de usuario no disponible',
      details: 'Se requiere información del usuario autenticado'
    });
  }

  console.log(`📝 Creando ticket para: ${userInfo.name} (${userInfo.email})`);
});
```

### 2. Agregar Información del Usuario a la Descripción

```javascript
// Construir descripción completa con información del usuario
let fullDescription = req.body.description;

// Agregar información del solicitante
fullDescription += '\n\n---\n**Información del Solicitante:**\n';
fullDescription += `- **Nombre:** ${userInfo.name}\n`;
fullDescription += `- **Email:** ${userInfo.email}\n`;
if (userInfo.username) {
  fullDescription += `- **Usuario Keycloak:** ${userInfo.username}\n`;
}

// Agregar información adicional si existe
if (req.body.modulo || req.body.numero_tramite || req.body.identificador_operacion) {
  fullDescription += '\n**Información Adicional:**\n';
  if (req.body.modulo) fullDescription += `- **Módulo:** ${req.body.modulo}\n`;
  if (req.body.numero_tramite) fullDescription += `- **Número de trámite:** ${req.body.numero_tramite}\n`;
  if (req.body.identificador_operacion) fullDescription += `- **ID Operación:** ${req.body.identificador_operacion}\n`;
}
```

### 3. Crear el Ticket en Redmine

```javascript
// Estructura del issue para Redmine
const issueData = {
  issue: {
    project_id: req.body.project_id,
    subject: req.body.subject,
    description: fullDescription,  // ← Con información del usuario incluida
    tracker_id: req.body.tracker_id || 1,
    priority_id: req.body.priority_id || 2,
    // No especificamos author_id, se usará el usuario de la API Key
  }
};

const result = await callRedmineAPI('/issues.json', 'POST', issueData);
```

**Ventajas de este enfoque:**
- ✅ No requiere buscar usuarios en Redmine
- ✅ No hay problemas de sincronización
- ✅ Funciona siempre, independientemente de los usuarios en Redmine
- ✅ La información del solicitante queda visible en el ticket
- ✅ El ticket se crea con el usuario de la API Key

### 4. Auditoría y Logging

```javascript
// Registrar cada creación de ticket
const auditLog = {
  timestamp: new Date().toISOString(),
  action: 'CREATE_TICKET',
  user: {
    keycloak_id: userInfo.sub,
    email: userInfo.email,
    username: userInfo.username,
    name: userInfo.name
  },
  ticket: {
    redmine_id: response.data.issue.id,
    project_id: req.body.project_id,
    subject: req.body.subject
  }
};

console.log('AUDIT:', JSON.stringify(auditLog));
// O guardar en base de datos para auditoría
```

## Resumen

### Flujo Completo

1. **Frontend** envía `user_info` con cada ticket
2. **Backend** extrae la información del usuario
3. **Backend** agrega esta información a la descripción del ticket
4. **Redmine** crea el ticket con el usuario de la API Key como autor
5. **La información del solicitante real queda visible en la descripción**

### Ejemplo de Ticket en Redmine

```
Descripción del problema ingresada por el usuario...

---
**Información del Solicitante:**
- **Nombre:** Juan Pérez
- **Email:** juan.perez@ejemplo.com
- **Usuario Keycloak:** juan.perez

**Información Adicional:**
- **Módulo:** Ventas
- **Número de trámite:** 12345
- **ID Operación:** OP-2024-001
```

## Variables de Entorno Necesarias

```env
# Configuración mínima requerida
REDMINE_URL=https://redmine.tudominio.com
REDMINE_API_KEY=tu_api_key_aqui
DEFAULT_PROJECT_ID=1
PORT=3000
NODE_ENV=development
```

## Ventajas de Este Enfoque

✅ **Simplicidad**: No requiere lógica compleja de búsqueda de usuarios
✅ **Sin dependencias**: No necesita sincronización entre Keycloak y Redmine
✅ **Siempre funciona**: No hay errores por usuarios no encontrados
✅ **Trazabilidad**: La información del solicitante queda registrada
✅ **Auditoría**: Logs completos en el servidor
✅ **Flexibilidad**: Fácil de modificar o extender
