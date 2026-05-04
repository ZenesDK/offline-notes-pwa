import { NoteProvider } from "./contexts/NoteContext";
import { NoteForm } from "./components/NoteForm";
import { NoteList } from "./components/NoteList";
import "./App.css";

function App() {
  return (
    <NoteProvider>
      <div className="container" style={{ maxWidth: "800px", margin: "0 auto", padding: "2rem" }}>
        <h1>📝 Офлайн заметки</h1>
        <p>Оставьте здзесь свои заметки</p>
        <NoteForm />
        <NoteList />
      </div>
    </NoteProvider>
  );
}

export default App;