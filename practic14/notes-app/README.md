# 📱 Офлайн Заметки — PWA приложение с установкой

## Практическое занятие №14: Web App Manifest

**Дисциплина:** Фронтенд и бэкенд разработка  
**Семестр:** 4 семестр, 2025/2026 уч. год  
**Преподаватели:** Загородних Николай Анатольевич, Краснослободцева Дарья Борисовна, Бочаров Михаил Иванович

---

## Описание проекта

Прогрессивное веб-приложение (PWA) для управления заметками, которое можно **установить на устройство** как нативное приложение. Приложение работает офлайн, сохраняет данные в `localStorage` и полностью интегрируется с операционной системой через Web App Manifest.

### Что добавлено в ПЗ №14

| Компонент | Описание |
|-----------|----------|
| **manifest.json** | Файл метаданных для установки приложения |
| **Иконки** | 7 размеров (16×16 до 512×512) в формате PNG |
| **Мета-теги** | Для iOS, Android и десктопных браузеров |
| **Кнопка установки** | Появляется в адресной строке Chrome/Chromium |

---

## Функциональные требования ПЗ №14

| Требование | Реализация |
|------------|------------|
| Создать `manifest.json` | ✅ |
| Поле `name` | ✅ "Офлайн заметки" |
| Поле `short_name` | ✅ "Заметки" |
| Поле `start_url` | ✅ "/" |
| Поле `display` | ✅ "standalone" |
| Поле `background_color` | ✅ "#ffffff" |
| Поле `theme_color` | ✅ "#a29a01" |
| Поле `description` | ✅ |
| Поле `icons` (минимум 3 размера) | ✅ 7 размеров |
| Иконки в формате PNG | ✅ |
| Подключение манифеста через `<link rel="manifest">` | ✅ |
| Мета-теги для мобильных платформ | ✅ |
| Обновление Service Worker (кэш иконок) | ✅ |
| Тест установки на компьютер | ✅ |

---

## Технологический стек

- **Frontend:** React 18, JavaScript (ES6+)
- **Сборка:** Vite
- **Стили:** Chota CSS, кастомные стили
- **PWA:** Service Worker + Web App Manifest
- **Хранение данных:** localStorage

---

## Web App Manifest (manifest.json)

```json
{
  "name": "Офлайн заметки",
  "short_name": "Заметки",
  "description": "Простое приложение для заметок, работающее офлайн",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#a29a01",
  "orientation": "portrait-primary",
  "scope": "/",
  "icons": [
    { "src": "icons/favicon-16x16.png", "sizes": "16x16", "type": "image/png" },
    { "src": "icons/favicon-32x32.png", "sizes": "32x32", "type": "image/png" },
    { "src": "icons/favicon-48x48.png", "sizes": "48x48", "type": "image/png" },
    { "src": "icons/favicon-64x64.png", "sizes": "64x64", "type": "image/png" },
    { "src": "icons/favicon-128x128.png", "sizes": "128x128", "type": "image/png" },
    { "src": "icons/favicon-256x256.png", "sizes": "256x256", "type": "image/png" },
    { 
      "src": "icons/favicon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable any"
    }
  ]
}
```

### Описание полей манифеста

| Поле | Значение | Назначение |
|------|----------|------------|
| `name` | "Офлайн заметки" | Полное название приложения |
| `short_name` | "Заметки" | Короткое название (под иконкой) |
| `start_url` | "/" | Стартовая страница |
| `display` | "standalone" | Запуск в отдельном окне |
| `theme_color` | "#a29a01" | Цвет адресной строки |
| `icons` | 7 размеров | Иконки для разных устройств |

---

## Мета-теги в index.html

```html
<!-- Web App Manifest -->
<link rel="manifest" href="/manifest.json">

<!-- Для Android -->
<meta name="mobile-web-app-capable" content="yes">
<meta name="theme-color" content="#a29a01">

<!-- Для iOS -->
<link rel="apple-touch-icon" href="/icons/favicon-512x512.png">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Заметки">

<!-- Обычные favicon -->
<link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png">
<link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png">
```

---

## Обновлённый Service Worker (sw.js)

```javascript
const CACHE_NAME = "notes-pwa-v2";
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/vite.svg",
  "/icons/favicon-16x16.png",
  "/icons/favicon-32x32.png",
  "/icons/favicon-48x48.png",
  "/icons/favicon-64x64.png",
  "/icons/favicon-128x128.png",
  "/icons/favicon-256x256.png",
  "/icons/favicon-512x512.png"
];
// ... стратегия Network First
```

---

## Установка и запуск

### Требования

- Node.js (версия 16 или выше)
- npm (версия 8 или выше)

### Установка зависимостей

```bash
git clone <ссылка-на-репозиторий>
cd notes-app
npm install
```

### Запуск для тестирования установки PWA

```bash
# Сборка production версии (обязательно!)
npm run build

# Запуск preview
npm run preview -- --host 0.0.0.0

# Открыть в браузере
# http://localhost:4173
```

**Важно:** PWA-функции (установка, офлайн-режим) работают ТОЛЬКО в production режиме после сборки.

---

## Тестирование установки приложения

### В Chrome / Chromium

1. Откройте `http://localhost:4173`
2. В правой части адресной строки появится значок **"Установить"** (монитор со стрелкой или плюс в круге)
3. Нажмите на значок
4. Подтвердите установку
5. Приложение запустится в **отдельном окне** без элементов браузера

### В Firefox

1. Откройте `http://localhost:4173`
2. В адресной строке появится значок домика с плюсом
3. Нажмите → "Добавить на домашний экран"

### На Android

1. Откройте сайт в Chrome
2. Появится уведомление "Добавить на домашний экран"
3. После добавления иконка появится на рабочем столе

---

## Проверка манифеста в DevTools

### Chrome / Chromium

1. **F12** → **Application** → **Manifest**
2. Проверьте:
   - ✅ Page has a manifest: `/manifest.json`
   - ✅ Identity: name, short_name
   - ✅ Presentation: display, orientation
   - ✅ Icons: все иконки со статусом "Image OK"


### Firefox

1. **F12** → **Storage** → **Manifest**
2. Проверьте загрузку всех полей

---

## Проверка Cache Storage

После установки приложения все ресурсы должны быть закэшированы:

1. **F12** → **Application** → **Cache Storage**
2. Разверните `notes-pwa-v2`
3. Должны быть видны:
   - `index.html`
   - `manifest.json`
   - Все иконки (16x16, 32x32, ... 512x512)
   - Другие ресурсы


---

## Lighthouse аудит PWA

Запустите аудит для проверки качества PWA:

1. **F12** → **Lighthouse**
2. Выберите категории: **"Progressive Web App"**
3. Нажмите **"Analyze page load"**

**Ожидаемые результаты:**
- ✅ Web app manifest meets the installability requirements
- ✅ Configured for custom splash screen
- ✅ HTTPS (на localhost OK)

---

## Структура проекта после ПЗ №14

```
notes-app/
├── public/
│   ├── icons/
│   │   ├── favicon-16x16.png
│   │   ├── favicon-32x32.png
│   │   ├── favicon-48x48.png
│   │   ├── favicon-64x64.png
│   │   ├── favicon-128x128.png
│   │   ├── favicon-256x256.png
│   │   └── favicon-512x512.png
│   ├── manifest.json
│   └── sw.js
├── src/
│   ├── components/
│   ├── contexts/
│   ├── models/
│   ├── services/
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── package.json
└── vite.config.js
```

---

## Результаты тестирования ПЗ №14

| Тест | Результат |
|------|-----------|
| manifest.json создан и валиден | ✅ |
| Иконки всех размеров присутствуют | ✅ |
| Манифест подключён в index.html | ✅ |
| Мета-теги для iOS добавлены | ✅ |
| Service Worker кэширует иконки | ✅ |
| Кнопка установки появилась в Chrome | ✅ |
| Приложение устанавливается | ✅ |
| После установки открывается в отдельном окне | ✅ |
| Офлайн-режим работает после установки | ✅ |

---

## Возможные проблемы и решения

| Проблема | Решение |
|----------|---------|
| Нет кнопки установки | Используйте `npm run build` и `npm run preview`, а не `npm run dev` |
| Иконки не загружаются | Проверьте пути в `manifest.json` (должны быть относительные) |
| Ошибка в манифесте | Проверьте JSON на синтаксические ошибки |
| SW не обновляется | Увеличьте версию `CACHE_NAME` (v1 → v2) |
| На iOS не работает | Добавьте `apple-touch-icon` и `apple-mobile-web-app-capable` |