import { useState } from "react";
import { useNotes } from "../contexts/NoteContext";

export const NoteForm = () => {
  const { addNote } = useNotes();
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    setIsSubmitting(true);
    try {
      await addNote(text);
      setText("");
    } catch (error) {
      console.error("Ошибка добавления заметки:", error);
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="row" style={{ marginBottom: "2rem" }}>
      <div className="col-9">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Введите вашу заметку..."
          disabled={isSubmitting}
          required
          style={{ width: "100%", padding: "0.5rem" }}
        />
      </div>
      <div className="col-3">
        <button type="submit" className="button primary" disabled={isSubmitting}>
          {isSubmitting ? "Добавление..." : "Добавить заметку"}
        </button>
      </div>
    </form>
  );
};