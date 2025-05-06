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
    const socket = new SockJS(API_CONFIG.WS_URL);
    this._stompClient = new Client({
      webSocketFactory: () => socket,
      debug: (str) => console.log(str),
      reconnectDelay: 5000,
      onConnect: this._handleConnect.bind(this),
      onStompError: this._handleError.bind(this),
    });

    // Creamos una promesa que se resolverá cuando la conexión se establezca
    this._connectionPromise = new Promise((resolve, reject) => {
      this._connectionResolve = resolve;
      this._connectionReject = reject;
    });

    this._stompClient.activate();
  }

  _handleConnect() {
    console.log('✅ Conectado a WebSocket');
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
      await this.ensureConnected();
      if (!this._subscriptions[destination]) {
        const subscription = this._stompClient.subscribe(destination, (message) => {
          const data = message.body ? JSON.parse(message.body) : {};
          callback(data, message);
        });

        this._subscriptions[destination] = {
          id: subscription.id,
          subscription,
          callbacks: [callback],
        };
        return subscription.id;
      } else {
        // Si ya existe una suscripción, añadimos el callback
        this._subscriptions[destination].callbacks.push(callback);
        return this._subscriptions[destination].id;
      }
    } catch (error) {
      console.error(`Error al suscribirse a ${destination}:`, error);
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
      await this.ensureConnected();
      this._stompClient.publish({
        destination,
        body: typeof body === 'string' ? body : JSON.stringify(body),
      });
      return true;
    } catch (error) {
      console.error(`Error al publicar en ${destination}:`, error);
      return false;
    }
  }
}

// Singleton para toda la aplicación
const websocketService = new WebSocketService();
export default websocketService;
