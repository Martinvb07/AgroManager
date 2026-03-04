import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { login } from '../services/api.js';
import TractorLoader from '../components/TractorLoader.jsx';
import '../styles/Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [loaderMessage, setLoaderMessage] = useState('');
  const [pendingRoute, setPendingRoute] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Ingresa tu correo y contraseña');
      return;
    }

    setError('');
    setIsSubmitting(true);
    try {
      const { data, token } = await login(email, password);
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(data));
      }
      const role = (data?.rol || '').toString().toLowerCase();
      const dest = role === 'owner' ? '/owner' : '/admin';

      setLoaderMessage('Iniciando sesión…');
      setShowLoader(true);
      setPendingRoute(dest);
    } catch (err) {
      const message = err?.message || 'No se pudo iniciar sesión';
      setError(message.includes('Error') ? 'Correo o contraseña incorrectos' : message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // After loader shows for 2s, start exit animation then navigate
  if (showLoader && pendingRoute) {
    setTimeout(() => {
      navigate(pendingRoute);
    }, 2000);
  }

  return (
    <div className="login-page">
      {showLoader && <TractorLoader message={loaderMessage} />}
      <main className="login-main">
        <section className="login-card">
          <header className="login-header">
            <div className="login-header-main">
              <span className="login-pill">Panel de administración</span>
              <div className="login-title-row">
                <ShieldCheck className="login-icon" aria-hidden="true" />
                <div>
                  <h1 className="login-title">Iniciar sesión</h1>
                  <p className="login-subtitle">Accede al panel para gestionar tu campo.</p>
                </div>
              </div>
            </div>
            <Link to="/" className="login-home-link">
              Volver al inicio
            </Link>
          </header>

          <form onSubmit={handleSubmit} className="login-form">
            <div>
              <label className="login-field-label">Correo</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@campo.cl"
                className="login-input"
              />
            </div>

            <div>
              <label className="login-field-label">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
                className="login-input"
              />
            </div>

            {error && <p className="login-error">{error}</p>}

            <button type="submit" className="login-button" disabled={isSubmitting}>
              {isSubmitting ? 'Ingresando...' : 'Entrar al panel'}
            </button>
          </form>
        </section>

        <p className="login-helper">Tu sesión se valida contra el backend y el rol owner entra a un panel separado.</p>
      </main>
    </div>
  );
};

export default Login;
