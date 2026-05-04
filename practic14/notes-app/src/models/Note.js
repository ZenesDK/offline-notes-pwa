// src/models/Note.js
export class Note {
  #id;
  #text;
  #createdAt;
  #updatedAt;

  constructor(text, id = null, createdAt = null, updatedAt = null) {
    this.#text = this.#validateText(text);
    this.#id = id || this.#generateId();
    this.#createdAt = createdAt || new Date().toISOString();
    this.#updatedAt = updatedAt || new Date().toISOString();
  }

  // Универсальный генератор ID (работает во всех браузерах)
  #generateId() {
    // Используем crypto.randomUUID() если доступен, иначе fallback
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    // Fallback: timestamp + random + counter
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${performance.now()}`;
  }

  #validateText(text) {
    if (!text || text.trim().length === 0) {
      throw new Error("Note text cannot be empty");
    }
    if (text.length > 500) {
      throw new Error("Note text cannot exceed 500 characters");
    }
    return text.trim();
  }

  get id() { return this.#id; }
  get text() { return this.#text; }
  get createdAt() { return this.#createdAt; }
  get updatedAt() { return this.#updatedAt; }

  updateText(newText) {
    return new Note(newText, this.#id, this.#createdAt);
  }

  toJSON() {
    return {
      id: this.#id,
      text: this.#text,
      createdAt: this.#createdAt,
      updatedAt: this.#updatedAt
    };
  }

  static fromJSON(data) {
    return new Note(data.text, data.id, data.createdAt, data.updatedAt);
  }
}