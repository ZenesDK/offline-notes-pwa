const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const webpush = require('web-push');
const cors = require('cors');
const path = require('path');

// ========== VAPID КЛЮЧИ ==========
// ЗАМЕНИТЕ НА СВОИ КЛЮЧИ, СГЕНЕРИРОВАННЫЕ ВЫШЕ!
const VAPID_PUBLIC_KEY = 'BACZCozG_P85IrVzypxNv2np9viNsv3b1rWFbZ5i6qAhFQvINjgf88kvRwlqu7uo5QdXcQpZqMtm2anMddGuQio';
const VAPID_PRIVATE_KEY = 'moAJVSLj98c0hQ5WMCZ_KPFJiA7t9_JMn-hmmlIGYN8';

webpush.setVapidDetails(
  'mailto:your-email@example.com', // Замените на свой email
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

const app = express();
app.use(cors());
app.use(express.json());

// Раздача статических файлов клиента (build папка)
app.use(express.static(path.join(__dirname, '../dist')));

// Хранилище push-подписок
let subscriptions = [];

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
    
    // Рассылаем всем подключённым клиентам
    io.emit('taskAdded', task);
    
    // Отправляем push-уведомления всем подписанным клиентам
    const payload = JSON.stringify({
      title: 'Новая заметка!',
      body: task.text.length > 100 ? task.text.slice(0, 100) + '...' : task.text,
      icon: '/icons/favicon-128x128.png',
      badge: '/icons/favicon-48x48.png'
    });
    
    subscriptions.forEach(sub => {
      webpush.sendNotification(sub, payload).catch(err => {
        console.error('Push ошибка:', err);
        // Если подписка недействительна, удаляем её
        if (err.statusCode === 410) {
          subscriptions = subscriptions.filter(s => s.endpoint !== sub.endpoint);
        }
      });
    });
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
