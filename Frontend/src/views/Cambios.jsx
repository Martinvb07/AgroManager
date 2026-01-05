import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchCambios } from '../services/api.js';

function normalizeTipo(raw) {
  const value = (raw || '').toString().trim().toLowerCase();
  if (!value) return 'novedad';
  if (value === 'todo') return 'todo';
  // normalizar sin tildes
  const plain = value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  if (plain.startsWith('noved')) return 'novedad';
  if (plain.startsWith('mejor')) return 'mejora';
  if (plain.startsWith('correc')) return 'correccion';
  if (plain.startsWith('arregl') || plain.startsWith('fix')) return 'correccion';
  return 'novedad';
}

function tipoLabel(tipo) {
  const t = normalizeTipo(tipo);
  if (t === 'mejora') return 'Mejora';
  if (t === 'correccion') return 'Corrección';
  return 'Nuevo';
}

const Cambios = () => {
  const [cambios, setCambios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState('todo');

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const data = await fetchCambios();
        if (!mounted) return;
        setCambios(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!mounted) return;
        setError('No se pudo cargar el historial de cambios.');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="landing-page" style={{ minHeight: '100vh' }}>
      <header className="landing-header shell-inner">
        <div className="landing-nav">
          <div className="landing-nav-left">
            <Link to="/" className="landing-logo" style={{ textDecoration: 'none', color: 'inherit' }}>
              AgroManager
            </Link>
            <nav className="landing-nav-links">
              <Link to="/" style={{ textDecoration: 'none' }}>Inicio</Link>
              <a href="/\#precios">Precios</a>
            </nav>
          </div>
          <Link to="/login" className="landing-nav-login">
            Entrar al panel
          </Link>
        </div>

        <div className="landing-hero">
          <div className="landing-hero-text">
            <p className="landing-pill">Historial de cambios</p>
            <h1 className="landing-title">Qué ha cambiado en AgroManager</h1>
            <p className="landing-subtitle">
              Ajustes, mejoras y nuevas funciones publicados por el dueño de la app para mantenerte al día.
            </p>
          </div>
        </div>
      </header>

      <main className="landing-main shell-inner">
        <section className="landing-section">
          {loading && <p className="landing-text">Cargando cambios...</p>}
          {error && <p className="landing-text">{error}</p>}

          {!loading && !error && cambios.length === 0 && (
            <p className="landing-text">Aún no hay cambios publicados.</p>
          )}

          {!loading && !error && cambios.length > 0 && (
            <div className="cambios-panel">
              <div className="cambios-toolbar">
                <div className="cambios-filters">
                  <button
                    type="button"
                    className={`cambios-filter ${activeFilter === 'todo' ? 'is-active' : ''}`}
                    onClick={() => setActiveFilter('todo')}
                  >
                    Todo
                  </button>
                  <button
                    type="button"
                    className={`cambios-filter ${activeFilter === 'novedad' ? 'is-active' : ''}`}
                    onClick={() => setActiveFilter('novedad')}
                  >
                    Novedad
                  </button>
                  <button
                    type="button"
                    className={`cambios-filter ${activeFilter === 'mejora' ? 'is-active' : ''}`}
                    onClick={() => setActiveFilter('mejora')}
                  >
                    Mejora
                  </button>
                  <button
                    type="button"
                    className={`cambios-filter ${activeFilter === 'correccion' ? 'is-active' : ''}`}
                    onClick={() => setActiveFilter('correccion')}
                  >
                    Corrección
                  </button>
                </div>
                <Link to="/cambios" className="cambios-toolbar-link">Ver historial completo ▸</Link>
              </div>

              <ul className="cambios-list">
                {cambios
                  .filter((cambio) => {
                    const tipo = normalizeTipo(cambio?.tipo);
                    return activeFilter === 'todo' ? true : tipo === activeFilter;
                  })
                  .map((cambio) => {
                  const fecha = cambio.created_at
                    ? new Date(cambio.created_at).toLocaleDateString('es-CO')
                    : '';
                  const tipo = normalizeTipo(cambio?.tipo);
                  const badge = tipoLabel(tipo);

                  return (
                    <li key={cambio.id} className="cambio-item">
                      <div className="cambio-icon" aria-hidden="true">🔔</div>
                      <div className="cambio-content">
                        <div className="cambio-item-header">
                          <h2 className="cambio-title">{cambio.titulo}</h2>
                        </div>
                        <p className="cambio-desc">{cambio.descripcion}</p>
                        {cambio.creado_por && (
                          <p className="cambio-meta">Publicado por {cambio.creado_por}</p>
                        )}
                      </div>
                      <div className="cambio-side-meta">
                        <span className={`cambio-badge ${tipo !== 'novedad' ? `is-${tipo}` : ''}`}>{badge}</span>
                        {fecha && <span className="cambio-date">{fecha}</span>}
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

export default Cambios;
