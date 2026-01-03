// Servicio API para consumir el backend
// Ajustar BASE_URL en producción

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1';

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    ...options,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Error ${res.status}: ${text}`);
  }
  return res.json();
}

export async function fetchParcelas() {
  const json = await request('/parcelas');
  return json.data;
}

export async function crearParcela(payload) {
  const json = await request('/parcelas', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return json.data;
}

export async function actualizarParcela(id, payload) {
  const json = await request(`/parcelas/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  return json.data;
}

export async function eliminarParcela(id) {
  await request(`/parcelas/${id}`, { method: 'DELETE' });
  return true;
}
