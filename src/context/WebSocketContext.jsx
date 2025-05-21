import React, { createContext, useContext, useEffect, useState } from 'react';
import { websocketService } from '../services';

const WebSocketContext = createContext(null);

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket debe ser usado dentro de un WebSocketProvider');
  }
  return context;
};

export const WebSocketProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(websocketService.isConnected);

  useEffect(() => {
    // Función para actualizar el estado de conexión
    const updateConnectionStatus = () => {
      setIsConnected(websocketService.isConnected);
    };

    // Intentar conectar si no está conectado
    if (!websocketService.isConnected) {
      websocketService
        .ensureConnected()
        .then(updateConnectionStatus)
        .catch((error) => {
          console.error('Error al conectar WebSocket:', error);
          updateConnectionStatus();
        });
    }

    // Establecer un intervalo para verificar el estado de conexión
    const interval = setInterval(updateConnectionStatus, 5000);

    // Limpieza al desmontar
    return () => {
      clearInterval(interval);
    };
  }, []);

  // Valor del contexto
  const value = {
    isConnected,
    subscribe: websocketService.subscribe.bind(websocketService),
    unsubscribe: websocketService.unsubscribe.bind(websocketService),
    publish: websocketService.publish.bind(websocketService),
    ensureConnected: websocketService.ensureConnected.bind(websocketService),
  };

  return <WebSocketContext.Provider value={value}>{children}</WebSocketContext.Provider>;
};

export default WebSocketContext;
