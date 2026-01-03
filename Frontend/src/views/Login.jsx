import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Login de ejemplo: en el futuro se conecta al backend
    if (!email || !password) {
      setError('Ingresa tu correo y contraseña');
      return;
    }
    setError('');
    // Redirigir al panel de administración
    navigate('/admin');
  };

  return (
    <div className="login-page">
      <main className="login-main">
        <section className="login-card">
          <header className="login-header">
            <span className="login-pill">Panel de administración</span>
            <div className="login-title-row">
              <ShieldCheck className="login-icon" aria-hidden="true" />
              <div>
                <h1 className="login-title">Iniciar sesión</h1>
                <p className="login-subtitle">Accede al panel para gestionar tu campo.</p>
              </div>
            </div>
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

            <button type="submit" className="login-button">
              Entrar al panel
            </button>
          </form>
        </section>

        <p className="login-helper">Demo sin validación real. Más adelante se conecta con tu backend.</p>
      </main>
    </div>
  );
};

export default Login;
