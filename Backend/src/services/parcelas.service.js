// Servicio en memoria por ahora. Cambiar a DB cuando esté lista.
const store = new Map();
let seq = 1;

export const parcelasService = {
  async list() {
    return Array.from(store.values());
  },
  async create(payload) {
    const id = String(seq++);
    const item = { id, nombre: payload?.nombre ?? `Parcela ${id}`, ...payload };
    store.set(id, item);
    return item;
  },
  async getById(id) {
    return store.get(String(id));
  },
  async update(id, changes) {
    const current = store.get(String(id));
    if (!current) return null;
    const updated = { ...current, ...changes, id: String(id) };
    store.set(String(id), updated);
    return updated;
  },
  async remove(id) {
    return store.delete(String(id));
  },
};
