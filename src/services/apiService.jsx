import axios from 'axios';
import API_CONFIG from '../config/apiConfig';

/**
 * Servicio base para manejar peticiones HTTP
 */
class ApiService {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this.client = axios.create({
      baseURL: baseUrl,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor para manejo global de errores
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('Error en petición API:', error);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Realizar una petición GET
   * @param {string} endpoint - Endpoint a consultar
   * @param {Object} options - Opciones adicionales (params, headers, etc.)
   * @returns {Promise<Object>} - Respuesta de la petición
   */
  async get(endpoint, options = {}) {
    try {
      const response = await this.client.get(endpoint, options);
      return response.data;
    } catch (error) {
      console.error(`Error en GET ${endpoint}:`, error);
      throw error;
    }
  }

  /**
   * Realizar una petición POST
   * @param {string} endpoint - Endpoint a consultar
   * @param {Object} data - Datos a enviar
   * @param {Object} options - Opciones adicionales (params, headers, etc.)
   * @returns {Promise<Object>} - Respuesta de la petición
   */
  async post(endpoint, data = {}, options = {}) {
    try {
      const response = await this.client.post(endpoint, data, options);
      return response.data;
    } catch (error) {
      console.error(`Error en POST ${endpoint}:`, error);
      throw error;
    }
  }

  /**
   * Realizar una petición PUT
   * @param {string} endpoint - Endpoint a consultar
   * @param {Object} data - Datos a enviar
   * @param {Object} options - Opciones adicionales (params, headers, etc.)
   * @returns {Promise<Object>} - Respuesta de la petición
   */
  async put(endpoint, data = {}, options = {}) {
    try {
      const response = await this.client.put(endpoint, data, options);
      return response.data;
    } catch (error) {
      console.error(`Error en PUT ${endpoint}:`, error);
      throw error;
    }
  }

  /**
   * Realizar una petición DELETE
   * @param {string} endpoint - Endpoint a eliminar
   * @param {Object} options - Opciones adicionales (params, headers, etc.)
   * @returns {Promise<Object>} - Respuesta de la petición
   */
  async delete(endpoint, options = {}) {
    try {
      const response = await this.client.delete(endpoint, options);
      return response.data;
    } catch (error) {
      console.error(`Error en DELETE ${endpoint}:`, error);
      throw error;
    }
  }
}

// Crear instancia con la URL base
const apiService = new ApiService(API_CONFIG.BASE_URL);
export default apiService;
