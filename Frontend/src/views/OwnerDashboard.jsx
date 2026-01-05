import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchUsuarios, crearUsuario } from '../services/api.js';

const OwnerDashboard = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ nombre: '', email: '', password: '', rol: 'admin' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

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
      </main>
    </div>
  );
};

export default OwnerDashboard;
