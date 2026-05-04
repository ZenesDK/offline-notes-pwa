// src/services/WebSocketService.js
import { io } from 'socket.io-client';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  connect() {
    if (this.socket?.connected) {
      console.log('WebSocket уже подключён');
      return;
    }

    this.socket = io('http://localhost:3001', {
      transports: ['websocket'],
      autoConnect: true
    });

    this.socket.on('connect', () => {
      console.log('✅ WebSocket подключён:', this.socket.id);
    });

    this.socket.on('disconnect', () => {
      console.log('❌ WebSocket отключён');
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket ошибка:', error);
    });

    // Восстанавливаем обработчики после переподключения
    this.socket.on('connect', () => {
      this.listeners.forEach((callback, event) => {
        this.socket.on(event, callback);
      });
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on(event, callback) {
    this.listeners.set(event, callback);
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event) {
    this.listeners.delete(event);
    if (this.socket) {
      this.socket.off(event);
    }
  }

  emit(event, data) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn('WebSocket не подключён, событие не отправлено');
    }
  }

  isConnected() {
    return this.socket?.connected || false;
  }
}

export const webSocketService = new WebSocketService();
