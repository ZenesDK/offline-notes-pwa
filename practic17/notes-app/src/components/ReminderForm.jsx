// src/components/ReminderForm.jsx
import { useState } from "react";
import { useNotes } from "../contexts/NoteContext";
import { useNotifications } from "../contexts/NotificationContext";

export const ReminderForm = () => {
  const { addNoteWithReminder } = useNotes();
  const { sendReminderEvent } = useNotifications();
  const [text, setText] = useState("");
  const [reminderDateTime, setReminderDateTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Устанавливаем минимальную дату (текущее время + 1 минута)
  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 1);
    return now.toISOString().slice(0, 16);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) {
      alert("Введите текст заметки");
      return;
    }
    if (!reminderDateTime) {
      alert("Выберите дату и время напоминания");
      return;
    }

    const reminderTimestamp = new Date(reminderDateTime).getTime();
    if (reminderTimestamp <= Date.now()) {
      alert("Время напоминания должно быть в будущем");
      return;
    }

    setIsSubmitting(true);
    try {
      const newNote = await addNoteWithReminder(text, reminderTimestamp, text);
      
      // Отправляем событие на сервер для планирования push-уведомления
      sendReminderEvent({
        id: newNote.id,
        reminderId: newNote.reminderId,
        text: text,
        reminderTime: reminderTimestamp
      });
      
      setText("");
      setReminderDateTime("");
    } catch (error) {
      console.error("Ошибка добавления заметки с напоминанием:", error);
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="row" style={{ 
      marginBottom: "2rem", 
      padding: "1rem",
      backgroundColor: "#fef9e6",
      borderRadius: "8px",
      border: "1px solid #ffd700"
    }}>
      <div className="col-12" style={{ marginBottom: "0.5rem" }}>
        <small style={{ color: "#856404" }}>⏰ Заметка с напоминанием</small>
      </div>
      <div className="col-5">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Текст напоминания..."
          disabled={isSubmitting}
          required
          style={{ width: "100%", padding: "0.5rem" }}
        />
      </div>
      <div className="col-4">
        <input
          type="datetime-local"
          value={reminderDateTime}
          onChange={(e) => setReminderDateTime(e.target.value)}
          min={getMinDateTime()}
          disabled={isSubmitting}
          required
          style={{ width: "100%", padding: "0.5rem" }}
        />
      </div>
      <div className="col-3">
        <button 
          type="submit" 
          className="button success" 
          disabled={isSubmitting}
          style={{
            backgroundColor: "#ffc107",
            borderColor: "#ffc107",
            color: "#212529",
            width: "100%"
          }}
        >
          {isSubmitting ? "Добавление..." : "⏰ Добавить с напоминанием"}
        </button>
      </div>
    </form>
  );
};
