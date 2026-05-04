export class Note {
  #id;
  #text;
  #createdAt;
  #updatedAt;
  #reminder;        // timestamp напоминания
  #reminderText;    // текст напоминания (может отличаться от заметки)
  #reminderId;      // уникальный ID для управления таймером на сервере

  constructor(text, options = {}) {
    this.#text = this.#validateText(text);
    this.#id = options.id || this.#generateId();
    this.#createdAt = options.createdAt || new Date().toISOString();
    this.#updatedAt = options.updatedAt || new Date().toISOString();
    this.#reminder = options.reminder || null;
    this.#reminderText = options.reminderText || null;
    this.#reminderId = options.reminderId || null;
  }

  #generateId() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
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

  // Геттеры
  get id() { return this.#id; }
  get text() { return this.#text; }
  get createdAt() { return this.#createdAt; }
  get updatedAt() { return this.#updatedAt; }
  get reminder() { return this.#reminder; }
  get reminderText() { return this.#reminderText; }
  get reminderId() { return this.#reminderId; }
  get hasReminder() { return this.#reminder !== null && this.#reminder > Date.now(); }

  updateText(newText) {
    return new Note(newText, {
      id: this.#id,
      createdAt: this.#createdAt,
      reminder: this.#reminder,
      reminderText: this.#reminderText,
      reminderId: this.#reminderId
    });
  }

  updateReminder(reminderTimestamp, reminderText) {
    return new Note(this.#text, {
      id: this.#id,
      createdAt: this.#createdAt,
      reminder: reminderTimestamp,
      reminderText: reminderText,
      reminderId: this.#reminderId
    });
  }

  toJSON() {
    return {
      id: this.#id,
      text: this.#text,
      createdAt: this.#createdAt,
      updatedAt: this.#updatedAt,
      reminder: this.#reminder,
      reminderText: this.#reminderText,
      reminderId: this.#reminderId
    };
  }

  static fromJSON(data) {
    return new Note(data.text, {
      id: data.id,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      reminder: data.reminder,
      reminderText: data.reminderText,
      reminderId: data.reminderId
    });
  }
}
