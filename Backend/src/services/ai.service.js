import { env } from '../config/env.js';

function formatCurrency(value) {
  const n = Number(value) || 0;
  return `$${n.toLocaleString('es-ES')}`;
}

function buildHeuristicAdvice({ question, context }) {
  const stats = context?.stats || {};
  const alerts = Array.isArray(context?.alerts) ? context.alerts : [];

  const ingresosMes = Number(stats.ingresosMes) || 0;
  const gastosMes = Number(stats.gastosMes) || 0;
  const balance = ingresosMes - gastosMes;

  const lines = [];
  lines.push('Recomendaciones (modo heurístico):');

  if (alerts.length) {
    lines.push('');
    lines.push('Alertas detectadas:');
    for (const a of alerts.slice(0, 5)) {
      const title = a?.title || 'Alerta';
      const desc = a?.description || '';
      lines.push(`- ${title}${desc ? `: ${desc}` : ''}`);
    }
  }

  lines.push('');
  lines.push('Acciones sugeridas para esta semana:');

  // Finanzas
  if (balance < 0) {
    lines.push(
      `1) Finanzas: estás en negativo este mes (${formatCurrency(balance)}). Revisa egresos (insumos/operativos) y prioriza compras críticas.`
    );
  } else {
    lines.push(
      `1) Finanzas: balance positivo este mes (${formatCurrency(balance)}). Define un % para mantenimiento preventivo e insumos clave.`
    );
  }

  // Plagas
  const plaga = alerts.find((a) => (a?.title || '').toLowerCase().includes('plaga'));
  if (plaga) {
    lines.push(
      '2) Sanidad: valida severidad y foco en campo (muestreo). Registra tratamiento aplicado y programa una revisión en 48–72h.'
    );
  } else {
    lines.push('2) Sanidad: programa monitoreo de plagas (2 recorridos/semana) y registra hallazgos por parcela.');
  }

  // Riego
  const riego = alerts.find((a) => (a?.title || '').toLowerCase().includes('riego'));
  if (riego) {
    lines.push('3) Riego: confirma disponibilidad de agua/equipo y ajusta turnos para evitar riegos fuera de horario.');
  } else {
    lines.push('3) Riego: revisa calendario de riegos y evita intervalos largos en etapas sensibles del cultivo.');
  }

  if (question && question.trim()) {
    lines.push('');
    lines.push('Respuesta a tu pregunta:');
    lines.push(`- ${question.trim()}`);
    lines.push('  (Si configuras un proveedor LLM, esta sección responderá con lenguaje natural.)');
  }

  return lines.join('\n');
}

async function openAiAdvice({ question, context }) {
  const apiKey = env.OPENAI_API_KEY;
  if (!apiKey) {
    const err = new Error('OPENAI_API_KEY no configurada');
    err.status = 400;
    throw err;
  }

  const baseUrl = (env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '');
  const model = env.OPENAI_MODEL || 'gpt-4o-mini';

  const system =
    'Eres un asistente agrícola para un software llamado AgroManager. ' +
    'Da recomendaciones concretas, accionables y seguras. ' +
    'Si faltan datos, pide lo mínimo necesario. Responde en español.';

  const user = {
    question: question || 'Dame 3 acciones prioritarias para esta semana.',
    context: context || {},
  };

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.3,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: JSON.stringify(user) },
      ],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    const err = new Error(`Error OpenAI ${res.status}: ${text}`);
    err.status = 502;
    throw err;
  }

  const json = await res.json();
  const content = json?.choices?.[0]?.message?.content;
  if (!content) return 'No se recibió respuesta del modelo.';
  return content;
}

export const aiService = {
  async getAdvice({ user, question, context }) {
    const provider = (env.AI_PROVIDER || 'heuristic').toLowerCase();

    if (provider === 'openai') {
      const answer = await openAiAdvice({ question, context });
      return { answer, provider: 'openai' };
    }

    const answer = buildHeuristicAdvice({ question, context });
    return { answer, provider: 'heuristic' };
  },
};
