# Integración con Keycloak

Este documento describe cómo configurar y usar Keycloak en el sistema de tickets de Redmine.

## Requisitos previos

- Servidor Keycloak instalado y en ejecución
- Acceso administrativo a Keycloak

## Configuración de Keycloak

### 1. Crear un Realm

1. Accede a la consola de administración de Keycloak
2. Crea un nuevo realm (por ejemplo: `your-realm`)
3. Configura el realm según tus necesidades

### 2. Crear un Client

1. Ve a **Clients** → **Create**
2. Configura los siguientes valores:
   - **Client ID**: `redmine-tickets`
   - **Client Protocol**: `openid-connect`
   - **Access Type**: `public`
   - **Valid Redirect URIs**: `http://localhost:5173/*` (ajustar según tu dominio)
   - **Web Origins**: `http://localhost:5173` (ajustar según tu dominio)
   - **PKCE**: Activado (recomendado para mayor seguridad)

### 3. Configurar Usuarios

1. Ve a **Users** → **Add user**
2. Crea los usuarios necesarios
3. Asigna roles y permisos según sea necesario

## Configuración de la Aplicación

### 1. Archivo de Configuración

Edita el archivo `public/config.js` con los datos de tu servidor Keycloak:

\`\`\`javascript
window.CONFIG = {
  keycloak: {
    url: 'http://tu-servidor-keycloak:8080', // URL de Keycloak (sin /auth para v17+)
    realm: 'your-realm', // Nombre de tu realm
    clientId: 'redmine-tickets' // Client ID configurado
  },
  serverUrl: 'http://localhost:3000',
  serverContext: '/api',
  localStorageKey: 'keycloak_token'
};
\`\`\`

**Nota**: Para Keycloak 17+, no incluyas `/auth` en la URL.

### 2. Variables de Entorno (Opcional)

Para diferentes entornos (desarrollo, producción, etc.), puedes crear archivos de configuración separados:

- `public/config.js` - Desarrollo local
- `public/config.prod.js` - Producción
- `public/config.test.js` - Testing

## Estructura de Archivos

La integración con Keycloak incluye los siguientes archivos:

### Configuración y Setup
- **src/keycloak.js**: Configuración e inicialización de Keycloak
- **src/lib/axios.js**: Instancia de Axios configurada con interceptores para tokens
- **public/config.js**: Archivo de configuración global

### Componentes
- **src/components/PrivateRoute.jsx**: Componente para proteger rutas que requieren autenticación
- **src/components/Navbar.jsx**: Barra de navegación con información del usuario y logout

### Hooks
- **src/hooks/useAxios.js**: Hook para obtener instancia de Axios con token actualizado

## Uso en Componentes

### Proteger Rutas

Para proteger una ruta o componente que requiere autenticación:

\`\`\`jsx
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <PrivateRoute>
      <TuComponenteProtegido />
    </PrivateRoute>
  );
}
\`\`\`

### Usar Hook useKeycloak

Para acceder a la información de Keycloak en cualquier componente:

\`\`\`jsx
import { useKeycloak } from '@react-keycloak/web';

function MiComponente() {
  const { keycloak, initialized } = useKeycloak();

  if (!initialized) {
    return <div>Cargando...</div>;
  }

  return (
    <div>
      <p>Usuario: {keycloak.tokenParsed?.preferred_username}</p>
      <p>Email: {keycloak.tokenParsed?.email}</p>
      <button onClick={() => keycloak.logout()}>Cerrar sesión</button>
    </div>
  );
}
\`\`\`

### Hacer Peticiones HTTP con Autenticación

#### Opción 1: Usar el hook useAxios (Recomendado)

\`\`\`jsx
import useAxios from './hooks/useAxios';

function MiComponente() {
  const axios = useAxios();

  const fetchData = async () => {
    try {
      const response = await axios.get('/tickets');
      console.log(response.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return <button onClick={fetchData}>Cargar datos</button>;
}
\`\`\`

#### Opción 2: Usar la instancia global

\`\`\`jsx
import axios from './lib/axios';

const response = await axios.get('/tickets');
\`\`\`

## Actualización Automática del Token

El token de autenticación se actualiza automáticamente cada 60 segundos (ver `src/keycloak.js`).
Si el token no puede ser renovado, el usuario será redirigido al login de Keycloak.

## Manejo de Errores

### 401 Unauthorized

Si el servidor responde con 401, significa que el token ha expirado o es inválido.
La aplicación intentará refrescar el token automáticamente.

### 403 Forbidden

El usuario no tiene permisos para acceder al recurso. Verifica los roles en Keycloak.

## Desarrollo Local

Para desarrollo local sin Keycloak:

1. Comenta o modifica la configuración en `public/config.js`
2. En `src/App.jsx`, envuelve tu aplicación sin el `KeycloakProvider` temporalmente
3. O configura un Keycloak de desarrollo local usando Docker:

\`\`\`bash
docker run -p 8080:8080 -e KEYCLOAK_ADMIN=admin -e KEYCLOAK_ADMIN_PASSWORD=admin quay.io/keycloak/keycloak:latest start-dev
\`\`\`

## Despliegue en Producción

1. Actualiza `public/config.js` con las URLs de producción
2. Asegúrate de que las URLs de redirección en Keycloak incluyan tu dominio de producción
3. Habilita HTTPS tanto en Keycloak como en tu aplicación
4. Configura CORS adecuadamente en tu backend

## Troubleshooting

### La aplicación no carga

- Verifica que Keycloak esté en ejecución
- Comprueba la consola del navegador para errores
- Verifica que la URL de Keycloak en config.js sea correcta

### El token no se incluye en las peticiones

- Verifica que estés usando `useAxios()` o la instancia de `axios` de `lib/axios.js`
- Comprueba que el usuario esté autenticado (`keycloak.authenticated === true`)

### Errores de CORS

- Configura Web Origins en el cliente de Keycloak
- Verifica la configuración de CORS en tu backend

## Referencias

- [Documentación de Keycloak](https://www.keycloak.org/documentation)
- [@react-keycloak/web](https://github.com/react-keycloak/react-keycloak)
- [keycloak-js](https://www.keycloak.org/docs/latest/securing_apps/#_javascript_adapter)
