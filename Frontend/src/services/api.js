// Servicio API para consumir el backend
// En desarrollo usa localhost, en producción usa el dominio oficial.

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.PROD
    ? 'https://agromanager.pro/api'
    : 'http://localhost:3001/api/v1');

async function request(path, options = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...authHeader },
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

// --- Trabajadores ---

export async function fetchTrabajadores() {
  const json = await request('/trabajadores');
  return json.data;
}

export async function crearTrabajador(payload) {
  const json = await request('/trabajadores', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return json.data;
}

export async function actualizarTrabajador(id, payload) {
  const json = await request(`/trabajadores/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  return json.data;
}

export async function eliminarTrabajador(id) {
  await request(`/trabajadores/${id}`, { method: 'DELETE' });
  return true;
}

// --- Finanzas (ingresos y egresos) ---

export async function fetchFinanzas() {
  const json = await request('/finanzas');
  return json.data; // { ingresos, egresos }
}

export async function crearIngreso(payload) {
  const json = await request('/finanzas/ingresos', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return json.data;
}

export async function crearEgreso(payload) {
  const json = await request('/finanzas/egresos', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return json.data;
}

// --- Campanas (campañas agrícolas) ---

export async function fetchCampanas() {
  const json = await request('/campanas');
  return json.data;
}

export async function fetchCampana(id) {
  const json = await request(`/campanas/${id}`);
  return json.data;
}

export async function crearCampana(payload) {
  const json = await request('/campanas', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return json.data;
}

export async function actualizarCampana(id, payload) {
  const json = await request(`/campanas/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  return json.data;
}

export async function eliminarCampana(id) {
  await request(`/campanas/${id}`, { method: 'DELETE' });
  return true;
}

export async function fetchCampanaDiario(campanaId) {
  const json = await request(`/campanas/${campanaId}/diario`);
  return json.data;
}

export async function crearCampanaDia(campanaId, payload) {
  const json = await request(`/campanas/${campanaId}/diario`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return json.data;
}

export async function actualizarCampanaDia(campanaId, entryId, payload) {
  const json = await request(`/campanas/${campanaId}/diario/${entryId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  return json.data;
}

export async function eliminarCampanaDia(campanaId, entryId) {
  await request(`/campanas/${campanaId}/diario/${entryId}`, { method: 'DELETE' });
  return true;
}

// --- Remisiones (por campaña) ---

export async function fetchRemisiones(campanaId) {
  const json = await request(`/campanas/${campanaId}/remisiones`);
  return json.data;
}

export async function crearRemision(campanaId, payload) {
  const json = await request(`/campanas/${campanaId}/remisiones`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return json.data;
}

export async function actualizarRemision(campanaId, remisionId, payload) {
  const json = await request(`/campanas/${campanaId}/remisiones/${remisionId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  return json.data;
}

export async function eliminarRemision(campanaId, remisionId) {
  await request(`/campanas/${campanaId}/remisiones/${remisionId}`, { method: 'DELETE' });
  return true;
}

// --- Maquinaria ---

export async function fetchMaquinaria() {
  const json = await request('/maquinaria');
  return json.data;
}

export async function crearMaquinaria(payload) {
  const json = await request('/maquinaria', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return json.data;
}

export async function actualizarMaquinaria(id, payload) {
  const json = await request(`/maquinaria/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  return json.data;
}

export async function eliminarMaquinaria(id) {
  await request(`/maquinaria/${id}`, { method: 'DELETE' });
  return true;
}

// --- Riego ---

export async function fetchRiego() {
  const json = await request('/riego');
  return json.data;
}

export async function crearRiego(payload) {
  const json = await request('/riego', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return json.data;
}

export async function actualizarRiego(id, payload) {
  const json = await request(`/riego/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  return json.data;
}

export async function eliminarRiego(id) {
  await request(`/riego/${id}`, { method: 'DELETE' });
  return true;
}

// --- Plagas ---

export async function fetchPlagas() {
  const json = await request('/plagas');
  return json.data;
}

export async function crearPlaga(payload) {
  const json = await request('/plagas', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return json.data;
}

export async function actualizarPlaga(id, payload) {
  const json = await request(`/plagas/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  return json.data;
}

export async function eliminarPlaga(id) {
  await request(`/plagas/${id}`, { method: 'DELETE' });
  return true;
}

// --- Semillas ---

export async function fetchSemillas() {
  const json = await request('/semillas');
  return json.data;
}

export async function crearSemilla(payload) {
  const json = await request('/semillas', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return json.data;
}

export async function actualizarSemilla(id, payload) {
  const json = await request(`/semillas/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  return json.data;
}

export async function eliminarSemilla(id) {
  await request(`/semillas/${id}`, { method: 'DELETE' });
  return true;
}

export async function login(email, password) {
  const json = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  return json;
}
