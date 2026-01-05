import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Tractor, ShieldCheck } from 'lucide-react';
import { fetchCambios } from '../services/api.js';

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
      <header className="landing-header shell-inner">
        <div className="landing-nav">
          <div className="landing-nav-left">
            <span className="landing-logo">AgroManager</span>
            <nav className="landing-nav-links">
              <a href="#que-es">Solución</a>
              <a href="#modulos">Módulos</a>
              <a href="#precios">Precios (pronto)</a>
              <Link to="/cambios">Cambios</Link>
            </nav>
          </div>
          <Link to="/login" className="landing-nav-login">
            Entrar al panel
          </Link>
        </div>

        <div className="landing-hero">
          <div className="landing-hero-text">
            <p className="landing-pill">Sistema integral de gestión agrícola</p>
            <h1 className="landing-title">Control total de tu campo en una sola app</h1>
            <p className="landing-subtitle">
              Visualiza parcelas, personal, riego y finanzas en tiempo real. Toma decisiones con datos, no con intuición.
            </p>
            {/* Aviso compacto con el último cambio publicado */}
            {Array.isArray(cambios) && cambios.length > 0 && (
              <div className="landing-changelog-banner">
                <span className="landing-changelog-label">Novedad</span>
                <span>{cambios[0].titulo}</span>
                <Link to="/cambios" className="landing-changelog-link">
                  Ver todos los cambios
                </Link>
              </div>
            )}
          </div>

          <div className="landing-hero-card landing-carousel" aria-label="Muestra del panel AgroManager">
            <div className="landing-hero-card-header">Vista rápida del panel</div>
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
      </header>

      <main className="landing-main shell-inner">
        <section id="que-es" className="landing-section landing-feature-grid">
          <article className="landing-feature-card">
            <h2 className="landing-section-title">Para administradores y productores</h2>
            <p className="landing-text">
              Diseñado para el día a día en el campo: control de labores, personas y maquinaria sin depender de planillas dispersas.
            </p>
          </article>
          <article className="landing-feature-card">
            <h3 className="landing-feature-title">Toda la operación en un solo lugar</h3>
            <ul className="landing-list">
              <li>Gestión de parcelas, cultivos y rotaciones.</li>
              <li>Control de personal, maquinaria y mantenimiento.</li>
              <li>Alertas de riego, plagas y tareas críticas.</li>
            </ul>
          </article>
          <article className="landing-feature-card">
            <h3 className="landing-feature-title">Datos para decidir con seguridad</h3>
            <p className="landing-text">
              Panel financiero integrado, indicadores de rendimiento y reportes listos para compartir con socios, asesores o contabilidad.
            </p>
          </article>
        </section>

        <section id="modulos" className="landing-section landing-steps">
          <h2 className="landing-section-title">Cómo funciona en el día a día</h2>
          <div className="landing-steps-grid">
            <article className="landing-step-card">
              <div className="landing-step-icon">
                <MapPin />
              </div>
              <h3>Organiza tus campos</h3>
              <p>Da de alta parcelas, cultivos y lotes en minutos. Visualiza qué se siembra, dónde y en qué estado está.</p>
            </article>
            <article className="landing-step-card">
              <div className="landing-step-icon">
                <Tractor />
              </div>
              <h3>Coordina equipo y maquinaria</h3>
              <p>Asigna tareas, registra horas de trabajo y mantenimientos para no perder tiempo ni recursos.</p>
            </article>
            <article className="landing-step-card">
              <div className="landing-step-icon">
                <ShieldCheck />
              </div>
              <h3>Mide resultados en un panel</h3>
              <p>Consulta ingresos, egresos e indicadores clave en un dashboard claro, listo para tomar decisiones.</p>
            </article>
          </div>
        </section>

        <section id="precios" className="landing-section pricing-section">
          <h2 className="pricing-title">Planes y precios</h2>
          <p className="pricing-subtitle">
            Elige la forma de usar AgroManager que mejor se adapte a tu campo.
          </p>

          <div className="pricing-grid">
            <article className="pricing-card">
              <h3 className="pricing-plan-name">Plan Básico Mensual</h3>
              <p className="pricing-price-line">
                <span className="pricing-currency">$</span>
                <span className="pricing-amount">70.000</span>
                <span className="pricing-period">COP/mes</span>
              </p>
              <p className="pricing-description">
                Suscripción mensual a AgroManager para gestionar lotes, cultivos y costos de producción desde la nube.
              </p>
              <ul className="pricing-features">
                <li>Gestión de lotes y cultivos</li>
                <li>Registro de labores y actividades</li>
                <li>Control básico de insumos y costos</li>
                <li>Reportes de rendimientos por cultivo</li>
                <li>Acceso multiusuario</li>
              </ul>
              <button type="button" className="pricing-cta-btn">
                Hablar con ventas
              </button>
            </article>

            <article className="pricing-card pricing-card-featured">
              <div className="pricing-badge">Más popular</div>
              <h3 className="pricing-plan-name">Licencia Única (pago único)</h3>
              <p className="pricing-price-line">
                <span className="pricing-currency">$</span>
                <span className="pricing-amount">840.000</span>
                <span className="pricing-period">Pago único</span>
              </p>
              <p className="pricing-description">
                Compra única de la licencia de AgroManager para tu finca o empresa agrícola, con 1 año de soporte y actualizaciones.
              </p>
              <ul className="pricing-features">
                <li>Pago único por licencia (sin mensualidades)</li>
                <li>Uso ilimitado del sistema para tu operación agrícola</li>
                <li>Todas las funcionalidades del sistema AgroManager</li>
                <li>1 año de soporte y mantenimiento incluido</li>
                <li>Actualizaciones durante el primer año sin costo</li>
              </ul>
              <button type="button" className="pricing-cta-btn pricing-cta-btn-primary">
                Hablar con ventas
              </button>
            </article>
          </div>
        </section>

        <section className="landing-section landing-bottom-callout">
          <div>
            <h2 className="landing-section-title">Pensado para el campo real</h2>
            <p className="landing-text">
              Interfaz sencilla, optimizada para móviles y conexiones inestables. Tus datos quedan seguros en la nube y disponibles para todo el equipo.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Landing;
