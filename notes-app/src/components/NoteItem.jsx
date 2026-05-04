import { useState } from "react";
import { useNotes } from "../contexts/NoteContext";

export const NoteItem = ({ note }) => {
  const { updateNote, deleteNote } = useNotes();
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(note.text);

  const handleSave = async () => {
    if (editText.trim()) {
      await updateNote(note.id, editText);
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    if (confirm("Удалить эту заметку?")) {
      await deleteNote(note.id);
    }
  };

  // Проверяем, активно ли напоминание
  const hasActiveReminder = note.hasReminder && note.reminder > Date.now();
  const reminderDate = note.reminder ? new Date(note.reminder) : null;

  if (isEditing) {
    return (
      <div className="card" style={{ marginBottom: "1rem" }}>
        <textarea
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          rows="8"
          style={{
            width: "100%",
            padding: "12px",
            fontFamily: "Arial, sans-serif",
            fontSize: "18px",
            lineHeight: "1.6",
            minHeight: "150px",
            maxHeight: "500px",
            resize: "vertical",
            border: "2px solid #4CAF50",
            borderRadius: "8px",
            backgroundColor: "#fff",
            color: "#000"
          }}
          autoFocus
        />
        <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem" }}>
          <button onClick={handleSave} className="button primary">Сохранить</button>
          <button onClick={() => setIsEditing(false)} className="button">Отмена</button>
        </div>
      </div>
    );
  }

  return (
    <div className="card" style={{ 
      marginBottom: "1rem",
      borderLeft: hasActiveReminder ? "4px solid #ffc107" : "1px solid #ddd"
    }}>
      <p style={{
        margin: "0 0 0.75rem 0",
        whiteSpace: "pre-wrap",
        wordWrap: "break-word",
        lineHeight: "1.6",
        maxHeight: "200px",
        overflowY: "auto"
      }}>
        {note.text}
      </p>
      
      {hasActiveReminder && reminderDate && (
        <div style={{
          backgroundColor: "#fff3cd",
          padding: "8px",
          borderRadius: "4px",
          marginBottom: "8px",
          fontSize: "12px",
          color: "#856404"
        }}>
          ⏰ Напоминание: {reminderDate.toLocaleString('ru-RU')}
        </div>
      )}
      
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
        <small style={{ color: "#666" }}>
          📅 {new Date(note.createdAt).toLocaleString('ru-RU')}
        </small>
        
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button onClick={() => setIsEditing(true)} className="button outline">✏️ Редактировать</button>
          <button onClick={handleDelete} className="button outline" style={{ color: "#dc3545" }}>🗑️ Удалить</button>
        </div>
      </div>
    </div>
  );
};
