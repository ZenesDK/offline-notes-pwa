// src/contexts/NotificationContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { webSocketService } from '../services/WebSocketService';
import { pushService } from '../services/PushService';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isPushEnabled, setIsPushEnabled] = useState(false);
  const [lastNotification, setLastNotification] = useState(null);

  // Подключение WebSocket
  useEffect(() => {
    webSocketService.connect();
    setIsConnected(webSocketService.isConnected());

    // Обработчик новых задач
    webSocketService.on('taskAdded', (task) => {
      console.log('📢 Получено событие от сервера:', task);
      setLastNotification({
        message: `📝 Новая заметка: ${task.text.substring(0, 50)}${task.text.length > 50 ? '...' : ''}`,
        timestamp: new Date()
      });
      
      showToast(`✨ Новая заметка: ${task.text.substring(0, 80)}`);
    });

    return () => {
      webSocketService.off('taskAdded');
      webSocketService.disconnect();
    };
  }, []);

  const showToast = (message) => {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #4285f4;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      font-size: 14px;
      z-index: 10000;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      animation: slideIn 0.3s ease;
      max-width: 350px;
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
  };

  // Проверка статуса push подписки
  useEffect(() => {
    const checkPushStatus = async () => {
      const subscribed = await pushService.isSubscribed();
      setIsPushEnabled(subscribed);
    };
    
    if ('serviceWorker' in navigator) {
      checkPushStatus();
    }
  }, []);

  // Инициализация Push сервиса
  useEffect(() => {
    pushService.init();
  }, []);

  const enablePush = async () => {
    const success = await pushService.subscribe();
    if (success) {
      setIsPushEnabled(true);
    }
  };

  const disablePush = async () => {
    const success = await pushService.unsubscribe();
    if (success) {
      setIsPushEnabled(false);
    }
  };

  const sendTaskEvent = (task) => {
    if (webSocketService.isConnected()) {
      webSocketService.emit('newTask', task);
    }
  };

  // Новый метод для отправки события напоминания
  const sendReminderEvent = (reminder) => {
    if (webSocketService.isConnected()) {
      webSocketService.emit('newReminder', reminder);
      console.log('⏰ Отправлено напоминание на сервер:', reminder);
    } else {
      console.warn('WebSocket не подключён, напоминание не отправлено');
    }
  };

  return (
    <NotificationContext.Provider value={{
      isConnected,
      isPushEnabled,
      lastNotification,
      enablePush,
      disablePush,
      sendTaskEvent,
      sendReminderEvent
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};
