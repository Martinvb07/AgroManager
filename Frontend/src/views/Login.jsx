import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { login } from '../services/api.js';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Ingresa tu correo y contraseña');
      return;
    }

    setError('');
    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate('/admin');
    } catch (err) {
      const message = err?.message || 'No se pudo iniciar sesión';
      setError(message.includes('Error') ? 'Correo o contraseña incorrectos' : message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-page">
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

        <p className="login-helper">Demo sin validación real. Más adelante se conecta con tu backend.</p>
      </main>
    </div>
  );
};

export default Login;
