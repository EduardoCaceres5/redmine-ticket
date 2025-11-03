import axios from 'axios';

// Configuración desde variables de entorno
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const localStorageKey = 'keycloak_token';

// Instancia de Axios con configuración base
const instance = axios.create({
  baseURL: API_URL,
  timeout: 150000,
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache'
  }
});

instance.CancelToken = axios.CancelToken;
instance.isCancel = axios.isCancel;

/**
 * Limpia el token de autorización
 */
const clearToken = () => {
  delete instance.defaults.headers.common.Authorization;
};

/**
 * Configura Axios con el token de Keycloak
 */
const setupAxios = () => {
  const token = localStorage.getItem(localStorageKey);

  if (token) {
    instance.defaults.headers.common.Authorization = `Bearer ${token}`;
  }
};

/**
 * Obtiene información del error para mostrar al usuario
 */
const getErrorInfo = (error, defaultMessage = 'Error en la operación', networkErrorMessage = 'Error de conexión') => {
  const messageInfo = { message: networkErrorMessage, type: 'error' };

  if (error.response) {
    messageInfo.type =
      error.response.status.toString()[0] === '4' ? 'warning' : 'error';

    if (error.response.data?.message) {
      messageInfo.message = error.response.data.message;
    } else {
      messageInfo.message = defaultMessage;
    }
  }

  return messageInfo;
};

/**
 * Wrapper para requests con manejo de errores
 */
const requestWrapper = (conf, transformResponse) => {
  const onSuccess = response => {
    return transformResponse ? transformResponse(response) : response;
  };

  const onError = error => {
    console.error('Request Failed:', error.config);

    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
      console.error('Headers:', error.response.headers);
    } else {
      console.error('Error Message:', error.message);
    }

    return Promise.reject(getErrorInfo(error));
  };

  return instance(conf)
    .then(onSuccess)
    .catch(onError);
};

instance.request = requestWrapper;

// Inicializar axios con token si existe
setupAxios();

export default instance;
export { clearToken, getErrorInfo, setupAxios };
