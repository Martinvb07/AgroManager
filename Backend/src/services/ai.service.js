import { env } from '../config/env.js';
import { getPool } from '../config/db.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** Convierte a minúsculas y elimina acentos/diacríticos para comparaciones robustas. */
function normalize(str) {
  return String(str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

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

const wikiCache = new Map(); // query → { title, text, ts }
const WIKI_CACHE_TTL = 60 * 60 * 1000; // 1 hora

async function fetchWithTimeout(url, ms = 3000) {
  const controller = new AbortController();
  const tid = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(tid);
  }
}

/**
 * Busca en Wikipedia en español. Gratis, sin API key.
 * Usa cache en memoria (1 h) y timeout de 3 s por petición.
 */
async function searchWikipedia(query) {
  const cached = wikiCache.get(query);
  if (cached && Date.now() - cached.ts < WIKI_CACHE_TTL) return cached;

  try {
    const searchUrl = `https://es.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&srlimit=3&format=json&utf8=1`;
    const searchRes = await fetchWithTimeout(searchUrl);
    if (!searchRes.ok) return null;

    const searchData = await searchRes.json();
    const results = searchData?.query?.search;
    if (!results || results.length === 0) return null;

    const pageTitle = results[0].title;

    const extractUrl = `https://es.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(pageTitle)}&prop=extracts&exintro=1&explaintext=1&exchars=800&format=json&utf8=1`;
    const extractRes = await fetchWithTimeout(extractUrl);
    if (!extractRes.ok) return null;

    const extractData = await extractRes.json();
    const pages = extractData?.query?.pages;
    if (!pages) return null;

    const page = Object.values(pages)[0];
    const extract = page?.extract;
    if (!extract || extract.length < 40) return null;

    let text = extract.replace(/\n{3,}/g, '\n\n').trim();
    if (text.length > 600) {
      const cut = text.lastIndexOf('.', 600);
      text = cut > 200 ? text.slice(0, cut + 1) : text.slice(0, 600) + '...';
    }

    const result = { title: pageTitle, text, ts: Date.now() };
    wikiCache.set(query, result);
    return result;
  } catch (_) {
    return null;
  }
}

/**
 * Extrae los términos clave de la pregunta para buscar en Wikipedia.
 * Construye una query específica que combine tema + cultivo.
 */
function buildSearchQuery(question) {
  const stopWords = new Set(['que', 'como', 'cual', 'para', 'por', 'los', 'las', 'del', 'de', 'el', 'la', 'un', 'una', 'me', 'mi', 'mis', 'te', 'tu', 'tus', 'es', 'son', 'hay', 'hago', 'hacer', 'puedo', 'debo', 'deberia', 'necesito', 'tengo', 'recomiendas', 'recomendaciones', 'cuanto', 'cuanta', 'cuantos', 'cuantas', 'con', 'sin', 'mas', 'muy', 'algo', 'sobre', 'cuando', 'donde', 'favor', 'gracias']);
  const q = normalize(question).replace(/[¿?¡!.,;:]/g, '');
  const words = q.split(/\s+/).filter((w) => w.length > 2 && !stopWords.has(w));

  // Detectar cultivos para hacer query más específica
  const crops = ['arroz', 'maiz', 'soja', 'trigo', 'cafe', 'cana', 'tomate', 'papa', 'frijol', 'algodon', 'sorgo', 'yuca', 'platano', 'cacao', 'palma'];
  const topics = ['fertilizante', 'fertilizacion', 'abono', 'plaga', 'insecticida', 'fungicida', 'herbicida', 'riego', 'tratamiento', 'enfermedad', 'hongo', 'control', 'manejo', 'cosecha', 'siembra', 'semilla', 'nutriente', 'npk', 'nitrogeno', 'fosforo', 'potasio'];

  const foundCrop = crops.find((c) => q.includes(c));
  const foundTopic = topics.find((t) => q.includes(t));

  if (foundTopic && foundCrop) {
    return `${foundTopic} ${foundCrop} agricultura`;
  }
  if (foundCrop) {
    return `cultivo ${foundCrop} agricultura ${words.filter(w => w !== foundCrop).join(' ')}`.trim();
  }

  return words.join(' ') + ' agricultura';
}

/**
 * Busca en knowledge.json las categorías que coincidan con la pregunta.
 * Combina temas cruzados: ej "fertilizante" + "arroz" busca en ambas categorías.
 */
function findKnowledge(question) {
  const q = normalize(question);
  const matches = [];

  // Detectar temas cruzados (ej: "fertilizante para el arroz")
  const topicMap = {
    fertilizante: ['fertiliz', 'abono', 'nutriente', 'npk', 'urea', 'dap'],
    plaga: ['plaga', 'insecto', 'enfermedad', 'hongo', 'virus', 'control', 'tratamiento'],
    riego: ['riego', 'agua', 'humedad'],
  };
  const cropMap = ['arroz', 'maiz', 'soja', 'soya', 'cafe', 'tomate', 'papa', 'cana', 'trigo', 'platano', 'yuca', 'cacao'];

  const detectedTopic = Object.entries(topicMap).find(([, kws]) => kws.some((kw) => q.includes(kw)));
  const detectedCrop = cropMap.find((c) => q.includes(c));

  // Si hay tema + cultivo, buscar en la sección del cultivo la clave específica
  if (detectedTopic && detectedCrop) {
    const cropData = knowledge[detectedCrop];
    if (cropData?.specific) {
      const combos = [`${detectedTopic[0]} ${detectedCrop}`];
      for (const combo of combos) {
        if (cropData.specific[combo]) {
          return [{ category: detectedCrop, score: 10, specific: cropData.specific[combo] }];
        }
      }
    }
    if (cropData) {
      return [{ category: detectedCrop, score: 5, general: cropData.general }];
    }
  }

  // Búsqueda normal por keywords
  for (const [category, data] of Object.entries(knowledge)) {
    if (!data.keywords) continue;

    const matchedKeywords = data.keywords.filter((kw) => q.includes(normalize(kw)));
    if (matchedKeywords.length === 0) continue;

    const entry = { category, score: matchedKeywords.length, general: data.general || '' };

    // Buscar coincidencia específica
    if (data.specific) {
      for (const [key, text] of Object.entries(data.specific)) {
        if (q.includes(normalize(key))) {
          entry.specific = text;
          entry.score += 3;
          break;
        }
      }
    }

    // Buscar por cultivo
    if (data.by_crop) {
      for (const [crop, text] of Object.entries(data.by_crop)) {
        if (q.includes(normalize(crop))) {
          entry.byCrop = text;
          entry.score += 3;
          break;
        }
      }
    }

    matches.push(entry);
  }

  matches.sort((a, b) => b.score - a.score);
  return matches;
}

/**
 * Detecta qué temas específicos menciona la pregunta y devuelve
 * SOLO los datos de la BD relevantes a esos temas.
 * q debe ser el mensaje ya normalizado (sin acentos, minúsculas).
 */
function getRelevantUserData(q, dbContext) {
  if (!dbContext || typeof dbContext !== 'object') return '';

  const parts = [];
  const fmt = (n) => `$${Number(n || 0).toLocaleString('es-ES')}`;
  const has = (...words) => words.some((w) => q.includes(w));

  // Parcelas y cultivos
  if (has('parcela', 'terreno', 'lote', 'hectarea', 'cuanta', 'cultivo', 'sembr')) {
    const d = dbContext.parcelas;
    if (Array.isArray(d) && d.length) {
      if (has('cultivo', 'sembr')) {
        parts.push('Tus cultivos:');
        for (const p of d) parts.push(`- ${p.nombre}: ${p.cultivo || 'sin cultivo definido'} (${p.hectareas} ha, ${p.estado})`);
      } else {
        parts.push(`Tienes ${d.length} parcela(s):`);
        for (const p of d) parts.push(`- ${p.nombre}: ${p.hectareas} ha, cultivo: ${p.cultivo || 'sin definir'}, estado: ${p.estado}`);
      }
    } else parts.push('No tienes parcelas ni cultivos registrados.');
  }

  // Plagas y sanidad
  if (has('plaga', 'insecto', 'enfermedad', 'hongo', 'sanidad', 'virus')) {
    const d = dbContext.plagas;
    if (Array.isArray(d) && d.length) {
      parts.push(`Tienes ${d.length} plaga(s) registrada(s):`);
      for (const p of d.slice(0, 5)) {
        parts.push(`- ${p.tipo || '?'} en ${p.cultivo || '?'} (${p.severidad})${p.tratamiento ? ' — tratamiento: ' + p.tratamiento : ''}`);
      }
    } else parts.push('No tienes plagas registradas.');
  }

  // Riego
  if (has('riego', 'agua', 'regar', 'irrigacion')) {
    const d = dbContext.riego;
    if (Array.isArray(d) && d.length) {
      parts.push(`Tienes ${d.length} programación(es) de riego:`);
      for (const r of d.slice(0, 5)) {
        parts.push(`- ${r.parcela || '?'}: ${r.tipo || '?'}, último: ${String(r.ultimoRiego || '?').slice(0, 10)}, próximo: ${String(r.proximoRiego || '?').slice(0, 10)}`);
      }
    } else parts.push('No tienes riego programado.');
  }

  // Maquinaria
  if (has('maquinaria', 'tractor', 'equipo', 'mantenimiento', 'maquina', 'vehiculo')) {
    const d = dbContext.maquinaria;
    if (Array.isArray(d) && d.length) {
      parts.push(`Tienes ${d.length} equipo(s):`);
      for (const m of d.slice(0, 5)) {
        const prox = m.proximoMantenimiento ? `, próx. mant: ${String(m.proximoMantenimiento).slice(0, 10)}` : '';
        parts.push(`- ${m.nombre} (${m.tipo || '?'}): ${m.estado}${prox}`);
      }
    } else parts.push('No tienes maquinaria registrada.');
  }

  // Finanzas
  if (has('finanza', 'ingreso', 'egreso', 'gasto', 'dinero', 'balance', 'costo', 'plata', 'presupuesto', 'venta')) {
    const r = dbContext.resumenMes;
    if (r) {
      parts.push(`Finanzas del mes (${r.mes}): Ingresos ${fmt(r.ingresosMes)}, Egresos ${fmt(r.egresosMes)}, Balance ${fmt(r.balance)}.`);
    }
    // También mostrar últimos movimientos si pregunta por ingresos/egresos
    if (has('ingreso', 'venta') && Array.isArray(dbContext.ingresos) && dbContext.ingresos.length) {
      parts.push('Últimos ingresos:');
      for (const i of dbContext.ingresos.slice(0, 4)) parts.push(`- ${i.concepto}: ${fmt(i.monto)} (${String(i.fecha || '').slice(0, 10)})`);
    }
    if (has('egreso', 'gasto', 'costo') && Array.isArray(dbContext.egresos) && dbContext.egresos.length) {
      parts.push('Últimos egresos:');
      for (const e of dbContext.egresos.slice(0, 4)) parts.push(`- ${e.concepto}: ${fmt(e.monto)} (${String(e.fecha || '').slice(0, 10)})`);
    }
  }

  // Campañas
  if (has('campana', 'cosecha', 'produccion', 'rendimiento', 'ciclo')) {
    const d = dbContext.campanas;
    if (Array.isArray(d) && d.length) {
      parts.push(`Tienes ${d.length} campaña(s):`);
      for (const c of d.slice(0, 3)) {
        parts.push(`- ${c.nombre}: ${c.hectareas || '?'} ha, inversión: ${fmt(c.inversionTotal)}, ingreso: ${fmt(c.ingresoTotal)}`);
      }
    } else parts.push('No tienes campañas registradas.');
  }

  // Trabajadores
  if (has('trabajador', 'personal', 'empleado', 'salario', 'operario', 'jornalero', 'liquidacion')) {
    const d = dbContext.trabajadores;
    if (Array.isArray(d) && d.length) {
      parts.push(`Tienes ${d.length} trabajador(es):`);
      for (const t of d.slice(0, 5)) {
        const sal = t.salario ? `, salario: ${fmt(t.salario)}` : '';
        parts.push(`- ${t.nombre}: ${t.cargo || '?'}${sal}, ${t.estado}`);
      }
    } else parts.push('No tienes trabajadores registrados.');
  }

  // Semillas
  if (has('semilla', 'siembra', 'variedad', 'grano')) {
    const d = dbContext.semillas;
    if (Array.isArray(d) && d.length) {
      parts.push(`Tienes ${d.length} tipo(s) de semilla:`);
      for (const s of d.slice(0, 5)) parts.push(`- ${s.tipo}: ${s.cantidad} und, proveedor: ${s.proveedor || '?'}`);
    } else parts.push('No tienes semillas registradas.');
  }

  // Fertilizantes
  if (has('fertilizante', 'abono', 'fertilizacion', 'nutriente', 'npk', 'urea', 'aplicacion')) {
    const d = dbContext.fertilizantes;
    if (Array.isArray(d) && d.length) {
      parts.push(`Tienes ${d.length} aplicación(es) de fertilizante registradas:`);
      for (const f of d.slice(0, 5)) {
        parts.push(`- ${f.nombre}: ${f.cantidad || '?'} en ${f.parcela || '?'} (${String(f.fechaAplicacion || '?').slice(0, 10)})`);
      }
    } else parts.push('No tienes aplicaciones de fertilizante registradas.');
  }

  return parts.join('\n');
}

/**
 * Genera resumen general SOLO cuando el usuario pide un panorama completo.
 */
function buildFullSummary(dbContext) {
  if (!dbContext || typeof dbContext !== 'object') return 'No tienes datos registrados aún.';
  const fmt = (n) => `$${Number(n || 0).toLocaleString('es-ES')}`;
  const parts = ['Aquí está el resumen de tu finca:'];
  const p = dbContext.parcelas;
  if (Array.isArray(p) && p.length) parts.push(`- Parcelas: ${p.length} (${p.map(x => x.nombre).join(', ')})`);
  const pl = dbContext.plagas;
  if (Array.isArray(pl) && pl.length) parts.push(`- Plagas registradas: ${pl.length}`);
  else parts.push('- Sin plagas registradas');
  const r = dbContext.riego;
  if (Array.isArray(r) && r.length) parts.push(`- Riegos programados: ${r.length}`);
  const m = dbContext.maquinaria;
  if (Array.isArray(m) && m.length) parts.push(`- Equipos: ${m.length}`);
  const c = dbContext.campanas;
  if (Array.isArray(c) && c.length) parts.push(`- Campañas: ${c.length}`);
  const t = dbContext.trabajadores;
  if (Array.isArray(t) && t.length) parts.push(`- Trabajadores: ${t.length}`);
  const s = dbContext.semillas;
  if (Array.isArray(s) && s.length) parts.push(`- Tipos de semilla: ${s.length}`);
  const f = dbContext.fertilizantes;
  if (Array.isArray(f) && f.length) parts.push(`- Aplicaciones de fertilizante: ${f.length}`);
  const rm = dbContext.resumenMes;
  if (rm) parts.push(`- Balance del mes (${rm.mes}): Ingresos ${fmt(rm.ingresosMes)}, Egresos ${fmt(rm.egresosMes)}, Balance ${fmt(rm.balance)}`);
  return parts.length > 1 ? parts.join('\n') : 'No tienes datos registrados aún.';
}

/**
 * Detecta alertas urgentes en los datos del usuario (riegos, mantenimientos, plagas, balance).
 */
function detectProactiveAlerts(dbContext) {
  if (!dbContext) return [];
  const fmt = (n) => `$${Number(n || 0).toLocaleString('es-ES')}`;
  const alerts = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const in7Days = new Date(today);
  in7Days.setDate(in7Days.getDate() + 7);

  if (Array.isArray(dbContext.riego)) {
    const vencidos = dbContext.riego.filter((r) => {
      const d = new Date(r.proximoRiego);
      return !isNaN(d.getTime()) && d <= today;
    });
    if (vencidos.length)
      alerts.push(`⚠️ **${vencidos.length} riego(s) vencido(s):** ${vencidos.slice(0, 3).map((r) => r.parcela || 'parcela').join(', ')}.`);
  }

  if (Array.isArray(dbContext.maquinaria)) {
    const proximos = dbContext.maquinaria.filter((m) => {
      const d = new Date(m.proximoMantenimiento);
      return !isNaN(d.getTime()) && d <= in7Days;
    });
    if (proximos.length)
      alerts.push(`🔧 **${proximos.length} mantenimiento(s) próximo(s):** ${proximos.slice(0, 3).map((m) => m.nombre).join(', ')}.`);
  }

  if (Array.isArray(dbContext.plagas)) {
    const altas = dbContext.plagas.filter(
      (p) => normalize(p.severidad || '').includes('alt')
    );
    if (altas.length)
      alerts.push(`🐛 **${altas.length} plaga(s) con severidad ALTA** requieren atención inmediata.`);
  }

  if (dbContext.resumenMes && Number(dbContext.resumenMes.balance) < 0)
    alerts.push(`📉 **Balance negativo este mes:** ${fmt(dbContext.resumenMes.balance)}.`);

  return alerts;
}

/**
 * Extrae cultivo y tema de los mensajes anteriores para resolver referencias implícitas
 * ("¿y las plagas?" cuando antes habló de arroz).
 */
function resolveConversationContext(messages) {
  if (messages.length < 2) return { crop: null, topic: null };
  const prevText = messages
    .slice(-5, -1)
    .map((m) => normalize(m.content || ''))
    .join(' ');

  const crops = ['arroz', 'maiz', 'soja', 'cafe', 'tomate', 'papa', 'cana', 'platano', 'yuca', 'cacao', 'palma', 'trigo', 'sorgo', 'frijol'];
  const topics = ['plaga', 'riego', 'fertilizante', 'abono', 'maquinaria', 'tractor', 'finanza', 'ingreso', 'campana', 'semilla', 'trabajador'];

  return {
    crop: crops.find((c) => prevText.includes(c)) || null,
    topic: topics.find((t) => prevText.includes(t)) || null,
  };
}

/**
 * Detecta el tema principal de la query normalizada.
 */
function detectTopic(q) {
  if (q.match(/plaga|insecto|enfermedad|hongo|virus|cogollero|sogata|roya|añublo/)) return 'plaga';
  if (q.match(/riego|agua|regar|irrigac|lamina|goteo|aspersion/)) return 'riego';
  if (q.match(/fertilizante|abono|nutriente|npk|urea|dap|kcl|foliar/)) return 'fertilizante';
  if (q.match(/finanza|ingreso|egreso|gasto|balance|dinero|costo|venta|plata/)) return 'finanza';
  if (q.match(/maquinaria|tractor|equipo|mantenimiento|cosechadora|fumigadora/)) return 'maquinaria';
  if (q.match(/campana|cosecha|produccion|rendimiento|ciclo|zafra/)) return 'campana';
  if (q.match(/trabajador|personal|empleado|salario|liquidacion|nomina/)) return 'trabajador';
  if (q.match(/parcela|terreno|lote|hectarea/)) return 'parcela';
  if (q.match(/semilla|siembra|variedad|germinacion/)) return 'semilla';
  return null;
}

/**
 * Genera 3 preguntas sugeridas según el tema de la respuesta.
 */
function buildSuggestions(topic) {
  const map = {
    plaga: ['¿Cuántas plagas tengo registradas?', '¿Cómo monitoreo plagas en campo?', '¿Qué tratamiento aplico para la sogata?'],
    riego: ['¿Cuándo es mi próximo riego?', '¿Qué tipo de riego es más eficiente?', '¿Cuánta agua consume el arroz por ciclo?'],
    fertilizante: ['¿Cuántos fertilizantes tengo registrados?', '¿Cómo fracciono el nitrógeno en maíz?', '¿Qué análisis de suelo debo hacer?'],
    finanza: ['¿Cuál es mi balance del mes?', '¿Cuáles son mis principales egresos?', '¿Cuánto he ingresado este mes?'],
    maquinaria: ['¿Qué equipos tienen mantenimiento próximo?', '¿Cuándo fue el último servicio del tractor?', '¿Cómo programo el mantenimiento preventivo?'],
    campana: ['¿Cuál es el rendimiento de mi campaña?', '¿Cómo registro el diario de cosecha?', '¿Cuántas hectáreas llevo cosechadas?'],
    trabajador: ['¿Cuántos trabajadores tengo activos?', '¿Cómo calculo la liquidación?', '¿Cómo registro horas extras?'],
    parcela: ['¿Cuántas hectáreas tengo en total?', '¿Qué parcelas están activas?', '¿Qué cultivo tengo en cada parcela?'],
    semilla: ['¿Cuántas semillas me quedan?', '¿Cuál es la densidad de siembra recomendada?', '¿Cómo almaceno semillas correctamente?'],
  };
  const list = map[topic] || ['¿Qué cultivos tengo?', '¿Cuál es mi balance del mes?', '¿Tengo alertas pendientes?'];
  return '\n\n💡 *Preguntas relacionadas:*\n' + list.map((s) => `• ${s}`).join('\n');
}

/**
 * Añade un consejo breve de la plataforma según el tema detectado.
 */
function addPlatformTip(topic) {
  const tips = {
    plaga: '\n\n📋 *Tip:* Registra severidad y tratamiento en AgroManager > Plagas para hacer seguimiento histórico.',
    riego: '\n\n📋 *Tip:* Programa riegos futuros en AgroManager para mantener tu calendario hídrico al día.',
    fertilizante: '\n\n📋 *Tip:* Registra cada aplicación con fecha y dosis para calcular el costo por hectárea de fertilización.',
    finanza: '\n\n📋 *Tip:* Registra egresos el mismo día para mantener el balance actualizado y tomar mejores decisiones.',
    maquinaria: '\n\n📋 *Tip:* Actualiza la fecha de próximo mantenimiento después de cada servicio para evitar paros inesperados.',
    campana: '\n\n📋 *Tip:* Registra el diario de cosecha diariamente para ver el rendimiento en tiempo real.',
    trabajador: '\n\n📋 *Tip:* Mantén las horas trabajadas actualizadas para que el cálculo de liquidación sea preciso.',
    parcela: '\n\n📋 *Tip:* Actualiza el estado de tus parcelas conforme avanza el ciclo: En preparación → Activa → Cosechada.',
    semilla: '\n\n📋 *Tip:* Usa semilla certificada para garantizar germinación >80% y protección fitosanitaria desde el inicio.',
  };
  return tips[topic] || '';
}

/**
 * Chatbot heurístico: responde usando knowledge.json + Wikipedia + datos de la BD.
 * Incluye contexto conversacional, alertas proactivas, respuestas combinadas,
 * detección de urgencia y sugerencias contextuales.
 */
async function buildHeuristicChat({ messages, dbContext }) {
  const lastMsg = messages[messages.length - 1]?.content || '';
  const q = normalize(lastMsg);
  const has = (...words) => words.some((w) => q.includes(w));

  // --- Mensaje demasiado corto ---
  if (q.trim().length < 2) {
    return '¿En qué te puedo ayudar? Escríbeme una pregunta sobre tu finca o agricultura.';
  }

  // --- Saludos → respuesta + alertas proactivas ---
  if (/^(hola|hey|buenas?|buen\s|buenos\s|saludos|que\s*tal|como\s*estas?|hi\b|good\s)/.test(q.trim())) {
    const alerts = dbContext ? detectProactiveAlerts(dbContext) : [];
    const greeting = '¡Hola! Soy **AgroBot**, tu asistente agrícola en AgroManager. Puedo ayudarte con plagas, riego, fertilización, maquinaria, campañas, finanzas y más.';
    if (alerts.length) {
      return `${greeting}\n\n📌 **Atención — tienes pendientes importantes:**\n${alerts.join('\n')}\n\n¿En qué quieres profundizar?`;
    }
    return `${greeting}\n\n¿En qué te puedo ayudar hoy? Escribe "ayuda" para ver todo lo que puedo hacer.`;
  }

  // --- Agradecimientos ---
  if (/^(gracias|muchas\s*gracias|grax|thanks|ok\s*gracias|perfecto|listo|genial|excelente|chevere)/.test(q.trim())) {
    return '¡De nada! Si tienes más preguntas sobre tu finca o cultivos, aquí estoy. 🌱\n' + buildSuggestions(null);
  }

  // --- Ayuda / qué puedes hacer ---
  if (has('ayuda', 'que puedes', 'que sabes', 'para que sirves', 'como funciona', 'que haces', 'funciones', 'capacidades')) {
    return `Soy **AgroBot** y puedo ayudarte con:

- 🌿 **Parcelas**: estado, hectáreas y cultivos registrados
- 🐛 **Plagas y sanidad**: alertas, tratamientos y niveles de severidad
- 💧 **Riego**: programación, fechas y recomendaciones por cultivo
- 🚜 **Maquinaria**: equipos y mantenimientos próximos
- 🌾 **Campañas agrícolas**: producción, rendimiento e inversión
- 💰 **Finanzas**: ingresos, egresos y balance del mes
- 🌱 **Semillas y fertilizantes**: inventario y aplicaciones
- 👷 **Trabajadores**: personal, cargos y salarios
- 📖 **Conocimiento agrícola**: plagas, fertilización, riego y cultivos (arroz, maíz, soja, café, caña, plátano, cacao, palma, yuca…)

*Ejemplos de preguntas:*
• "¿cuántas parcelas tengo?"
• "¿cómo controlo la sogata en arroz?"
• "¿cuál es mi balance este mes?"
• "¿tengo mantenimientos vencidos?"`;
  }

  // --- Detección de urgencia ---
  const isUrgent = has('urgente', 'emergencia', 'muriendose', 'muriendo', 'se muere', 'perdiendo cosecha',
    'no arranca', 'se cayo', 'crisis', 'inmediato', 'ayuda urgente', 'socorro', 'grave');

  // --- Contexto conversacional ---
  const prevCtx = resolveConversationContext(messages);
  let enrichedQ = q;
  if (prevCtx.crop && !has(prevCtx.crop)) enrichedQ = `${q} ${prevCtx.crop}`;
  if (prevCtx.topic && !has(prevCtx.topic)) enrichedQ = `${enrichedQ} ${prevCtx.topic}`;

  // --- Detectar si pregunta por SUS datos ---
  const askingAboutData =
    has('mis ', 'mi ', 'tengo', 'tengo registr', 'cuantos', 'cuantas', 'cuanto', 'cuanta',
        'como esta', 'como van', 'dame', 'dime', 'muestra', 'lista', 'listame',
        'cuales son', 'que tengo', 'ver mis', 'mostrar', 'alertas', 'pendientes');

  const askingFullSummary = has('resumen', 'todo', 'general', 'panorama', 'estado general', 'como estoy', 'como va todo');

  if ((askingAboutData || askingFullSummary) && dbContext) {
    const specificTopics = ['plaga', 'riego', 'parcela', 'terreno', 'maquinaria', 'tractor',
      'finanza', 'ingreso', 'egreso', 'trabajador', 'semilla', 'fertilizante', 'campana', 'cosecha', 'abono'];

    if (askingFullSummary && !specificTopics.some((t) => has(t))) {
      const summary = buildFullSummary(dbContext);
      const alerts = detectProactiveAlerts(dbContext);
      const alertBlock = alerts.length ? `\n\n📌 **Pendientes urgentes:**\n${alerts.join('\n')}` : '';
      return summary + alertBlock + buildSuggestions(null);
    }

    const data = getRelevantUserData(enrichedQ, dbContext);
    if (data) {
      const topic = detectTopic(enrichedQ);
      const tip = addPlatformTip(topic);
      const urgentNote = isUrgent ? '\n\n🚨 *Situación urgente detectada. Actúa de inmediato y registra el evento en AgroManager.*' : '';
      return data + tip + urgentNote + buildSuggestions(topic);
    }
    return buildFullSummary(dbContext);
  }

  // --- Buscar en base de conocimiento local ---
  const matches = findKnowledge(enrichedQ);
  const searchQuery = buildSearchQuery(lastMsg + (prevCtx.crop ? ` ${prevCtx.crop}` : ''));
  const topic = detectTopic(enrichedQ);

  if (matches.length > 0) {
    const best = matches[0];
    let answer = best.specific || best.byCrop || null;

    if (!answer) {
      // Info general disponible → intentar enriquecer con Wikipedia
      if (searchQuery.length > 3) {
        const wiki = await searchWikipedia(searchQuery);
        if (wiki) answer = wiki.text;
      }
      if (!answer) answer = best.general;
    }

    const urgentNote = isUrgent
      ? '\n\n🚨 *Situación urgente: aplica el tratamiento de forma inmediata y documenta en AgroManager > Plagas/Maquinaria.*'
      : '';
    return answer + urgentNote + addPlatformTip(topic) + buildSuggestions(topic);
  }

  // --- Fallback: búsqueda en Wikipedia ---
  if (searchQuery.length > 3) {
    const wiki = await searchWikipedia(searchQuery);
    if (wiki) {
      return wiki.text + addPlatformTip(topic) + buildSuggestions(topic);
    }
  }

  return `No encontré información específica sobre eso. Puedo ayudarte con plagas, riego, fertilización, maquinaria, campañas, finanzas o datos de tu finca.\n\nEscribe **"ayuda"** para ver todo lo que puedo hacer.` + buildSuggestions(topic);
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

    const answer = await buildHeuristicChat({ messages, dbContext });
    return { answer, provider: 'heuristic' };
  },
};
