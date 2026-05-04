import { NoteProvider } from "./contexts/NoteContext";
import { NotificationProvider, useNotifications } from "./contexts/NotificationContext";
import { NoteForm } from "./components/NoteForm";
import { NoteList } from "./components/NoteList";
import { NotificationButton } from "./components/NotificationButton";
import { useNotes } from "./contexts/NoteContext";
import { useEffect } from "react";
import "./App.css";

function AppContent() {
  const { notes, addNote } = useNotes();
  const { sendTaskEvent, lastNotification } = useNotifications();

  // Обёртка для addNote, чтобы отправлять событие через WebSocket
  const handleAddNote = async (text) => {
    const newNote = await addNote(text);
    if (newNote) {
      sendTaskEvent({ id: newNote.id, text: newNote.text });
    }
    return newNote;
  };

  // Подменяем addNote в контексте (костыль, но для демо подойдёт)
  useEffect(() => {
    if (addNote && sendTaskEvent) {
      // Сохраняем оригинальную функцию
      const originalAddNote = addNote;
      // Заменяем (через прототип не получится,所以在 useEffect 中处理)
    }
  }, [addNote, sendTaskEvent]);

  return (
    <div className="container" style={{ maxWidth: "800px", margin: "0 auto", padding: "2rem" }}>
      <h1>📝 Офлайн заметки</h1>
      <p>Оставьте здесь свои заметки</p>
      
      {/* Вставляем нашу обёртку для формы */}
      <NoteFormWrapper onAddNote={handleAddNote} />
      
      <NoteList />
      
      <NotificationButton />
      
      {lastNotification && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          background: '#4285f4',
          color: 'white',
          padding: '12px 20px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          zIndex: 1000
        }}>
          {lastNotification.message}
        </div>
      )}
    </div>
  );
}

// Обёртка для формы, чтобы перехватывать создание заметок
function NoteFormWrapper({ onAddNote }) {
  const { addNote } = useNotes();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const input = form.querySelector('input');
    const text = input.value.trim();
    
    if (text) {
      await onAddNote(text);
      input.value = '';
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="row" style={{ marginBottom: "2rem" }}>
      <div className="col-9">
        <input
          type="text"
          placeholder="Введите вашу заметку..."
          required
          style={{ width: "100%", padding: "0.5rem" }}
        />
      </div>
      <div className="col-3">
        <button type="submit" className="button primary">
          Добавить заметку
        </button>
      </div>
    </form>
  );
}

function App() {
  return (
    <NoteProvider>
      <NotificationProvider>
        <AppContent />
      </NotificationProvider>
    </NoteProvider>
  );
}

export default App;