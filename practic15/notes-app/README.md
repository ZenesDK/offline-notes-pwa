# 📱 Офлайн Заметки — PWA с App Shell архитектурой

## Практическое занятие №15: HTTPS + App Shell

**Дисциплина:** Фронтенд и бэкенд разработка  
**Семестр:** 4 семестр, 2025/2026 уч. год  
**Преподаватели:** Загородних Николай Анатольевич, Краснослободцева Дарья Борисовна, Бочаров Михаил Иванович

---

## Описание проекта

Приложение для заметок с поддержкой:
- **HTTPS** — безопасное соединение для работы Service Worker
- **App Shell** — мгновенная загрузка каркаса приложения
- **Dynamic Content** — подгрузка страниц по требованию
- **Offline режим** — работа без интернета

### Что добавлено в ПЗ №15

| Компонент | Описание |
|-----------|----------|
| **HTTPS** | Локальный SSL сертификат через mkcert |
| **App Shell** | Каркас (header, nav) кэшируется при первом посещении |
| **Dynamic Content** | Страницы home.html и about.html подгружаются через fetch |
| **Два кэша** | Статика (Cache First) + Динамика (Network First) |
| **Страница "О приложении"** | Новая страница с информацией |

---

## Архитектура App Shell

```
Первый визит:
┌─────────────────────────────────────────────────────┐
│  Загрузка index.html + app.js + manifest.json      │
│  ↓                                                   │
│  Кэширование в CACHE_NAME (app-shell-v2)           │
│  ↓                                                   │
│  Отображение каркаса: шапка, меню                   │
│  ↓                                                   │
│  fetch('/content/home.html') → загрузка контента    │
└─────────────────────────────────────────────────────┘

Последующие визиты:
┌─────────────────────────────────────────────────────┐
│  Каркас загружается из кэша (мгновенно)             │
│  ↓                                                   │
│  Контент загружается из сети (Network First)        │
│  ↓                                                   │
│  При отсутствии сети — из кэша                      │
└─────────────────────────────────────────────────────┘
```

---

## Структура проекта после ПЗ №15

```
notes-app/
├── content/                      # Динамические страницы
│   ├── home.html                 # Главная страница (заметки)
│   └── about.html                # Страница "О приложении"
├── public/
│   ├── icons/                    # Иконки PWA
│   ├── manifest.json
│   └── sw.js                     # Service Worker (обновлён)
├── localhost.pem                 # SSL сертификат
├── localhost-key.pem             # Приватный ключ
├── index.html                    # App Shell (каркас)
├── app.js                        # Основная логика
├── package.json
└── vite.config.js                # Настройка HTTPS
```

---

## Настройка HTTPS

### Установка mkcert (Arch Linux)

```bash
sudo pacman -S mkcert
```

### Генерация сертификатов

```bash
cd /home/daniil/Документы/FrondEndBack/kr3/notes-app
mkcert -install
mkcert localhost 127.0.0.1 ::1
```

### Настройка Vite для HTTPS

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'

export default defineConfig({
  plugins: [react()],
  server: {
    https: {
      key: fs.readFileSync('localhost+2-key.pem'),
      cert: fs.readFileSync('localhost+2.pem')
    },
    host: true,
    port: 5173
  },
  preview: {
    https: {
      key: fs.readFileSync('localhost+2-key.pem'),
      cert: fs.readFileSync('localhost+2.pem')
    },
    host: true,
    port: 4173
  }
})
```

### Запуск с HTTPS

```bash
npm run dev          # https://localhost:5173
npm run build        # Сборка
npm run preview      # https://localhost:4173
```

---

## App Shell — index.html

```html
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="manifest" href="/manifest.json">
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="theme-color" content="#a29a01">
  <title>Заметки PWA</title>
  <link rel="stylesheet" href="https://unpkg.com/chota@latest">
</head>
<body>
  <header>
    <h1>📝 Заметки – офлайн-приложение</h1>
    <nav class="tabs is-center">
      <button id="home-btn" class="tab active col-6">Главная</button>
      <button id="about-btn" class="tab col-6">О приложении</button>
    </nav>
  </header>
  <main id="app-content" class="container" style="margin-top: 2rem;">
    <!-- Сюда загружается динамический контент -->
  </main>
  <script src="app.js"></script>
</body>
</html>
```

---

## Динамический контент

### content/home.html

```html
<div class="home-content">
  <h2 class="is-center">Добавить заметку</h2>
  <form id="note-form" class="row is-center">
    <input class="col-9" type="text" id="note-input" 
           placeholder="Введите текст заметки" required>
    <button class="col-3 button primary" type="submit">Добавить</button>
  </form>
  <h2 class="is-center" style="margin-top: 2rem;">Список заметок</h2>
  <ul id="notes-list" style="list-style: none; padding-left: 0;"></ul>
</div>
```

### content/about.html

```html
<div class="about-content">
  <h2 class="is-center">О приложении</h2>
  <p class="is-center"><strong>Версия 2.0.0</strong></p>
  <p>Это прогрессивное веб-приложение (PWA) для ведения заметок.</p>
  <p>Особенности:</p>
  <ul>
    <li>✅ Работает офлайн</li>
    <li>✅ Устанавливается на устройство</li>
    <li>✅ Мгновенная загрузка (App Shell)</li>
    <li>✅ Безопасное соединение (HTTPS)</li>
  </ul>
  <p>Разработано в рамках курса "Фронтенд и бэкенд разработка".</p>
</div>
```

---

## Основная логика — app.js

```javascript
const contentDiv = document.getElementById('app-content');
const homeBtn = document.getElementById('home-btn');
const aboutBtn = document.getElementById('about-btn');

function setActiveButton(activeId) {
  [homeBtn, aboutBtn].forEach(btn => btn.classList.remove('active'));
  document.getElementById(activeId).classList.add('active');
}

async function loadContent(page) {
  try {
    const response = await fetch(`/content/${page}.html`);
    const html = await response.text();
    contentDiv.innerHTML = html;
    
    if (page === 'home') {
      initNotes();
    }
  } catch (err) {
    contentDiv.innerHTML = '<p class="is-center text-error">Ошибка загрузки страницы</p>';
    console.error(err);
  }
}

homeBtn.addEventListener('click', () => {
  setActiveButton('home-btn');
  loadContent('home');
});

aboutBtn.addEventListener('click', () => {
  setActiveButton('about-btn');
  loadContent('about');
});

// Инициализация
loadContent('home');

// Логика заметок (localStorage)
function initNotes() {
  const form = document.getElementById('note-form');
  const input = document.getElementById('note-input');
  const list = document.getElementById('notes-list');
  
  function loadNotes() {
    const notes = JSON.parse(localStorage.getItem('notes') || '[]');
    list.innerHTML = notes.map(note => `<li>📝 ${note}</li>`).join('');
  }
  
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (text) {
      const notes = JSON.parse(localStorage.getItem('notes') || '[]');
      notes.push(text);
      localStorage.setItem('notes', JSON.stringify(notes));
      loadNotes();
      input.value = '';
    }
  });
  
  loadNotes();
}
```

---

## Service Worker — sw.js (обновлённый)

```javascript
const CACHE_NAME = 'app-shell-v2';
const DYNAMIC_CACHE_NAME = 'dynamic-content-v1';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/app.js',
  '/manifest.json',
  '/icons/favicon-16x16.png',
  '/icons/favicon-32x32.png',
  '/icons/favicon-48x48.png',
  '/icons/favicon-64x64.png',
  '/icons/favicon-128x128.png',
  '/icons/favicon-256x256.png',
  '/icons/favicon-512x512.png'
];

// Установка — кэшируем App Shell
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Активация — чистим старые кэши
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME && key !== DYNAMIC_CACHE_NAME)
          .map(key => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch стратегии
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // Пропускаем запросы к CDN
  if (url.origin !== self.location.origin) return;
  
  // Динамические страницы — Network First
  if (url.pathname.startsWith('/content/')) {
    event.respondWith(
      fetch(event.request)
        .then(networkRes => {
          const resClone = networkRes.clone();
          caches.open(DYNAMIC_CACHE_NAME).then(cache => {
            cache.put(event.request, resClone);
          });
          return networkRes;
        })
        .catch(() => {
          return caches.match(event.request)
            .then(cached => cached || caches.match('/content/home.html'));
        })
    );
    return;
  }
  
  // Статические ресурсы — Cache First
  event.respondWith(
    caches.match(event.request)
      .then(cached => cached || fetch(event.request))
  );
});
```

---

## Тестирование

### 1. Проверка HTTPS

Откройте `https://localhost:5173` — в адресной строке должен быть **замочек** 🔒

### 2. Проверка Service Worker

1. **F12** → **Application** → **Service Workers**
   - Статус: `activated and running`

2. **F12** → **Application** → **Cache Storage**
   - `app-shell-v2` — статические файлы
   - `dynamic-content-v1` — кэш страниц

### 3. Тест офлайн-режима

1. **F12** → **Application** → **Service Workers** → **Offline**
2. Обновите страницу
3. Навигация и заметки должны работать

### 4. Тест App Shell (мгновенная загрузка)

1. **F12** → **Network** → **Slow 3G**
2. Перезагрузите страницу
3. Каркас (шапка, меню) появляется сразу, контент подгружается позже

---

## Чек-лист выполнения ПЗ №15

| Требование | Реализация |
|------------|------------|
| Настройка локального HTTPS | ✅ mkcert + Vite |
| Сертификаты в корне проекта | ✅ localhost+2.pem, localhost+2-key.pem |
| App Shell архитектура | ✅ index.html (каркас) |
| Динамическая загрузка контента | ✅ fetch('/content/*.html') |
| Страница "О приложении" | ✅ content/about.html |
| Два кэша в Service Worker | ✅ app-shell-v2 + dynamic-content-v1 |
| Cache First для статики | ✅ |
| Network First для контента | ✅ |
| Fallback на home.html | ✅ |
| Работоспособность офлайн | ✅ |

---