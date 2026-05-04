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

  if (isEditing) {
    return (
      <div className="card" style={{ marginBottom: "1rem" }}>
        <textarea
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          rows="8"
          style={{
            width: "100%",
            padding: "12px !important",
            fontFamily: "Arial, sans-serif",
            fontSize: "18px !important",
            lineHeight: "1.6 !important",
            minHeight: "150px",
            maxHeight: "500px",
            resize: "vertical",
            border: "2px solid #4CAF50",
            borderRadius: "8px",
            backgroundColor: "#fff",
            color: "#000",
            fontWeight: "normal"
          }}
          onFocus={(e) => {
            e.target.style.backgroundColor = "#fff";
            e.target.style.fontSize = "18px";
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
    <div className="card" style={{ marginBottom: "1rem" }}>
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
      
      <small style={{ display: "block", color: "#666", marginBottom: "0.75rem" }}>
        Создано: {new Date(note.createdAt).toLocaleString('ru-RU')}
      </small>
      
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <button onClick={() => setIsEditing(true)} className="button outline">Редактировать</button>
        <button onClick={handleDelete} className="button outline" style={{ color: "#dc3545" }}>Удалить</button>
      </div>
    </div>
  );
};