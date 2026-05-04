import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import 'chota'
import './App.css'

// Регистрация Service Worker с обработкой обновлений
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('✅ Service Worker зарегистрирован:', registration.scope)
        
        // Проверка обновлений
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          console.log('🔄 Найдено обновление Service Worker');
          
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('📢 Новая версия доступна! Обновите страницу');
              // Можно показать уведомление пользователю
              if (confirm('Доступна новая версия приложения. Обновить?')) {
                window.location.reload();
              }
            }
          });
        });
      })
      .catch(error => {
        console.error('❌ Ошибка регистрации Service Worker:', error)
      })
      
    // Отслеживаем контроль над страницей
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('🔄 Service Worker обновлён, перезагружаем...')
      window.location.reload()
    })
  })
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)