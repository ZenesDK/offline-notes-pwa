const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const webpush = require('web-push');
const cors = require('cors');
const path = require('path');

// ========== VAPID КЛЮЧИ ==========
// ЗАМЕНИТЕ НА СВОИ КЛЮЧИ!
const VAPID_PUBLIC_KEY = 'ВАШ_ПУБЛИЧНЫЙ_КЛЮЧ';
const VAPID_PRIVATE_KEY = 'ВАШ_ПРИВАТНЫЙ_КЛЮЧ';

webpush.setVapidDetails(
  'mailto:your-email@example.com',
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../dist')));

// Хранилище push-подписок
let subscriptions = [];

// ========== ХРАНИЛИЩЕ НАПОМИНАНИЙ ==========
const reminders = new Map(); // reminderId -> { timeoutId, text, reminderTime }

// Эндпоинт для сохранения подписки
app.post('/api/subscribe', (req, res) => {
  const subscription = req.body;
  const exists = subscriptions.some(sub => sub.endpoint === subscription.endpoint);
  
  if (!exists) {
    subscriptions.push(subscription);
    console.log('✅ Новая подписка добавлена. Всего:', subscriptions.length);
  }
  
  res.status(201).json({ message: 'Подписка сохранена' });
});

// Эндпоинт для удаления подписки
app.post('/api/unsubscribe', (req, res) => {
  const { endpoint } = req.body;
  subscriptions = subscriptions.filter(sub => sub.endpoint !== endpoint);
  console.log('❌ Подписка удалена. Осталось:', subscriptions.length);
  res.status(200).json({ message: 'Подписка удалена' });
});

// Эндпоинт для получения публичного VAPID ключа
app.get('/api/vapid-public-key', (req, res) => {
  res.json({ publicKey: VAPID_PUBLIC_KEY });
});

// ========== ЭНДПОИНТ ДЛЯ ОТКЛАДЫВАНИЯ ==========
app.post('/api/snooze', (req, res) => {
  const { reminderId } = req.body;
  
  if (!reminderId || !reminders.has(reminderId)) {
    return res.status(400).json({ error: 'Reminder not found' });
  }

  const reminder = reminders.get(reminderId);
  
  // Отменяем предыдущий таймер
  clearTimeout(reminder.timeoutId);
  
  // Устанавливаем новый через 5 минут (300 000 мс)
  const newDelay = 5 * 60 * 1000;
  const newTimeoutId = setTimeout(() => {
    const payload = JSON.stringify({
      title: '⏰ Напоминание (отложенное)',
      body: reminder.text,
      reminderId: reminderId,
      snoozed: true
    });

    subscriptions.forEach(sub => {
      webpush.sendNotification(sub, payload).catch(err => {
        console.error('Push error:', err);
        if (err.statusCode === 410) {
          subscriptions = subscriptions.filter(s => s.endpoint !== sub.endpoint);
        }
      });
    });

    reminders.delete(reminderId);
    console.log(`🔔 Отправлено отложенное напоминание: ${reminderId}`);
  }, newDelay);

  reminders.set(reminderId, {
    timeoutId: newTimeoutId,
    text: reminder.text,
    reminderTime: Date.now() + newDelay
  });

  console.log(`⏰ Напоминание ${reminderId} отложено на 5 минут`);
  res.status(200).json({ message: 'Reminder snoozed for 5 minutes' });
});

// Создаём HTTP сервер
const server = http.createServer(app);

// Настраиваем Socket.IO
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Обработка WebSocket соединений
io.on('connection', (socket) => {
  console.log('🔌 Клиент подключён:', socket.id);
  
  // Обработка события 'newTask' от клиента
  socket.on('newTask', (task) => {
    console.log('📝 Новая задача:', task.text);
    
    const payload = JSON.stringify({
      title: 'Новая заметка!',
      body: task.text.length > 100 ? task.text.slice(0, 100) + '...' : task.text,
      icon: '/icons/favicon-128x128.png',
      badge: '/icons/favicon-48x48.png'
    });
    
    subscriptions.forEach(sub => {
      webpush.sendNotification(sub, payload).catch(err => {
        console.error('Push error:', err);
        if (err.statusCode === 410) {
          subscriptions = subscriptions.filter(s => s.endpoint !== sub.endpoint);
        }
      });
    });
    
    io.emit('taskAdded', task);
  });
  
  // ========== НОВОЕ: Обработка напоминаний ==========
  socket.on('newReminder', (reminder) => {
    const { id, reminderId, text, reminderTime } = reminder;
    const delay = reminderTime - Date.now();
    
    console.log(`⏰ Новое напоминание: ${text}, через ${Math.round(delay / 1000)} сек`);
    
    if (delay <= 0) {
      console.log('⚠️ Время напоминания уже прошло');
      return;
    }
    
    // Сохраняем таймер
    const timeoutId = setTimeout(() => {
      const payload = JSON.stringify({
        title: '⏰ Напоминание!',
        body: text,
        reminderId: reminderId,
        icon: '/icons/favicon-128x128.png',
        badge: '/icons/favicon-48x48.png'
      });
      
      subscriptions.forEach(sub => {
        webpush.sendNotification(sub, payload).catch(err => {
          console.error('Push error:', err);
          if (err.statusCode === 410) {
            subscriptions = subscriptions.filter(s => s.endpoint !== sub.endpoint);
          }
        });
      });
      
      reminders.delete(reminderId);
      console.log(`🔔 Отправлено напоминание: ${reminderId}`);
    }, delay);
    
    reminders.set(reminderId, {
      timeoutId,
      text,
      reminderTime
    });
    
    console.log(`✅ Напоминание запланировано. Активных: ${reminders.size}`);
  });
  
  socket.on('disconnect', () => {
    console.log('🔌 Клиент отключён:', socket.id);
  });
});

// Запуск сервера
const PORT = 3001;
server.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
  console.log(`📢 VAPID Public Key: ${VAPID_PUBLIC_KEY.substring(0, 20)}...`);
});
