// src/components/NotificationButton.jsx
import { useNotifications } from '../contexts/NotificationContext';

export const NotificationButton = () => {
  const { isPushEnabled, enablePush, disablePush } = useNotifications();

  const handleClick = async () => {
    if (isPushEnabled) {
      await disablePush();
    } else {
      await enablePush();
    }
  };

  return (
    <div style={{ marginTop: '1rem', textAlign: 'center' }}>
      <button
        onClick={handleClick}
        className={`button ${isPushEnabled ? 'error' : 'success'}`}
        style={{
          backgroundColor: isPushEnabled ? '#dc3545' : '#28a745',
          color: 'white',
          border: 'none',
          padding: '10px 20px',
          cursor: 'pointer',
          borderRadius: '4px',
          fontSize: '14px'
        }}
      >
        {isPushEnabled ? '🔕 Отключить уведомления' : '🔔 Включить уведомления'}
      </button>
      <p style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
        {isPushEnabled 
          ? 'Уведомления включены. Вы будете получать push-уведомления о новых заметках.' 
          : 'Включите уведомления, чтобы получать оповещения о новых заметках (даже когда приложение закрыто).'}
      </p>
    </div>
  );
};
