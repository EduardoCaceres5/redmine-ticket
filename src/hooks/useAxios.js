import { useState, useEffect } from 'react';
import { useKeycloak } from '@react-keycloak/web';
import axios from 'axios';

// Configuración desde variables de entorno
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Hook personalizado para crear una instancia de Axios con autenticación de Keycloak
 * @param {string} baseURL - URL base opcional para la instancia de axios
 * @returns {object} Instancia de axios configurada con el token de autenticación
 */
const useAxios = (baseURL) => {
  const { keycloak, initialized } = useKeycloak();
  const [axiosInstance, setAxiosInstance] = useState(null);

  useEffect(() => {
    const instance = axios.create({
      baseURL: baseURL || API_URL,
      timeout: 150000,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        Authorization: initialized && keycloak.authenticated
          ? `Bearer ${keycloak.token}`
          : undefined
      }
    });

    instance.CancelToken = axios.CancelToken;
    instance.isCancel = axios.isCancel;

    setAxiosInstance(instance);

    return () => {
      setAxiosInstance(null);
    };
  }, [baseURL, initialized, keycloak.authenticated, keycloak.token]);

  return axiosInstance;
};

export default useAxios;
