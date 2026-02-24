import { useMemo, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { pedirConsejoIA } from '../../services/api.js';

const baseStyles = {
  card: {
    background: '#ffffff',
    borderRadius: '14px',
    padding: '16px',
    border: '1px solid #e5e7eb',
  },
  headerRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    marginBottom: '10px',
  },
  titleWrap: { display: 'flex', alignItems: 'center', gap: '10px' },
  title: { margin: 0, fontSize: '14px', fontWeight: 700, color: '#111827' },
  subtitle: { margin: 0, fontSize: '12px', color: '#6b7280' },
  textarea: {
    width: '100%',
    minHeight: '76px',
    padding: '10px 12px',
    borderRadius: '10px',
    border: '1px solid #e5e7eb',
    background: '#f9fafb',
    outline: 'none',
    fontSize: '13px',
    resize: 'vertical',
  },
  button: {
    width: '100%',
    marginTop: '10px',
    padding: '10px 14px',
    borderRadius: '999px',
    border: 'none',
    cursor: 'pointer',
    background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
    color: '#ffffff',
    fontWeight: 700,
    fontSize: '13px',
    boxShadow: '0 10px 24px rgba(15, 23, 42, 0.2)',
    opacity: 1,
  },
  answerBox: {
    marginTop: '12px',
    padding: '12px',
    borderRadius: '10px',
    border: '1px solid #e5e7eb',
    background: '#ffffff',
  },
  answerText: {
    margin: 0,
    whiteSpace: 'pre-wrap',
    fontSize: '13px',
    lineHeight: '1.45rem',
    color: '#111827',
  },
  meta: { marginTop: '8px', fontSize: '11px', color: '#6b7280' },
  error: {
    marginTop: '10px',
    fontSize: '12px',
    color: '#b91c1c',
    background: '#fee2e2',
    borderRadius: '10px',
    padding: '8px 10px',
  },
};

export default function AiAssistantCard({ stats, alerts, ingresos, egresos }) {
  const [question, setQuestion] = useState('Dame 3 acciones prioritarias para esta semana.');
  const [answer, setAnswer] = useState('');
  const [provider, setProvider] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const context = useMemo(() => {
    const lastTx = (arr, kind) =>
      Array.isArray(arr)
        ? arr
            .slice(0, 3)
            .map((t) => ({
              tipo: kind,
              concepto: t?.concepto || '-',
              monto: Number(t?.monto) || 0,
              fecha: t?.fecha || '',
            }))
        : [];

    return {
      stats: stats || {},
      alerts: Array.isArray(alerts) ? alerts : [],
      recentTransactions: [...lastTx(ingresos, 'ingreso'), ...lastTx(egresos, 'egreso')],
    };
  }, [stats, alerts, ingresos, egresos]);

  const onAsk = async () => {
    setError('');
    setLoading(true);
    try {
      const data = await pedirConsejoIA({ question, context });
      setAnswer(data?.answer || 'Sin respuesta.');
      setProvider(data?.provider || '');
    } catch (e) {
      setError(e?.message || 'No se pudo obtener recomendación.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={baseStyles.card}>
      <div style={baseStyles.headerRow}>
        <div>
          <div style={baseStyles.titleWrap}>
            <Sparkles size={18} color="#4f46e5" />
            <h3 style={baseStyles.title}>Asistente IA</h3>
          </div>
          <p style={baseStyles.subtitle}>Recomendaciones basadas en tu panel (finanzas, alertas y actividad).</p>
        </div>
      </div>

      <textarea
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        style={baseStyles.textarea}
        placeholder="Ej: ¿Qué debería priorizar hoy en riego y sanidad?"
      />

      <button
        type="button"
        onClick={onAsk}
        style={{
          ...baseStyles.button,
          opacity: loading ? 0.75 : 1,
          cursor: loading ? 'not-allowed' : 'pointer',
        }}
        disabled={loading}
      >
        {loading ? 'Generando...' : 'Generar recomendación'}
      </button>

      {error && <div style={baseStyles.error}>{error}</div>}

      {answer && (
        <div style={baseStyles.answerBox}>
          <p style={baseStyles.answerText}>{answer}</p>
          {provider && <div style={baseStyles.meta}>Proveedor: {provider}</div>}
        </div>
      )}
    </div>
  );
}
