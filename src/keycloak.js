import Keycloak from "keycloak-js";
import { setupAxios, clearToken } from "./lib/axios";

// Configuración de Keycloak desde variables de entorno
const initOptions = {
  url: import.meta.env.VITE_KEYCLOAK_URL || "http://localhost:8080/auth",
  realm: import.meta.env.VITE_KEYCLOAK_REALM || "your-realm",
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || "redmine-tickets",
};

const keycloak = new Keycloak(initOptions);

// Clave para localStorage
const localStorageKey = "keycloak_token";

/**
 * Función que se ejecuta cuando la autenticación es exitosa
 */
const onAuthSuccess = () => {
  localStorage.setItem(localStorageKey, keycloak.token);
  setupAxios();
  keycloak.loadUserProfile();
};

/**
 * Función que se ejecuta cuando el usuario cierra sesión
 */
const onAuthLogout = () => {
  clearToken();
  localStorage.clear();
  keycloak.logout();
};

/**
 * Actualización automática del token cada 60 segundos
 */
setInterval(() => {
  if (keycloak.authenticated) {
    keycloak
      .updateToken(70)
      .then((refreshed) => {
        if (refreshed) {
          console.debug("Token refreshed");
          localStorage.setItem(localStorageKey, keycloak.token);
          setupAxios();
        } else {
          const validFor = Math.round(
            keycloak.tokenParsed.exp +
              keycloak.timeSkew -
              new Date().getTime() / 1000
          );
          console.warn(`Token not refreshed, valid for ${validFor} seconds`);
        }
      })
      .catch(() => {
        console.error("Failed to refresh token");
      });
  }
}, 60000);

export default keycloak;
export { onAuthSuccess, onAuthLogout };
