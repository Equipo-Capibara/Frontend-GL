import { useEffect, useRef } from 'react';
import { useWebSocket } from '../context/WebSocketContext';

/**
 * Hook personalizado para gestionar suscripciones a WebSocket
 * @param {string} destination - Destino de la suscripción
 * @param {Function} callback - Función a llamar cuando se recibe un mensaje
 * @param {boolean} enabled - Si la suscripción está activa o no
 * @returns {boolean} - Estado de la suscripción
 */
const useWebSocketSubscription = (destination, callback, enabled = true) => {
  const { subscribe, unsubscribe, isConnected } = useWebSocket();
  const callbackRef = useRef(callback);
  const subscriptionRef = useRef(null);

  // Actualizar la referencia del callback cuando cambie
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Gestionar la suscripción
  useEffect(() => {
    // Solo suscribirse si está habilitado y el websocket está conectado
    if (enabled && isConnected && destination) {
      const handleMessage = (data, message) => {
        if (callbackRef.current) {
          callbackRef.current(data, message);
        }
      };

      // Crear la suscripción
      subscribe(destination, handleMessage)
        .then((subscriptionId) => {
          subscriptionRef.current = { id: subscriptionId, handler: handleMessage };
        })
        .catch((error) => {
          console.error(`Error al suscribirse a ${destination}:`, error);
        });

      // Limpiar al desmontar o cuando cambian las dependencias
      return () => {
        if (subscriptionRef.current) {
          unsubscribe(destination, subscriptionRef.current.handler);
          subscriptionRef.current = null;
        }
      };
    }
  }, [destination, enabled, isConnected, subscribe, unsubscribe]);

  return isConnected && !!subscriptionRef.current;
};

export default useWebSocketSubscription;
