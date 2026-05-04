import { NoteProvider } from "./contexts/NoteContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { NoteForm } from "./components/NoteForm";
import { ReminderForm } from "./components/ReminderForm";
import { NoteList } from "./components/NoteList";
import { NotificationButton } from "./components/NotificationButton";
import "./App.css";

function App() {
  return (
    <NoteProvider>
      <NotificationProvider>
        <div className="container" style={{ maxWidth: "800px", margin: "0 auto", padding: "2rem" }}>
          <h1>📝 Офлайн заметки</h1>
          <p>Оставьте здесь свои заметки</p>
          
          <h3 style={{ marginTop: "1rem", marginBottom: "0.5rem" }}>Быстрая заметка</h3>
          <NoteForm />
          
          <hr style={{ margin: "1.5rem 0" }} />
          
          <h3 style={{ marginBottom: "0.5rem" }}>⏰ Заметка с напоминанием</h3>
          <ReminderForm />
          
          <NoteList />
          
          <NotificationButton />
        </div>
      </NotificationProvider>
    </NoteProvider>
  );
}

export default App;
