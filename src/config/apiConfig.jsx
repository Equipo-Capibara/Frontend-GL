/**
 * Configuración centralizada para las APIs y WebSockets
 * Utiliza variables de entorno con valores por defecto como respaldo
 */
const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080',
};

export default API_CONFIG;
