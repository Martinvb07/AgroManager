import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchUsuarios, crearUsuario, crearCambio, fetchCambios } from '../services/api.js';

const OwnerDashboard = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ nombre: '', email: '', password: '', rol: 'admin' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Cambios / novedades que verá la gente en la landing
  const [cambios, setCambios] = useState([]);
  const [cambioForm, setCambioForm] = useState({ titulo: '', descripcion: '' });
  const [cambioError, setCambioError] = useState('');
  const [cambioGuardando, setCambioGuardando] = useState(false);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await fetchUsuarios();
      setUsers(data);
    } catch (e) {
      setError(e.message || 'No se pudieron cargar los usuarios');
    } finally {
      setLoading(false);
    }
  };

  const loadCambios = async () => {
    try {
      const data = await fetchCambios(5);
      setCambios(Array.isArray(data) ? data : []);
    } catch (e) {
      // No romper el panel del dueño si falla esto
      console.error('Error cargando cambios', e);
    }
  };

  useEffect(() => {
    // Verificar que el usuario logueado sea owner (por si intentan entrar directo)
    const stored = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    if (!stored) {
      navigate('/login');
      return;
    }
    const user = JSON.parse(stored);
    const role = (user?.rol || '').toString().toLowerCase();
    if (role !== 'owner') {
      navigate('/admin');
      return;
    }

    loadUsers();
    loadCambios();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.nombre || !form.email || !form.password) {
      setError('Nombre, correo y contraseña son obligatorios');
      return;
    }

    try {
      const nuevo = await crearUsuario(form);
      setUsers((prev) => [nuevo, ...prev]);
      setForm({ nombre: '', email: '', password: '', rol: 'admin' });
      setSuccess('Usuario creado correctamente');
    } catch (e) {
      setError(e.message || 'No se pudo crear el usuario');
    }
  };

  const handleCambioSubmit = async (e) => {
    e.preventDefault();
    setCambioError('');

    const titulo = (cambioForm.titulo || '').trim();
    const descripcion = (cambioForm.descripcion || '').trim();

    if (!titulo || !descripcion) {
      setCambioError('Completa título y descripción antes de publicar.');
      return;
    }

    try {
      setCambioGuardando(true);
      const nuevo = await crearCambio({ titulo, descripcion });
      setCambios((prev) => [nuevo, ...prev].slice(0, 5));
      setCambioForm({ titulo: '', descripcion: '' });
    } catch (e) {
      console.error('Error creando cambio', e);
      setCambioError('No se pudo publicar el cambio. Intenta de nuevo.');
    } finally {
      setCambioGuardando(false);
    }
  };

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div>
          <h1 className="admin-title">Panel del dueño</h1>
          <p className="admin-subtitle">Crea y gestiona las cuentas que podrán entrar al panel admin.</p>
        </div>
        <button className="admin-button" onClick={() => navigate('/admin')}>
          Ir al panel admin
        </button>
      </header>

      <main className="admin-main">
        <section className="admin-card">
          <h2 className="section-title">Registrar nuevo usuario</h2>
          <form className="grid gap-4" onSubmit={handleSubmit}>
            <div>
              <label className="login-field-label">Nombre</label>
              <input
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                className="login-input"
                placeholder="Nombre de la persona"
              />
            </div>
            <div>
              <label className="login-field-label">Correo</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="login-input"
                placeholder="correo@ejemplo.com"
              />
            </div>
            <div>
              <label className="login-field-label">Contraseña</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className="login-input"
                placeholder="********"
              />
            </div>
            <div>
              <label className="login-field-label">Rol</label>
              <select
                name="rol"
                value={form.rol}
                onChange={handleChange}
                className="login-input"
              >
                <option value="admin">Admin</option>
                <option value="user">Usuario</option>
              </select>
            </div>

            {error && <p className="login-error">{error}</p>}
            {success && <p className="text-green-600 text-sm">{success}</p>}

            <button type="submit" className="login-button">
              Crear usuario
            </button>
          </form>
        </section>

        <section className="admin-card mt-8">
          <h2 className="section-title">Usuarios registrados</h2>
          {loading ? (
            <p>Cargando usuarios...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Correo</th>
                    <th>Rol</th>
                    <th>Estado</th>
                    <th>Creado</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td>{u.id}</td>
                      <td>{u.nombre}</td>
                      <td>{u.email}</td>
                      <td>{u.rol}</td>
                      <td>{u.estado}</td>
                      <td>{u.created_at ? new Date(u.created_at).toLocaleString() : ''}</td>
                    </tr>
                  ))}
                  {!users.length && !loading && (
                    <tr>
                      <td colSpan={6}>No hay usuarios registrados todavía.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="admin-card mt-8">
          <h2 className="section-title">Cambios y novedades (landing)</h2>
          <p className="admin-subtitle" style={{ marginTop: 4 }}>
            Todo lo que publiques aquí se mostrará en la landing pública como cambios recientes de AgroManager.
          </p>

          <form className="grid gap-4" onSubmit={handleCambioSubmit}>
            <div>
              <label className="login-field-label">Título del cambio</label>
              <input
                value={cambioForm.titulo}
                onChange={(e) => setCambioForm({ ...cambioForm, titulo: e.target.value })}
                className="login-input"
                placeholder="Ej: Nuevo módulo de riego"
              />
            </div>
            <div>
              <label className="login-field-label">Descripción breve</label>
              <textarea
                value={cambioForm.descripcion}
                onChange={(e) => setCambioForm({ ...cambioForm, descripcion: e.target.value })}
                rows={3}
                className="login-input"
                style={{ resize: 'vertical' }}
                placeholder="Cuenta en una o dos líneas qué se cambió."
              />
            </div>

            {cambioError && <p className="login-error">{cambioError}</p>}

            <button type="submit" className="login-button" disabled={cambioGuardando}>
              {cambioGuardando ? 'Publicando…' : 'Publicar cambio'}
            </button>
          </form>

          {Array.isArray(cambios) && cambios.length > 0 && (
            <div className="mt-8">
              <h3 className="section-title" style={{ fontSize: '1rem' }}>Últimos cambios publicados</h3>
              <ul style={{ listStyle: 'none', padding: 0, marginTop: 8, display: 'grid', gap: 8 }}>
                {cambios.map((cambio) => {
                  const fecha = cambio.created_at
                    ? new Date(cambio.created_at).toLocaleDateString('es-CO')
                    : '';
                  return (
                    <li
                      key={cambio.id}
                      style={{
                        padding: '10px 12px',
                        borderRadius: 10,
                        border: '1px solid #e5e7eb',
                        background: '#f9fafb',
                      }}
                    >
                      <div style={{ fontWeight: 600 }}>{cambio.titulo}</div>
                      <div style={{ fontSize: 14, marginTop: 2 }}>{cambio.descripcion}</div>
                      <div style={{ fontSize: 12, marginTop: 4, color: '#6b7280' }}>
                        {fecha && `Publicado el ${fecha}`}
                        {cambio.creado_por ? ` · por ${cambio.creado_por}` : ''}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default OwnerDashboard;
