import { Note } from "../models/Note";

export class INoteStorage {
  load() { throw new Error("Not implemented"); }
  save(notes) { throw new Error("Not implemented"); }
}

export class StorageService extends INoteStorage {
  constructor(storageKey = "notes") {
    super();
    this.storageKey = storageKey;
  }

  load() {
    const data = localStorage.getItem(this.storageKey);
    if (!data) return [];
    try {
      const parsed = JSON.parse(data);
      return parsed.map(note => Note.fromJSON(note));
    } catch (error) {
      console.error("Failed to load notes:", error);
      return [];
    }
  }

  save(notes) {
    const serialized = notes.map(note => note.toJSON());
    localStorage.setItem(this.storageKey, JSON.stringify(serialized));
  }
}