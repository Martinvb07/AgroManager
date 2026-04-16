import { env } from '../config/env.js';
import { getPool } from '../config/db.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar base de conocimiento una sola vez al iniciar
let knowledge = {};
try {
  const raw = readFileSync(join(__dirname, '..', 'data', 'knowledge.json'), 'utf-8');
  knowledge = JSON.parse(raw);
} catch (e) {
  console.error('Error cargando knowledge.json:', e.message);
}

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

/**
 * Consulta la base de datos y devuelve un resumen de toda la información
 * del usuario para pasarla como contexto al modelo de IA.
 */
async function fetchUserContext(userId) {
  const pool = getPool();

  const queries = {
    parcelas: `SELECT nombre, hectareas, cultivo, estado, inversion FROM parcelas WHERE usuario_id = ? ORDER BY id DESC LIMIT 20`,
    plagas: `SELECT cultivo, tipo, severidad, tratamiento, fecha_detec AS fechaDeteccion FROM plagas WHERE usuario_id = ? ORDER BY fecha_detec DESC LIMIT 15`,
    riego: `SELECT r.tipo, p.nombre AS parcela, r.consumo_agua AS consumoAgua, r.ultimo_riego AS ultimoRiego, r.proximo_riego AS proximoRiego FROM riego r LEFT JOIN parcelas p ON r.parcela_id = p.id WHERE r.usuario_id = ? ORDER BY r.proximo_riego DESC LIMIT 15`,
    maquinaria: `SELECT nombre, tipo, estado, ultimo_mantenimiento AS ultimoMantenimiento, proximo_mantenimiento AS proximoMantenimiento FROM maquinaria WHERE usuario_id = ? ORDER BY id DESC LIMIT 15`,
    campanas: `SELECT nombre, fecha_inicio AS fechaInicio, fecha_fin AS fechaFin, hectareas, lotes, inversion_total AS inversionTotal, gastos_operativos AS gastosOperativos, ingreso_total AS ingresoTotal, rendimiento_ha AS rendimientoHa, produccion_total AS produccionTotal FROM campanas WHERE usuario_id = ? ORDER BY fecha_inicio DESC LIMIT 10`,
    ingresos: `SELECT concepto, monto, fecha, tipo FROM ingresos WHERE usuario_id = ? ORDER BY fecha DESC LIMIT 15`,
    egresos: `SELECT concepto, monto, fecha, tipo, categoria FROM egresos WHERE usuario_id = ? ORDER BY fecha DESC LIMIT 15`,
    semillas: `SELECT tipo, cantidad, proveedor, costo FROM semillas WHERE usuario_id = ? ORDER BY id DESC LIMIT 15`,
    trabajadores: `SELECT nombre, cargo, salario, horas_trabajadas AS horasTrabajadas, estado FROM trabajadores WHERE usuario_id = ? ORDER BY id DESC LIMIT 15`,
    fertilizantes: `SELECT f.nombre, f.cantidad, f.fecha_aplicacion AS fechaAplicacion, p.nombre AS parcela, f.costo FROM fertilizantes f LEFT JOIN parcelas p ON f.parcela_id = p.id WHERE f.usuario_id = ? ORDER BY f.fecha_aplicacion DESC LIMIT 15`,
  };

  const context = {};

  const results = await Promise.allSettled(
    Object.entries(queries).map(async ([key, sql]) => {
      const [rows] = await pool.query(sql, [userId]);
      return { key, rows };
    })
  );

  for (const result of results) {
    if (result.status === 'fulfilled') {
      context[result.value.key] = result.value.rows;
    }
  }

  // Resumen financiero del mes actual
  const now = new Date();
  const mesActual = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  try {
    const [[ingSum]] = await pool.query(
      `SELECT COALESCE(SUM(monto), 0) AS total FROM ingresos WHERE usuario_id = ? AND fecha LIKE ?`,
      [userId, `${mesActual}%`]
    );
    const [[egSum]] = await pool.query(
      `SELECT COALESCE(SUM(monto), 0) AS total FROM egresos WHERE usuario_id = ? AND fecha LIKE ?`,
      [userId, `${mesActual}%`]
    );
    context.resumenMes = {
      mes: mesActual,
      ingresosMes: ingSum.total,
      egresosMes: egSum.total,
      balance: ingSum.total - egSum.total,
    };
  } catch (_) {
    // si falla el resumen financiero, no bloqueamos el chat
  }

  return context;
}

const AGROMANAGER_SYSTEM_PROMPT = `Eres AgroBot, el asistente virtual inteligente de AgroManager — un sistema integral de gestión agrícola.

Tu rol es ayudar a los usuarios de la plataforma con dudas sobre:

PARCELAS: Gestión de terrenos agrícolas (nombre, hectáreas, cultivo, estado: Activa/En preparación/Cosechada, inversión). Puedes orientar sobre rotación de cultivos, preparación de suelos y planificación de siembras.

PLAGAS Y SANIDAD: Registro y control de plagas (tipo, severidad: Bajo/Medio/Alto, cultivo afectado, tratamiento, fecha de detección). Puedes recomendar métodos de control integrado de plagas (MIP), identificación de síntomas, tratamientos orgánicos y químicos, frecuencia de monitoreo y acciones preventivas.

RIEGO: Programación de riego (tipo de riego, consumo de agua, último riego, próximo riego). Puedes asesorar sobre frecuencias óptimas según cultivo y clima, tipos de riego (goteo, aspersión, surco, inundación), ahorro de agua y señales de estrés hídrico.

MAQUINARIA: Inventario y mantenimiento de equipos (nombre, tipo, estado: Operativo/Mantenimiento/Fuera de servicio, fechas de mantenimiento). Puedes orientar sobre mantenimiento preventivo, vida útil y buenas prácticas de uso.

CAMPAÑAS AGRÍCOLAS: Seguimiento de ciclos completos de producción (nombre, fechas, hectáreas, lotes, inversión, gastos operativos, ingresos, rendimiento por ha, producción total). Incluye diario de cosecha (hectáreas cortadas, bultos, notas) y remisiones de transporte.

FINANZAS: Ingresos (ventas) y egresos (insumos, operación, personal). Puedes ayudar a analizar rentabilidad, control de costos y planificación financiera agrícola.

SEMILLAS: Inventario de semillas (tipo, cantidad, proveedor, costo). Puedes orientar sobre selección de variedades, almacenamiento y proveedores.

FERTILIZANTES: Aplicaciones de fertilizantes (parcela, producto, dosis, fecha, estado). Puedes recomendar planes de fertilización, dosis según cultivo y etapa fenológica.

TRABAJADORES: Gestión de personal (nombre, cargo, salario, horas trabajadas, estado). Incluye cálculo de liquidaciones.

REPORTES: La plataforma genera reportes y estadísticas con exportación a PDF.

Reglas de comportamiento:
- Responde SIEMPRE en español.
- Sé conciso pero completo. Usa listas cuando sea útil.
- Si la pregunta es sobre la plataforma, explica cómo usar la función en AgroManager.
- Si la pregunta es técnica-agrícola (plagas, riego, fertilización, etc.), da consejos prácticos basados en buenas prácticas agrícolas.
- Si no tienes suficiente información, pide los datos mínimos necesarios.
- No inventes datos del usuario. Si necesitas contexto específico (ej: qué cultivo tiene), pregunta.
- Mantén un tono amigable y profesional.
- Si la pregunta no tiene relación con agricultura o la plataforma, indica amablemente que estás especializado en temas agrícolas y de AgroManager.`;

async function openAiChat({ messages, context }) {
  const apiKey = env.OPENAI_API_KEY;
  if (!apiKey) {
    const err = new Error('OPENAI_API_KEY no configurada');
    err.status = 400;
    throw err;
  }

  const baseUrl = (env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '');
  const model = env.OPENAI_MODEL || 'gpt-4o-mini';

  const systemContent = AGROMANAGER_SYSTEM_PROMPT +
    (context ? `\n\nContexto actual del usuario en la plataforma:\n${JSON.stringify(context)}` : '');

  const apiMessages = [
    { role: 'system', content: systemContent },
    ...messages.map((m) => ({ role: m.role, content: m.content })),
  ];

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.4,
      max_tokens: 1024,
      messages: apiMessages,
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

/**
 * Busca en knowledge.json las categorías que coincidan con la pregunta del usuario.
 * Devuelve la info general + la específica más relevante.
 */
function findKnowledge(question) {
  const q = question.toLowerCase();
  const matches = [];

  for (const [category, data] of Object.entries(knowledge)) {
    if (!data.keywords) continue;

    // Contar cuántas keywords coinciden
    const matchedKeywords = data.keywords.filter((kw) => q.includes(kw.toLowerCase()));
    if (matchedKeywords.length === 0) continue;

    const entry = { category, score: matchedKeywords.length, general: data.general || '' };

    // Buscar coincidencia específica (ej: "sogata", "goteo", "urea")
    if (data.specific) {
      for (const [key, text] of Object.entries(data.specific)) {
        if (q.includes(key.toLowerCase())) {
          entry.specific = text;
          entry.score += 2; // priorizar específicos
          break;
        }
      }
    }

    // Buscar por cultivo (solo en riego)
    if (data.by_crop) {
      for (const [crop, text] of Object.entries(data.by_crop)) {
        if (q.includes(crop.toLowerCase())) {
          entry.byCrop = text;
          entry.score += 2;
          break;
        }
      }
    }

    matches.push(entry);
  }

  // Ordenar por relevancia
  matches.sort((a, b) => b.score - a.score);
  return matches;
}

/**
 * Genera un resumen en texto del contexto del usuario (datos de la BD)
 * para incluirlo en la respuesta.
 */
function buildUserDataSummary(dbContext) {
  if (!dbContext || typeof dbContext !== 'object') return '';

  const parts = [];

  // Parcelas
  const parcelas = dbContext.parcelas;
  if (Array.isArray(parcelas) && parcelas.length) {
    parts.push(`Tus parcelas (${parcelas.length}):`);
    for (const p of parcelas.slice(0, 5)) {
      parts.push(`  - ${p.nombre}: ${p.hectareas} ha, cultivo: ${p.cultivo || 'sin definir'}, estado: ${p.estado}`);
    }
  }

  // Plagas
  const plagas = dbContext.plagas;
  if (Array.isArray(plagas) && plagas.length) {
    parts.push(`\nPlagas registradas (${plagas.length}):`);
    for (const p of plagas.slice(0, 5)) {
      const fecha = p.fechaDeteccion ? ` (${String(p.fechaDeteccion).slice(0, 10)})` : '';
      parts.push(`  - ${p.tipo || 'Sin tipo'} en ${p.cultivo || '?'}, severidad: ${p.severidad}${fecha}${p.tratamiento ? ', tratamiento: ' + p.tratamiento : ''}`);
    }
  }

  // Riego
  const riego = dbContext.riego;
  if (Array.isArray(riego) && riego.length) {
    parts.push(`\nRiego programado (${riego.length}):`);
    for (const r of riego.slice(0, 5)) {
      const ultimo = r.ultimoRiego ? String(r.ultimoRiego).slice(0, 10) : '?';
      const proximo = r.proximoRiego ? String(r.proximoRiego).slice(0, 10) : '?';
      parts.push(`  - ${r.parcela || 'Sin parcela'}: ${r.tipo || '?'}, último: ${ultimo}, próximo: ${proximo}`);
    }
  }

  // Maquinaria
  const maq = dbContext.maquinaria;
  if (Array.isArray(maq) && maq.length) {
    parts.push(`\nMaquinaria (${maq.length}):`);
    for (const m of maq.slice(0, 5)) {
      const prox = m.proximoMantenimiento ? `, próx. mant: ${String(m.proximoMantenimiento).slice(0, 10)}` : '';
      parts.push(`  - ${m.nombre} (${m.tipo || '?'}): ${m.estado}${prox}`);
    }
  }

  // Finanzas del mes
  const resumen = dbContext.resumenMes;
  if (resumen) {
    parts.push(`\nFinanzas del mes (${resumen.mes}):`);
    parts.push(`  - Ingresos: $${Number(resumen.ingresosMes || 0).toLocaleString('es-ES')}`);
    parts.push(`  - Egresos: $${Number(resumen.egresosMes || 0).toLocaleString('es-ES')}`);
    parts.push(`  - Balance: $${Number(resumen.balance || 0).toLocaleString('es-ES')}`);
  }

  // Campañas
  const camp = dbContext.campanas;
  if (Array.isArray(camp) && camp.length) {
    parts.push(`\nCampañas recientes (${camp.length}):`);
    for (const c of camp.slice(0, 3)) {
      parts.push(`  - ${c.nombre}: ${c.hectareas || '?'} ha, inversión: $${Number(c.inversionTotal || 0).toLocaleString('es-ES')}, ingreso: $${Number(c.ingresoTotal || 0).toLocaleString('es-ES')}`);
    }
  }

  // Trabajadores
  const trab = dbContext.trabajadores;
  if (Array.isArray(trab) && trab.length) {
    parts.push(`\nTrabajadores (${trab.length}):`);
    for (const t of trab.slice(0, 5)) {
      parts.push(`  - ${t.nombre}: ${t.cargo || '?'}, estado: ${t.estado}`);
    }
  }

  // Semillas
  const sem = dbContext.semillas;
  if (Array.isArray(sem) && sem.length) {
    parts.push(`\nSemillas en inventario (${sem.length}):`);
    for (const s of sem.slice(0, 5)) {
      parts.push(`  - ${s.tipo}: ${s.cantidad} unidades, proveedor: ${s.proveedor || '?'}`);
    }
  }

  return parts.join('\n');
}

/**
 * Chatbot heurístico: busca en knowledge.json + datos del usuario en la BD.
 * No usa ninguna API externa.
 */
function buildHeuristicChat({ messages, dbContext }) {
  const lastMsg = messages[messages.length - 1]?.content || '';
  const q = lastMsg.toLowerCase();

  // Buscar conocimiento relevante
  const matches = findKnowledge(q);
  const parts = [];

  // Si el usuario pregunta por sus datos / información personal
  const askingAboutData = q.includes('mis ') || q.includes('mi ') || q.includes('tengo') ||
    q.includes('cuánto') || q.includes('cuánta') || q.includes('cómo está') || q.includes('cómo van') ||
    q.includes('estado de') || q.includes('resumen') || q.includes('datos');

  if (matches.length > 0) {
    const best = matches[0];

    // Si hay info específica (ej: preguntó por "sogata" o "goteo"), priorizarla
    if (best.specific) {
      parts.push(best.specific);
    } else if (best.byCrop) {
      parts.push(best.byCrop);
    } else {
      parts.push(best.general);
    }

    // Si el usuario pregunta por sus datos, agregar resumen de la BD
    if (askingAboutData && dbContext) {
      const summary = buildUserDataSummary(dbContext);
      if (summary) {
        parts.push('\n--- Tu información en AgroManager ---\n');
        parts.push(summary);
      }
    }

    // Si hay categorías secundarias relevantes, mencionar brevemente
    if (matches.length > 1 && matches[1].score >= 2) {
      parts.push(`\nTambién tengo información sobre ${matches[1].category}. ¿Quieres que te cuente más?`);
    }
  } else if (askingAboutData && dbContext) {
    // No encontró tema agrícola pero pide sus datos
    parts.push('Aquí tienes un resumen de tu información en AgroManager:\n');
    const summary = buildUserDataSummary(dbContext);
    if (summary) {
      parts.push(summary);
    } else {
      parts.push('No tienes datos registrados aún. Empieza agregando parcelas, trabajadores o registrando ingresos/egresos.');
    }
    parts.push('\n¿Sobre qué tema necesitas orientación?');
  } else {
    // Respuesta por defecto
    parts.push('Soy AgroBot, tu asistente agrícola en AgroManager. Puedo ayudarte con:\n');
    parts.push('- Plagas: identificación, control y tratamiento');
    parts.push('- Riego: tipos, frecuencias y recomendaciones por cultivo');
    parts.push('- Fertilización: planes, dosis y productos');
    parts.push('- Maquinaria: mantenimiento preventivo');
    parts.push('- Campañas: seguimiento de producción y cosecha');
    parts.push('- Finanzas: control de ingresos y egresos');
    parts.push('- Parcelas, semillas, personal y reportes');
    parts.push('\nTambién puedo consultar tu información registrada. Pregúntame, por ejemplo: "¿Cómo están mis parcelas?" o "¿Qué plagas tengo?"');
  }

  return parts.join('\n');
}

async function anthropicChat({ messages, context }) {
  const apiKey = env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    const err = new Error('ANTHROPIC_API_KEY no configurada');
    err.status = 400;
    throw err;
  }

  const model = env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514';

  const systemContent = AGROMANAGER_SYSTEM_PROMPT +
    (context ? `\n\nContexto actual del usuario en la plataforma:\n${JSON.stringify(context)}` : '');

  // Anthropic requiere que los mensajes alternen user/assistant y empiecen con user
  const apiMessages = messages
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .map((m) => ({ role: m.role, content: m.content }));

  // Asegurar que el primer mensaje sea de user
  if (apiMessages.length && apiMessages[0].role !== 'user') {
    apiMessages.shift();
  }

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 1024,
      system: systemContent,
      messages: apiMessages,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    const err = new Error(`Error Anthropic ${res.status}: ${text}`);
    err.status = 502;
    throw err;
  }

  const json = await res.json();
  const content = json?.content?.[0]?.text;
  if (!content) return 'No se recibió respuesta del modelo.';
  return content;
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
        { role: 'system', content: AGROMANAGER_SYSTEM_PROMPT },
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

    if (provider === 'anthropic') {
      const msgs = [{ role: 'user', content: question || 'Dame 3 acciones prioritarias para esta semana.' }];
      const answer = await anthropicChat({ messages: msgs, context });
      return { answer, provider: 'anthropic' };
    }

    if (provider === 'openai') {
      const answer = await openAiAdvice({ question, context });
      return { answer, provider: 'openai' };
    }

    const answer = buildHeuristicAdvice({ question, context });
    return { answer, provider: 'heuristic' };
  },

  async chat({ userId, messages }) {
    const provider = (env.AI_PROVIDER || 'heuristic').toLowerCase();

    // Traer datos reales del usuario desde la BD
    let dbContext = {};
    if (userId) {
      try {
        dbContext = await fetchUserContext(userId);
      } catch (e) {
        console.error('Error obteniendo contexto del usuario para chat:', e.message);
      }
    }

    if (provider === 'anthropic') {
      const answer = await anthropicChat({ messages, context: dbContext });
      return { answer, provider: 'anthropic' };
    }

    if (provider === 'openai') {
      const answer = await openAiChat({ messages, context: dbContext });
      return { answer, provider: 'openai' };
    }

    const answer = buildHeuristicChat({ messages, dbContext });
    return { answer, provider: 'heuristic' };
  },
};
