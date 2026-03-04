import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Tractor,
  ShieldCheck,
  BarChart3,
  Droplets,
  Bug,
  Wheat,
  ArrowRight,
  Leaf,
  Smartphone,
  Cloud,
  Users,
  Menu,
  X,
} from 'lucide-react';
import { fetchCambios } from '../services/api.js';
import '../styles/Landing.css';

function normalizeTipo(raw) {
  const value = (raw || '').toString().trim().toLowerCase();
  if (!value) return 'novedad';
  const plain = value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  if (plain.startsWith('mejor')) return 'mejora';
  if (plain.startsWith('correc') || plain.startsWith('arregl') || plain.startsWith('fix')) return 'correccion';
  return 'novedad';
}

function tipoLabel(tipo) {
  const t = normalizeTipo(tipo);
  if (t === 'mejora') return 'Mejora';
  if (t === 'correccion') return 'Corrección';
  return 'Novedad';
}

const Landing = () => {
  const slides = [
    {
      id: 1,
      title: 'Panel en tiempo real',
      caption: 'Visualiza tus indicadores clave de campo, personal y finanzas de un vistazo.',
      image: '/hero/AgroManager1.png',
    },
    {
      id: 2,
      title: 'Gestión de parcelas',
      caption: 'Recorre tus lotes, cultivos y rotaciones con una vista clara y simple.',
      image: '/hero/AgroManager2.png',
    },
    {
      id: 3,
      title: 'Equipo coordinado',
      caption: 'Controla tareas, horas y maquinaria para que todo el equipo esté alineado.',
      image: '/hero/AgroManager3.png',
    },
  ];

  const [activeIndex, setActiveIndex] = useState(0);
  const [cambios, setCambios] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, 4500);
    return () => clearInterval(id);
  }, [slides.length]);

  useEffect(() => {
    fetchCambios(3)
      .then((data) => {
        setCambios(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        setCambios([]);
      });
  }, []);

  return (
    <div className="landing-page">
      {/* ── Navbar ── */}
      <header className="landing-header">
        <div className="landing-nav shell-inner">
          <div className="landing-nav-left">
            <Link to="/" className="landing-logo">
              <Leaf size={22} />
              <span>AgroManager</span>
            </Link>
            <nav className="landing-nav-links">
              <a href="#solucion">Solución</a>
              <a href="#modulos">Módulos</a>
              <a href="#como-funciona">Cómo funciona</a>
              <Link to="/cambios">Cambios</Link>
            </nav>
          </div>
          <Link to="/login" className="landing-nav-login landing-nav-login--desktop">
            Entrar al panel <ArrowRight size={14} />
          </Link>
          <button
            className="landing-hamburger"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menú"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile menu */}
        <div className={`landing-mobile-menu ${mobileMenuOpen ? 'is-open' : ''}`}>
          <nav className="landing-mobile-links">
            <a href="#solucion" onClick={() => setMobileMenuOpen(false)}>Solución</a>
            <a href="#modulos" onClick={() => setMobileMenuOpen(false)}>Módulos</a>
            <a href="#como-funciona" onClick={() => setMobileMenuOpen(false)}>Cómo funciona</a>
            <Link to="/cambios" onClick={() => setMobileMenuOpen(false)}>Cambios</Link>
          </nav>
          <Link to="/login" className="landing-nav-login landing-mobile-login" onClick={() => setMobileMenuOpen(false)}>
            Entrar al panel <ArrowRight size={14} />
          </Link>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="landing-hero-section">
        <div className="landing-hero shell-inner">
          <div className="landing-hero-text">
            <p className="landing-pill">Sistema integral de gestión agrícola</p>
            <h1 className="landing-title">
              Gestiona tu campo con <span className="landing-title-accent">inteligencia</span>
            </h1>
            <p className="landing-subtitle">
              Centraliza parcelas, personal, riego y finanzas en una sola plataforma.
              Toma decisiones con datos, no con intuición.
            </p>

            <div className="landing-hero-actions">
              <Link to="/login" className="landing-btn-primary">
                Comenzar ahora <ArrowRight size={16} />
              </Link>
              <a href="#modulos" className="landing-btn-ghost">
                Ver módulos
              </a>
            </div>

            {Array.isArray(cambios) && cambios.length > 0 && (
              <div className="landing-changelog-banner">
                <span className="landing-changelog-label">{tipoLabel(cambios[0]?.tipo)}</span>
                <span className="landing-changelog-text">{cambios[0].titulo}</span>
                <Link to="/cambios" className="landing-changelog-link">
                  Ver cambios &rarr;
                </Link>
              </div>
            )}
          </div>

          <div className="landing-hero-card landing-carousel" aria-label="Muestra del panel AgroManager">
            <div className="landing-hero-card-header">
              <span className="landing-card-dot" />
              <span className="landing-card-dot" />
              <span className="landing-card-dot" />
              <span className="landing-card-header-text">Vista rápida del panel</span>
            </div>
            <div className="landing-carousel-viewport">
              <div
                className="landing-carousel-track"
                style={{ transform: `translateX(-${activeIndex * 100}%)` }}
              >
                {slides.map((slide) => (
                  <div
                    key={slide.id}
                    className="landing-carousel-slide"
                    style={slide.image ? { backgroundImage: `url(${slide.image})` } : undefined}
                  >
                    <div className="landing-carousel-overlay">
                      <p className="landing-carousel-title">{slide.title}</p>
                      <p className="landing-carousel-caption">{slide.caption}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="landing-carousel-dots">
              {slides.map((slide, index) => (
                <button
                  key={slide.id}
                  type="button"
                  className={index === activeIndex ? 'is-active' : ''}
                  onClick={() => setActiveIndex(index)}
                  aria-label={`Ver slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="landing-stats-section">
        <div className="landing-stats shell-inner">
          <div className="landing-stat">
            <span className="landing-stat-number">8+</span>
            <span className="landing-stat-label">Módulos integrados</span>
          </div>
          <div className="landing-stat-divider" />
          <div className="landing-stat">
            <span className="landing-stat-number">100%</span>
            <span className="landing-stat-label">En la nube</span>
          </div>
          <div className="landing-stat-divider" />
          <div className="landing-stat">
            <span className="landing-stat-number">24/7</span>
            <span className="landing-stat-label">Acceso disponible</span>
          </div>
          <div className="landing-stat-divider" />
          <div className="landing-stat">
            <span className="landing-stat-number">Multi</span>
            <span className="landing-stat-label">Usuario y rol</span>
          </div>
        </div>
      </section>

      <main className="landing-main">
        {/* ── Solución ── */}
        <section id="solucion" className="landing-section">
          <div className="shell-inner">
            <div className="landing-section-header">
              <p className="landing-section-tag">Solución</p>
              <h2 className="landing-section-title">
                Todo lo que necesitas para operar tu campo
              </h2>
              <p className="landing-section-desc">
                Una plataforma diseñada para el día a día agrícola: desde el registro de labores
                hasta el análisis financiero.
              </p>
            </div>
            <div className="landing-feature-grid">
              <article className="landing-feature-card">
                <div className="landing-feature-icon landing-feature-icon--green">
                  <MapPin size={22} />
                </div>
                <h3 className="landing-feature-title">Gestión de parcelas</h3>
                <p className="landing-feature-text">
                  Registra lotes, cultivos y rotaciones. Visualiza el estado de cada parcela en tiempo real.
                </p>
              </article>
              <article className="landing-feature-card">
                <div className="landing-feature-icon landing-feature-icon--blue">
                  <Users size={22} />
                </div>
                <h3 className="landing-feature-title">Control de personal</h3>
                <p className="landing-feature-text">
                  Asigna tareas, registra horas y coordina a tu equipo sin planillas dispersas.
                </p>
              </article>
              <article className="landing-feature-card">
                <div className="landing-feature-icon landing-feature-icon--indigo">
                  <Tractor size={22} />
                </div>
                <h3 className="landing-feature-title">Maquinaria</h3>
                <p className="landing-feature-text">
                  Lleva el inventario de equipos, registra mantenimientos y programa revisiones.
                </p>
              </article>
              <article className="landing-feature-card">
                <div className="landing-feature-icon landing-feature-icon--teal">
                  <Droplets size={22} />
                </div>
                <h3 className="landing-feature-title">Riego inteligente</h3>
                <p className="landing-feature-text">
                  Configura alertas de riego, monitorea frecuencias y optimiza el uso de agua.
                </p>
              </article>
              <article className="landing-feature-card">
                <div className="landing-feature-icon landing-feature-icon--amber">
                  <Bug size={22} />
                </div>
                <h3 className="landing-feature-title">Plagas y sanidad</h3>
                <p className="landing-feature-text">
                  Registra incidencias, tratamientos aplicados y mantén un historial sanitario.
                </p>
              </article>
              <article className="landing-feature-card">
                <div className="landing-feature-icon landing-feature-icon--emerald">
                  <BarChart3 size={22} />
                </div>
                <h3 className="landing-feature-title">Finanzas y reportes</h3>
                <p className="landing-feature-text">
                  Panel financiero integrado con indicadores claros, listos para compartir.
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* ── Módulos ── */}
        <section id="modulos" className="landing-section landing-modules-section">
          <div className="shell-inner">
            <div className="landing-section-header">
              <p className="landing-section-tag">Módulos</p>
              <h2 className="landing-section-title">
                Cada área de tu operación, cubierta
              </h2>
            </div>
            <div className="landing-modules-grid">
              {[
                { icon: <MapPin size={18} />, label: 'Parcelas' },
                { icon: <Wheat size={18} />, label: 'Semillas' },
                { icon: <Tractor size={18} />, label: 'Maquinaria' },
                { icon: <Users size={18} />, label: 'Trabajadores' },
                { icon: <Droplets size={18} />, label: 'Riego' },
                { icon: <Bug size={18} />, label: 'Plagas' },
                { icon: <BarChart3 size={18} />, label: 'Finanzas' },
                { icon: <ShieldCheck size={18} />, label: 'Campañas' },
              ].map((mod) => (
                <div key={mod.label} className="landing-module-chip">
                  {mod.icon}
                  <span>{mod.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Cómo funciona ── */}
        <section id="como-funciona" className="landing-section">
          <div className="shell-inner">
            <div className="landing-section-header">
              <p className="landing-section-tag">Cómo funciona</p>
              <h2 className="landing-section-title">
                Tres pasos para tener control total
              </h2>
            </div>
            <div className="landing-steps-grid">
              <article className="landing-step-card">
                <div className="landing-step-number">01</div>
                <div className="landing-step-icon">
                  <MapPin size={24} />
                </div>
                <h3>Organiza tus campos</h3>
                <p>Da de alta parcelas, cultivos y lotes en minutos. Visualiza qué se siembra, dónde y en qué estado.</p>
              </article>
              <article className="landing-step-card">
                <div className="landing-step-number">02</div>
                <div className="landing-step-icon">
                  <Tractor size={24} />
                </div>
                <h3>Coordina tu equipo</h3>
                <p>Asigna tareas, registra horas de trabajo y mantenimientos para no perder tiempo ni recursos.</p>
              </article>
              <article className="landing-step-card">
                <div className="landing-step-number">03</div>
                <div className="landing-step-icon">
                  <BarChart3 size={24} />
                </div>
                <h3>Mide resultados</h3>
                <p>Consulta ingresos, egresos e indicadores clave en un dashboard claro y accionable.</p>
              </article>
            </div>
          </div>
        </section>

        {/* ── Ventajas ── */}
        <section className="landing-section landing-advantages-section">
          <div className="shell-inner">
            <div className="landing-section-header">
              <p className="landing-section-tag">Ventajas</p>
              <h2 className="landing-section-title">
                Pensado para el campo real
              </h2>
            </div>
            <div className="landing-advantages-grid">
              <div className="landing-advantage-card">
                <Smartphone size={28} className="landing-advantage-icon" />
                <h3>Optimizado para móvil</h3>
                <p>Interfaz responsiva que funciona en cualquier dispositivo, incluso con conexión limitada.</p>
              </div>
              <div className="landing-advantage-card">
                <Cloud size={28} className="landing-advantage-icon" />
                <h3>Datos en la nube</h3>
                <p>Tu información siempre segura, respaldada y accesible desde cualquier lugar.</p>
              </div>
              <div className="landing-advantage-card">
                <Users size={28} className="landing-advantage-icon" />
                <h3>Multiusuario</h3>
                <p>Cada miembro del equipo accede solo a lo que necesita, con roles y permisos configurables.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA final ── */}
        <section className="landing-section landing-cta-section">
          <div className="shell-inner landing-cta-inner">
            <h2 className="landing-cta-title">¿Listo para profesionalizar tu operación?</h2>
            <p className="landing-cta-text">
              Empieza a gestionar tu campo con una herramienta integral, moderna y fácil de usar.
            </p>
            <Link to="/login" className="landing-btn-primary landing-btn-lg">
              Entrar al panel <ArrowRight size={18} />
            </Link>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="landing-footer">
        <div className="shell-inner landing-footer-inner">
          <div className="landing-footer-left">
            <span className="landing-logo landing-logo--footer">
              <Leaf size={18} />
              <span>AgroManager</span>
            </span>
            <p className="landing-footer-copy">
              &copy; {new Date().getFullYear()} AgroManager. Todos los derechos reservados.
            </p>
          </div>
          <nav className="landing-footer-links">
            <a href="#solucion">Solución</a>
            <a href="#modulos">Módulos</a>
            <Link to="/cambios">Cambios</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
