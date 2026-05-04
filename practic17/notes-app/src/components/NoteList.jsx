import { useNotes } from "../contexts/NoteContext";
import { NoteItem } from "./NoteItem";

export const NoteList = () => {
  const { notes, loading } = useNotes();

  if (loading) {
    return <div>Загрузка заметок...</div>;
  }

  if (notes.length === 0) {
    return <div className="card">Нет заметок. Добавьте первую заметку!</div>;
  }

  return (
    <div>
      {notes.map((note) => (
        <NoteItem key={note.id} note={note} />
      ))}
    </div>
  );
};