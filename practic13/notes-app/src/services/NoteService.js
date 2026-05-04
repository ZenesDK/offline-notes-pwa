export class NoteService {
  constructor(storage) {
    this.storage = storage;
    this.notes = [];
    this.listeners = [];
  }

  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  #notify() {
    this.listeners.forEach(cb => cb(this.notes));
  }

  async loadNotes() {
    this.notes = this.storage.load();
    this.#notify();
    return this.notes;
  }

  async addNote(text) {
    const { Note } = await import("../models/Note.js");
    const note = new Note(text);
    this.notes.push(note);
    this.storage.save(this.notes);
    this.#notify();
    return note;
  }

  async updateNote(id, newText) {
    const { Note } = await import("../models/Note.js");
    const index = this.notes.findIndex(n => n.id === id);
    if (index === -1) throw new Error("Note not found");
    
    const updatedNote = this.notes[index].updateText(newText);
    this.notes[index] = updatedNote;
    this.storage.save(this.notes);
    this.#notify();
    return updatedNote;
  }

  async deleteNote(id) {
    this.notes = this.notes.filter(n => n.id !== id);
    this.storage.save(this.notes);
    this.#notify();
  }

  getNotes() {
    return [...this.notes];
  }
}