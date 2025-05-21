import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import API_CONFIG from '../config/apiConfig';

class WebSocketService {
  constructor() {
    this._stompClient = null;
    this._connected = false;
    this._subscriptions = {};
    this._connectionPromise = null;
    this._connectionResolve = null;
    this._connectionReject = null;

    this.initialize();
  }

  initialize() {
    console.log('🔄 Inicializando WebSocket con URL:', API_CONFIG.BASE_URL, "/ws");
    const socket = new SockJS(`${API_CONFIG.BASE_URL}/ws`);
    this._stompClient = new Client({
      webSocketFactory: () => socket,
      debug: (str) => console.log('STOMP:', str),
      reconnectDelay: 5000,
      onConnect: this._handleConnect.bind(this),
      onStompError: this._handleError.bind(this),
    });

    // Creamos una promesa que se resolverá cuando la conexión se establezca
    this._connectionPromise = new Promise((resolve, reject) => {
      this._connectionResolve = resolve;
      this._connectionReject = reject;
    });

    console.log('🔄 Activando conexión STOMP');
    this._stompClient.activate();
  }

  _handleConnect() {
    console.log('✅ Conectado a WebSocket - Cliente STOMP activo');
    this._connected = true;
    if (this._connectionResolve) {
      this._connectionResolve();
    }
  }

  _handleError(error) {
    console.error('❌ Error en WebSocket:', error);
    this._connected = false;
    if (this._connectionReject) {
      this._connectionReject(error);
    }
  }

  get isConnected() {
    return this._connected;
  }

  async ensureConnected() {
    if (this._connected) {
      return Promise.resolve();
    }
    return this._connectionPromise;
  }

  // Suscribirse a un tema
  async subscribe(destination, callback) {
    try {
      console.log('🔄 Intentando suscribirse a', destination);
      await this.ensureConnected();
      
      // Verificar si estamos conectados después de esperar
      if (!this._connected) {
        console.error('❌ No se pudo suscribir: WebSocket no está conectado');
        throw new Error('WebSocket no está conectado');
      }
      
      if (!this._subscriptions[destination]) {
        console.log('📩 Creando nueva suscripción para', destination);
        const subscription = this._stompClient.subscribe(destination, (message) => {
          console.log('📨 Mensaje recibido en', destination);
          const data = message.body ? JSON.parse(message.body) : {};
          callback(data, message);
        });

        this._subscriptions[destination] = {
          id: subscription.id,
          subscription,
          callbacks: [callback],
        };
        console.log('✅ Suscripción creada con ID:', subscription.id);
        return subscription.id;
      } else {
        // Si ya existe una suscripción, añadimos el callback
        console.log('📩 Añadiendo callback a suscripción existente para', destination);
        this._subscriptions[destination].callbacks.push(callback);
        console.log('✅ Callback añadido a suscripción con ID:', this._subscriptions[destination].id);
        return this._subscriptions[destination].id;
      }
    } catch (error) {
      console.error(`❌ Error al suscribirse a ${destination}:`, error);
      throw error;
    }
  }

  // Cancelar suscripción
  unsubscribe(destination, callbackToRemove) {
    const sub = this._subscriptions[destination];
    if (!sub) return;

    if (callbackToRemove) {
      // Eliminar solo un callback específico
      sub.callbacks = sub.callbacks.filter((cb) => cb !== callbackToRemove);
      if (sub.callbacks.length === 0) {
        // Si no quedan callbacks, eliminar la suscripción
        sub.subscription.unsubscribe();
        delete this._subscriptions[destination];
      }
    } else {
      // Eliminar toda la suscripción
      sub.subscription.unsubscribe();
      delete this._subscriptions[destination];
    }
  }

  // Publicar un mensaje
  async publish(destination, body) {
    try {
      console.log('📤 Publicando mensaje en', destination, 'con cuerpo:', body);
      await this.ensureConnected();
      
      // Verificar si estamos conectados después de esperar
      if (!this._connected) {
        console.error('❌ No se pudo publicar: WebSocket no está conectado');
        return false;
      }
      
      this._stompClient.publish({
        destination,
        body: typeof body === 'string' ? body : JSON.stringify(body),
      });
      console.log('✅ Mensaje publicado exitosamente en', destination);
      return true;
    } catch (error) {
      console.error(`❌ Error al publicar en ${destination}:`, error);
      return false;
    }
  }
}

// Singleton para toda la aplicación
const websocketService = new WebSocketService();
export default websocketService;
