import React, { createContext, useContext, useEffect, useState } from "react";
import { NoteService } from "../services/NoteService";
import { StorageService } from "../services/StorageService";
import { ServiceWorkerManager } from "../services/ServiceWorkerManager";

const storage = new StorageService();
const noteService = new NoteService(storage);
const swManager = new ServiceWorkerManager();

const NoteContext = createContext(null);

export const NoteProvider = ({ children }) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = noteService.subscribe((updatedNotes) => {
      setNotes(updatedNotes);
    });
    
    noteService.loadNotes().finally(() => setLoading(false));
    swManager.register();
    
    return unsubscribe;
  }, []);

  const addNote = async (text) => {
    return await noteService.addNote(text);
  };

  const addNoteWithReminder = async (text, reminderTimestamp, reminderText) => {
    return await noteService.addNoteWithReminder(text, reminderTimestamp, reminderText);
  };

  const updateNote = async (id, text) => {
    return await noteService.updateNote(id, text);
  };

  const deleteNote = async (id) => {
    return await noteService.deleteNote(id);
  };

  return (
    <NoteContext.Provider value={{ 
      notes, 
      loading, 
      addNote, 
      addNoteWithReminder,
      updateNote, 
      deleteNote 
    }}>
      {children}
    </NoteContext.Provider>
  );
};

export const useNotes = () => {
  const context = useContext(NoteContext);
  if (!context) {
    throw new Error("useNotes must be used within NoteProvider");
  }
  return context;
};
