// src/services/PushService.js

// Преобразование base64 в Uint8Array для VAPID ключа
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

class PushService {
  constructor() {
    this.vapidPublicKey = null;
    this.subscription = null;
  }

  async init() {
    try {
      const response = await fetch('http://localhost:3001/api/vapid-public-key');
      const data = await response.json();
      this.vapidPublicKey = data.publicKey;
      console.log('✅ VAPID ключ получен');
      return true;
    } catch (error) {
      console.error('❌ Ошибка получения VAPID ключа:', error);
      return false;
    }
  }

  async subscribe() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push не поддерживается');
      return false;
    }

    // Запрашиваем разрешение на уведомления
    let permission = Notification.permission;
    if (permission === 'default') {
      permission = await Notification.requestPermission();
    }
    
    if (permission !== 'granted') {
      alert('Необходимо разрешить уведомления в настройках браузера');
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      this.subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(this.vapidPublicKey)
      });

      // Отправляем подписку на сервер
      const response = await fetch('http://localhost:3001/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.subscription)
      });

      if (response.ok) {
        console.log('✅ Push подписка сохранена');
        return true;
      }
    } catch (error) {
      console.error('❌ Ошибка подписки на push:', error);
    }
    return false;
  }

  async unsubscribe() {
    if (!this.subscription) {
      const registration = await navigator.serviceWorker.ready;
      this.subscription = await registration.pushManager.getSubscription();
    }

    if (this.subscription) {
      try {
        await fetch('http://localhost:3001/api/unsubscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: this.subscription.endpoint })
        });
        
        await this.subscription.unsubscribe();
        this.subscription = null;
        console.log('✅ Push отписка выполнена');
        return true;
      } catch (error) {
        console.error('❌ Ошибка отписки:', error);
      }
    }
    return false;
  }

  async isSubscribed() {
    if (!('serviceWorker' in navigator)) return false;
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    return !!subscription;
  }
}

export const pushService = new PushService();
