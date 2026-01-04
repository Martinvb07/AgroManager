import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Settings } from 'lucide-react';
import jsPDF from 'jspdf';
import { actualizarCampana, crearCampanaDia, eliminarCampanaDia, fetchCampana, fetchCampanaDiario, actualizarCampanaDia, fetchRemisiones, crearRemision, actualizarRemision, eliminarRemision } from '../services/api.js';
import { campanas as mockCampanas } from '../services/mockData.js';

const normalizeDateInput = (value) => {
  if (!value) return new Date().toISOString().slice(0, 10);
  // Acepta tanto 'YYYY-MM-DD' como ISO completo 'YYYY-MM-DDTHH:mm:ss.sssZ'
  const d = new Date(value);
  if (!Number.isNaN(d.getTime())) {
    return d.toISOString().slice(0, 10);
  }
  return String(value).slice(0, 10);
};

const CampanaDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [campana, setCampana] = useState(null);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [diario, setDiario] = useState([]);
  const [diarioForm, setDiarioForm] = useState({
    id: null,
    fecha: new Date().toISOString().slice(0, 10),
    hectareas: '',
    bultos: '',
    notas: '',
  });
  const [diarioSaving, setDiarioSaving] = useState(false);
  const [remisiones, setRemisiones] = useState([]);
  const [remisionForm, setRemisionForm] = useState({
    id: null,
    fecha: new Date().toISOString().slice(0, 10),
    nombreConductor: '',
    ccConductor: '',
    vehiculoPlaca: '',
    origen: '',
    cantidad: '',
    variedad: '',
    arrocera: '',
    arroceraDe: '',
    valor: '',
    enviadoDesde: '',
    corregimiento: '',
    enviadoPor: '',
    enviadoCc: '',
    nota: '',
  });
  const [remisionSaving, setRemisionSaving] = useState(false);
  const [diarioFilter, setDiarioFilter] = useState({
    desde: '',
    hasta: '',
  });
  const [diarioFiltrado, setDiarioFiltrado] = useState([]);
  const [signatureModalOpen, setSignatureModalOpen] = useState(false);
  const [pdfRemision, setPdfRemision] = useState(null);
  const [signatureConductorImg, setSignatureConductorImg] = useState(null);
  const [signaturePropietarioImg, setSignaturePropietarioImg] = useState(null);

  const conductorCanvasRef = useRef(null);
  const propietarioCanvasRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchCampana(id);
        setCampana(data);
        setForm({
          nombre: data.nombre || '',
          fechaInicio: normalizeDateInput(data.fechaInicio),
          fechaFin: normalizeDateInput(data.fechaFin),
          hectareas: String(data.hectareas ?? ''),
          lotes: String(data.lotes ?? ''),
          inversionTotal: String(data.inversionTotal ?? ''),
          gastosOperativos: String(data.gastosOperativos ?? ''),
          ingresoTotal: String(data.ingresoTotal ?? ''),
          rendimientoHa: String(data.rendimientoHa ?? ''),
          produccionTotal: String(data.produccionTotal ?? ''),
        });

        try {
          const registros = await fetchCampanaDiario(id);
          setDiario(registros || []);
        } catch {
          setDiario([]);
        }

        try {
          const rems = await fetchRemisiones(id);
          // Normalizamos la fecha para evitar problemas con inputs type="date"
          setRemisiones((rems || []).map((r) => ({
            ...r,
            fecha: normalizeDateInput(r.fecha),
          })));
        } catch {
          setRemisiones([]);
        }
      } catch (e) {
        const fallback = mockCampanas.find((c) => String(c.id) === String(id));
        if (fallback) {
          setCampana(fallback);
          setForm({
            nombre: fallback.nombre || '',
            fechaInicio: normalizeDateInput(fallback.fechaInicio),
            fechaFin: normalizeDateInput(fallback.fechaFin),
            hectareas: String(fallback.hectareas ?? ''),
            lotes: String(fallback.lotes ?? ''),
            inversionTotal: String(fallback.inversionTotal ?? ''),
            gastosOperativos: String(fallback.gastosOperativos ?? ''),
            ingresoTotal: String(fallback.ingresoTotal ?? ''),
            rendimientoHa: String(fallback.rendimientoHa ?? ''),
            produccionTotal: String(fallback.produccionTotal ?? ''),
          });
          setDiario([]);
          setRemisiones([]);
        } else {
          setError('No se encontró la campaña');
        }
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  useEffect(() => {
    const loadFiltered = async () => {
      try {
        const data = await fetchCampanaDiario(id, diarioFilter);
        setDiarioFiltrado(data || []);
      } catch {
        setDiarioFiltrado([]);
      }
    };

    loadFiltered();
  }, [id, diarioFilter.desde, diarioFilter.hasta]);

  useEffect(() => {
    if (!signatureModalOpen) return;

    const setupCanvas = (canvas, setImage) => {
      if (!canvas) return () => {};
      const ctx = canvas.getContext('2d');
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#000000';

      let drawing = false;
      let lastX = 0;
      let lastY = 0;

      const getPos = (e) => {
        const rect = canvas.getBoundingClientRect();
        const point = e.touches && e.touches[0] ? e.touches[0] : e;
        return {
          x: point.clientX - rect.left,
          y: point.clientY - rect.top,
        };
      };

      const handleDown = (e) => {
        e.preventDefault();
        drawing = true;
        const pos = getPos(e);
        lastX = pos.x;
        lastY = pos.y;
      };

      const handleMove = (e) => {
        if (!drawing) return;
        e.preventDefault();
        const pos = getPos(e);
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        lastX = pos.x;
        lastY = pos.y;
      };

      const handleUp = () => {
        if (!drawing) return;
        drawing = false;
        try {
          const dataUrl = canvas.toDataURL('image/png');
          setImage(dataUrl);
        } catch {
          // ignore
        }
      };

      canvas.addEventListener('mousedown', handleDown);
      canvas.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleUp);
      canvas.addEventListener('touchstart', handleDown);
      canvas.addEventListener('touchmove', handleMove);
      window.addEventListener('touchend', handleUp);

      return () => {
        canvas.removeEventListener('mousedown', handleDown);
        canvas.removeEventListener('mousemove', handleMove);
        window.removeEventListener('mouseup', handleUp);
        canvas.removeEventListener('touchstart', handleDown);
        canvas.removeEventListener('touchmove', handleMove);
        window.removeEventListener('touchend', handleUp);
      };
    };

    const cleanups = [];
    if (conductorCanvasRef.current) {
      cleanups.push(setupCanvas(conductorCanvasRef.current, setSignatureConductorImg));
    }
    if (propietarioCanvasRef.current) {
      cleanups.push(setupCanvas(propietarioCanvasRef.current, setSignaturePropietarioImg));
    }

    return () => {
      cleanups.forEach((fn) => fn && fn());
    };
  }, [signatureModalOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleDiarioChange = (e) => {
    const { name, value } = e.target;
    setDiarioForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleRemisionChange = (e) => {
    const { name, value } = e.target;
    setRemisionForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleDiarioFilterChange = (e) => {
    const { name, value } = e.target;
    setDiarioFilter((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!form) return;
    setSaving(true);
    setError(null);
    try {
      const payload = {
        nombre: form.nombre,
        fechaInicio: form.fechaInicio,
        fechaFin: form.fechaFin,
        hectareas: Number(form.hectareas) || null,
        lotes: Number(form.lotes) || null,
        inversionTotal: Number(form.inversionTotal) || 0,
        gastosOperativos: Number(form.gastosOperativos) || 0,
        ingresoTotal: Number(form.ingresoTotal) || 0,
        rendimientoHa: Number(form.rendimientoHa) || null,
        produccionTotal: Number(form.produccionTotal) || null,
      };

      const updated = await actualizarCampana(id, payload);
      setCampana(updated);
      alert('Campaña actualizada');
    } catch (e) {
      setError('No se pudo guardar la campaña');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p style={{ padding: '32px' }}>Cargando campaña...</p>;
  }

  if (!campana || !form) {
    return <p style={{ padding: '32px' }}>{error || 'No se encontró la campaña'}</p>;
  }

  const inversion = Number(form.inversionTotal) || 0;
  const gastos = Number(form.gastosOperativos) || 0;
  const ingreso = Number(form.ingresoTotal) || 0;
  const margen = ingreso - inversion - gastos;

  const resetDiarioForm = () => {
    setDiarioForm({
      id: null,
      fecha: new Date().toISOString().slice(0, 10),
      hectareas: '',
      bultos: '',
      notas: '',
    });
  };

  const handleEditDiario = (entry) => {
    setDiarioForm({
      id: entry.id,
      fecha: normalizeDateInput(entry.fecha),
      hectareas: String(entry.hectareas ?? ''),
      bultos: String(entry.bultos ?? ''),
      notas: entry.notas || '',
    });
  };

  const handleDeleteDiario = async (entryId) => {
    if (typeof window !== 'undefined' && !window.confirm('¿Eliminar este registro diario?')) return;
    try {
      await eliminarCampanaDia(id, entryId);
      setDiario((prev) => prev.filter((r) => r.id !== entryId));
    } catch {
      // opcional: mostrar error
    }
  };

  const handleSubmitDiario = async () => {
    if (!diarioForm.fecha) return;
    setDiarioSaving(true);
    try {
      const payload = {
        fecha: diarioForm.fecha,
        hectareas: Number(diarioForm.hectareas) || null,
        bultos: Number(diarioForm.bultos) || null,
        notas: diarioForm.notas || null,
      };

      let saved;
      if (diarioForm.id) {
        saved = await actualizarCampanaDia(id, diarioForm.id, payload);
        setDiario((prev) => prev.map((r) => (r.id === saved.id ? saved : r)));
      } else {
        saved = await crearCampanaDia(id, payload);
        setDiario((prev) => [...prev, saved]);
      }

      resetDiarioForm();
    } catch {
      // opcional: mostrar error
    } finally {
      setDiarioSaving(false);
    }
  };

  const resetRemisionForm = () => {
    setRemisionForm({
      id: null,
      fecha: new Date().toISOString().slice(0, 10),
      nombreConductor: '',
      ccConductor: '',
      vehiculoPlaca: '',
      origen: '',
      cantidad: '',
      variedad: '',
      enviadoPor: '',
      enviadoCc: '',
      valorFlete: '',
      firmaConductor: '',
      firmaPropietario: '',
      nota: '',
    });
  };

  const handleEditRemision = (r) => {
    setRemisionForm({
      id: r.id,
      fecha: normalizeDateInput(r.fecha),
      nombreConductor: r.nombreConductor || '',
      ccConductor: r.ccConductor || '',
      vehiculoPlaca: r.vehiculoPlaca || '',
      origen: r.origen || '',
      cantidad: r.cantidad || '',
      variedad: r.variedad || '',
      enviadoPor: r.enviadoPor || '',
      enviadoCc: r.enviadoCc || '',
      valorFlete: r.valorFlete != null ? String(r.valorFlete) : '',
      firmaConductor: r.firmaConductor || '',
      firmaPropietario: r.firmaPropietario || '',
      nota: r.nota || '',
    });
  };

  const handleDeleteRemision = async (remisionId) => {
    if (typeof window !== 'undefined' && !window.confirm('¿Eliminar esta remisión?')) return;
    try {
      await eliminarRemision(id, remisionId);
      setRemisiones((prev) => prev.filter((r) => r.id !== remisionId));
    } catch {
      // opcional error
    }
  };

  const handleSubmitRemision = async () => {
    if (!remisionForm.fecha) return;
    setRemisionSaving(true);
    try {
      const payload = {
        fecha: remisionForm.fecha,
        nombreConductor: remisionForm.nombreConductor,
        ccConductor: remisionForm.ccConductor,
        vehiculoPlaca: remisionForm.vehiculoPlaca,
        origen: remisionForm.origen,
        cantidad: remisionForm.cantidad,
        variedad: remisionForm.variedad,
        enviadoPor: remisionForm.enviadoPor,
        enviadoCc: remisionForm.enviadoCc,
        valorFlete: remisionForm.valorFlete ? Number(remisionForm.valorFlete) : null,
        firmaConductor: remisionForm.firmaConductor,
        firmaPropietario: remisionForm.firmaPropietario,
        nota: remisionForm.nota,
      };

      let saved;
      if (remisionForm.id) {
        saved = await actualizarRemision(id, remisionForm.id, payload);
        setRemisiones((prev) => prev.map((r) => (r.id === saved.id ? saved : r)));
      } else {
        saved = await crearRemision(id, payload);
        setRemisiones((prev) => [saved, ...prev]);
      }

      resetRemisionForm();
    } catch {
      // opcional error
    } finally {
      setRemisionSaving(false);
    }
  };

  const openSignatureModal = (remision) => {
    setPdfRemision(remision);
    setSignatureConductorImg(null);
    setSignaturePropietarioImg(null);
    setSignatureModalOpen(true);
  };

  const clearSignature = (tipo) => {
    const canvas = tipo === 'conductor' ? conductorCanvasRef.current : propietarioCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (tipo === 'conductor') {
      setSignatureConductorImg(null);
    } else {
      setSignaturePropietarioImg(null);
    }
  };

  const handlePdfRemision = (r) => {
    const doc = new jsPDF('p', 'mm', 'a4');
    doc.setFontSize(14);
    doc.text('REMISION DE ARROZ', 105, 20, { align: 'center' });

    const startX = 20;
    let y = 30;
    const lineHeight = 8;
    const fullWidth = 170;

    const drawRow = (leftLabel, leftValue, rightLabel, rightValue) => {
      doc.setFontSize(10);
      const midX = startX + fullWidth / 2;
      doc.text(`${leftLabel} ${leftValue || ''}`, startX + 2, y + 5);
      if (rightLabel) {
        doc.text(`${rightLabel} ${rightValue || ''}`, midX + 2, y + 5);
      }
      doc.rect(startX, y, fullWidth, lineHeight);
      y += lineHeight;
    };

    drawRow('FECHA:', normalizeDateInput(r.fecha), '', '');
    drawRow('NOMBRE DEL CONDUCTOR:', r.nombreConductor, '', '');
    drawRow('C.C.:', r.ccConductor, '', '');
    drawRow('VEHICULO DE PLACA:', r.vehiculoPlaca, 'DE:', r.origen);
    drawRow('TRANSPORTA LA CANTIDAD DE:', r.cantidad, 'ARROZ. VARIEDAD:', r.variedad);
    drawRow('VALOR FLETE:', r.valorFlete != null ? `$${Number(r.valorFlete).toLocaleString()}` : '', '', '');

    // Línea de enviado por y C.C.
    const enviadoPorTexto = r.enviadoPor || r.firmaPropietario || '';
    doc.rect(startX, y, fullWidth * 0.6, lineHeight);
    doc.rect(startX + fullWidth * 0.6, y, fullWidth * 0.4, lineHeight);
    doc.text(`ENVIADO POR: ${enviadoPorTexto}`, startX + 2, y + 5);
    doc.text(`CC.: ${r.enviadoCc || ''}`, startX + fullWidth * 0.6 + 2, y + 5);
    y += lineHeight;

    // Nota (solo si viene diligenciada)
    if (r.nota) {
      doc.text(`NOTA: ${r.nota}`, startX + 2, y + 5);
      y += lineHeight;
    }

    // Firmas
    y += lineHeight * 2;
    const firmaWidth = fullWidth / 2 - 5;
    const firmaHeight = 20;

    if (signatureConductorImg) {
      doc.addImage(
        signatureConductorImg,
        'PNG',
        startX + 5,
        y - firmaHeight - 2,
        firmaWidth,
        firmaHeight,
      );
    }

    if (signaturePropietarioImg) {
      doc.addImage(
        signaturePropietarioImg,
        'PNG',
        startX + 10 + firmaWidth,
        y - firmaHeight - 2,
        firmaWidth,
        firmaHeight,
      );
    }

    doc.line(startX + 5, y, startX + 5 + firmaWidth, y);
    doc.line(startX + 10 + firmaWidth, y, startX + 10 + 2 * firmaWidth, y);
    doc.setFontSize(9);
    doc.text('FIRMA CONDUCTOR', startX + 5 + firmaWidth / 2, y + 5, { align: 'center' });
    doc.text('FIRMA PROPIETARIO', startX + 10 + 1.5 * firmaWidth, y + 5, { align: 'center' });

    const fileName = `remision_campana_${id}_#${r.id}.pdf`;
    doc.save(fileName);
  };

  const handleGeneratePdfWithSignatures = () => {
    if (!pdfRemision) return;
    handlePdfRemision(pdfRemision);
    setSignatureModalOpen(false);
    setPdfRemision(null);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc, #ecfdf5)' }}>
      <div className="am-header">
        <div className="am-header-inner">
          <div className="am-header-brand">
            <h1 className="brand-title">AgroManager</h1>
            <p className="brand-sub">Detalle de Campaña Agrícola</p>
          </div>
          <div className="am-header-user">
            <button
              className="am-pill am-header-settings"
              aria-label="Volver al panel"
              onClick={() => navigate('/admin')}
            >
              <ArrowLeft className="am-icon-lg" />
            </button>
            <button className="am-pill am-header-settings" aria-label="Configuración">
              <Settings className="am-icon-lg" />
            </button>
          </div>
        </div>
      </div>

      <div className="am-container" style={{ paddingTop: '24px', paddingBottom: '32px' }}>
        <button
          onClick={() => navigate(-1)}
          className="am-badge am-muted"
          style={{ cursor: 'pointer', marginBottom: '16px' }}
        >
          6 Volver a Campañas
        </button>

        {error && (
          <p style={{ color: '#b91c1c', marginBottom: '12px' }}>{error}</p>
        )}

        <div className="am-grid am-grid-2-md" style={{ marginBottom: '24px' }}>
          <div className="am-card am-p-6">
            <h2 className="am-card-header">Resumen de la campaña</h2>
            <div className="am-modal-body">
              <div className="am-modal-row">
                <label>Nombre de la campaña</label>
                <input name="nombre" value={form.nombre} onChange={handleChange} />
              </div>
              <div className="am-grid am-grid-form-140">
                <div className="am-modal-row">
                  <label>Fecha inicio</label>
                  <input type="date" name="fechaInicio" value={form.fechaInicio} onChange={handleChange} />
                </div>
                <div className="am-modal-row">
                  <label>Fecha fin</label>
                  <input type="date" name="fechaFin" value={form.fechaFin} onChange={handleChange} />
                </div>
              </div>
              <div className="am-grid am-grid-form-140">
                <div className="am-modal-row">
                  <label>Hectáreas</label>
                  <input name="hectareas" value={form.hectareas} onChange={handleChange} />
                </div>
                <div className="am-modal-row">
                  <label>Lotes</label>
                  <input name="lotes" value={form.lotes} onChange={handleChange} />
                </div>
              </div>
            </div>
          </div>

          <div className="am-card am-p-6">
            <h2 className="am-card-header">Finanzas de la campaña</h2>
            <div className="am-modal-body">
              <div className="am-modal-row">
                <label>Inversión total</label>
                <input name="inversionTotal" value={form.inversionTotal} onChange={handleChange} />
              </div>
              <div className="am-modal-row">
                <label>Gastos operativos</label>
                <input name="gastosOperativos" value={form.gastosOperativos} onChange={handleChange} />
              </div>
              <div className="am-modal-row">
                <label>Ingresos totales</label>
                <input name="ingresoTotal" value={form.ingresoTotal} onChange={handleChange} />
              </div>
              <div style={{ marginTop: '8px', fontSize: '14px', color: '#475569' }}>
                <p style={{ margin: 0 }}>
                  Margen estimado: <strong>${margen.toLocaleString()}</strong>
                </p>
                <p style={{ margin: '4px 0 0' }}>
                  (Ingresos - Inversión - Gastos)
                </p>
              </div>
            </div>
          </div>

          <div className="am-card am-p-6">
            <h2 className="am-card-header">Producción y rendimiento</h2>
            <div className="am-modal-body">
              <div className="am-modal-row">
                <label>Rendimiento medio (t/bultos por ha)</label>
                <input name="rendimientoHa" value={form.rendimientoHa} onChange={handleChange} />
              </div>
              <div className="am-modal-row">
                <label>Producción total (t/bultos)</label>
                <input name="produccionTotal" value={form.produccionTotal} onChange={handleChange} />
              </div>
              <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>
                Aquí puedes registrar cuántos bultos se cosecharon en total para la campaña.
              </p>
            </div>
          </div>

          <div className="am-card am-p-6">
            <h2 className="am-card-header">Parte diario de cosecha</h2>
            <div className="am-modal-body" style={{ marginBottom: '12px' }}>
              <div className="am-grid am-grid-form-140">
                <div className="am-modal-row">
                  <label>Fecha</label>
                  <input
                    type="date"
                    name="fecha"
                    value={diarioForm.fecha}
                    onChange={handleDiarioChange}
                  />
                </div>
                <div className="am-modal-row">
                  <label>Hectáreas cortadas</label>
                  <input
                    name="hectareas"
                    value={diarioForm.hectareas}
                    onChange={handleDiarioChange}
                  />
                </div>
                <div className="am-modal-row">
                  <label>Bultos del día</label>
                  <input
                    name="bultos"
                    value={diarioForm.bultos}
                    onChange={handleDiarioChange}
                  />
                </div>
                <div className="am-modal-row">
                  <label>Notas</label>
                  <input
                    name="notas"
                    value={diarioForm.notas}
                    onChange={handleDiarioChange}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button
                  type="button"
                  className="am-btn am-btn-primary"
                  onClick={handleSubmitDiario}
                  disabled={diarioSaving}
                >
                  {diarioSaving ? 'Guardando día...' : (diarioForm.id ? 'Actualizar día' : 'Agregar día')}
                </button>
              </div>
            </div>

            <div className="am-table-wrapper">
              <table className="am-table">
                <thead className="head-blue">
                  <tr>
                    <th>Fecha</th>
                    <th>Hectáreas cortadas</th>
                    <th>Bultos</th>
                    <th>Notas / Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {diario.map((r) => (
                    <tr key={r.id}>
                      <td>{normalizeDateInput(r.fecha)}</td>
                      <td>{r.hectareas ?? '-'} ha</td>
                      <td>{r.bultos ?? '-'}</td>
                      <td>
                        {r.notas || '-'}
                        <div className="am-actions" style={{ marginTop: '4px' }}>
                          <button className="primary" type="button" onClick={() => handleEditDiario(r)}>
                            Editar
                          </button>
                          <button className="danger" type="button" onClick={() => handleDeleteDiario(r.id)}>
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!diario.length && (
                    <tr>
                      <td colSpan="5" style={{ fontSize: '13px', color: '#6b7280' }}>
                        Aún no hay registros diarios. Agrega el primero con el formulario superior.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="am-card am-p-6">
            <h2 className="am-card-header">Remisiones de arroz</h2>
            <div className="am-modal-body" style={{ marginBottom: '12px' }}>
              <div className="am-grid am-grid-form-160">
                <div className="am-modal-row">
                  <label>Fecha</label>
                  <input type="date" name="fecha" value={remisionForm.fecha} onChange={handleRemisionChange} />
                </div>
                <div className="am-modal-row">
                  <label>Nombre del conductor</label>
                  <input name="nombreConductor" value={remisionForm.nombreConductor} onChange={handleRemisionChange} />
                </div>
              </div>
              <div className="am-grid am-grid-form-160">
                <div className="am-modal-row">
                  <label>C.C. conductor</label>
                  <input name="ccConductor" value={remisionForm.ccConductor} onChange={handleRemisionChange} />
                </div>
                <div className="am-modal-row">
                  <label>Vehículo de placa</label>
                  <input name="vehiculoPlaca" value={remisionForm.vehiculoPlaca} onChange={handleRemisionChange} />
                </div>
              </div>
              <div className="am-grid am-grid-form-160">
                <div className="am-modal-row">
                  <label>De (origen)</label>
                  <input name="origen" value={remisionForm.origen} onChange={handleRemisionChange} />
                </div>
                <div className="am-modal-row">
                  <label>Cantidad transportada</label>
                  <input name="cantidad" value={remisionForm.cantidad} onChange={handleRemisionChange} />
                </div>
              </div>
              <div className="am-grid am-grid-form-160">
                <div className="am-modal-row">
                  <label>Arroz variedad</label>
                  <input name="variedad" value={remisionForm.variedad} onChange={handleRemisionChange} />
                </div>
                <div className="am-modal-row">
                  <label>Valor flete</label>
                  <input name="valorFlete" value={remisionForm.valorFlete} onChange={handleRemisionChange} />
                </div>
              </div>
              <div className="am-grid am-grid-form-160">
                <div className="am-modal-row">
                  <label>Enviado por</label>
                  <input name="enviadoPor" value={remisionForm.enviadoPor} onChange={handleRemisionChange} />
                </div>
                <div className="am-modal-row">
                  <label>C.C. enviado por</label>
                  <input name="enviadoCc" value={remisionForm.enviadoCc} onChange={handleRemisionChange} />
                </div>
              </div>
              <div className="am-grid am-grid-form-160">
                <div className="am-modal-row">
                  <label>Firma conductor</label>
                  <input name="firmaConductor" value={remisionForm.firmaConductor} onChange={handleRemisionChange} />
                </div>
                <div className="am-modal-row">
                  <label>Firma propietario</label>
                  <input name="firmaPropietario" value={remisionForm.firmaPropietario} onChange={handleRemisionChange} />
                </div>
              </div>
              <div className="am-modal-row">
                <label>Nota</label>
                <input name="nota" value={remisionForm.nota} onChange={handleRemisionChange} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button
                  type="button"
                  className="am-btn am-btn-primary"
                  onClick={handleSubmitRemision}
                  disabled={remisionSaving}
                >
                  {remisionSaving ? 'Guardando remisión...' : (remisionForm.id ? 'Actualizar remisión' : 'Agregar remisión')}
                </button>
              </div>
            </div>

            <div className="am-table-wrapper">
              <table className="am-table">
                <thead className="head-amber">
                  <tr>
                    <th>Fecha</th>
                    <th>Conductor</th>
                    <th>Cantidad</th>
                    <th>Variedad</th>
                    <th>Valor flete</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {remisiones.map((r) => (
                    <tr key={r.id}>
                      <td>{normalizeDateInput(r.fecha)}</td>
                      <td>{r.nombreConductor}</td>
                      <td>{r.cantidad}</td>
                      <td>{r.variedad}</td>
                      <td>{r.valorFlete != null ? `$${Number(r.valorFlete).toLocaleString()}` : '-'}</td>
                      <td className="am-actions">
                        <button className="primary" type="button" onClick={() => handleEditRemision(r)}>
                          Editar
                        </button>
                        <button className="danger" type="button" onClick={() => handleDeleteRemision(r.id)}>
                          Eliminar
                        </button>
                        <button className="success" type="button" onClick={() => openSignatureModal(r)}>
                          PDF
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!remisiones.length && (
                    <tr>
                      <td colSpan="7" style={{ fontSize: '13px', color: '#6b7280' }}>
                        Aún no hay remisiones registradas para esta campaña.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="am-card am-p-6">
            <h2 className="am-card-header">Información diario de cosecha</h2>
            <div className="am-modal-body" style={{ marginBottom: '12px' }}>
              <div className="am-grid am-grid-form-160">
                <div className="am-modal-row">
                  <label>Desde</label>
                  <input
                    type="date"
                    name="desde"
                    value={diarioFilter.desde}
                    onChange={handleDiarioFilterChange}
                  />
                </div>
                <div className="am-modal-row">
                  <label>Hasta</label>
                  <input
                    type="date"
                    name="hasta"
                    value={diarioFilter.hasta}
                    onChange={handleDiarioFilterChange}
                  />
                </div>
              </div>
              <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>
                Filtra los cortes diarios por rango de fechas para revisar rápidamente el avance de la cosecha.
              </p>
            </div>

            <div className="am-table-wrapper">
              <table className="am-table">
                <thead className="head-blue">
                  <tr>
                    <th>Fecha</th>
                    <th>Hectáreas cortadas</th>
                    <th>Bultos</th>
                    <th>Notas</th>
                  </tr>
                </thead>
                <tbody>
                  {diarioFiltrado.map((r) => (
                    <tr key={r.id}>
                      <td>{normalizeDateInput(r.fecha)}</td>
                      <td>{r.hectareas ?? '-'} ha</td>
                      <td>{r.bultos ?? '-'}</td>
                      <td>{r.notas || '-'}</td>
                    </tr>
                  ))}
                  {!diarioFiltrado.length && (
                    <tr>
                      <td colSpan="4" style={{ fontSize: '13px', color: '#6b7280' }}>
                        No hay registros que coincidan con el filtro seleccionado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {signatureModalOpen && (
          <div className="am-modal-backdrop">
            <div className="am-modal" style={{ maxWidth: '620px' }}>
              <h3 className="am-modal-title">Firmar remisión {pdfRemision ? `#${pdfRemision.id}` : ''}</h3>
              <div className="am-modal-body">
                <div className="am-modal-row">
                  <label>Firma conductor</label>
                  <canvas
                    ref={conductorCanvasRef}
                    width={260}
                    height={100}
                    style={{ border: '1px solid #e2e8f0', borderRadius: '10px', background: '#ffffff' }}
                  />
                  <button
                    type="button"
                    className="am-btn am-btn-ghost"
                    onClick={() => clearSignature('conductor')}
                    style={{ marginTop: '6px' }}
                  >
                    Borrar firma conductor
                  </button>
                </div>
                <div className="am-modal-row">
                  <label>Firma propietario</label>
                  <canvas
                    ref={propietarioCanvasRef}
                    width={260}
                    height={100}
                    style={{ border: '1px solid #e2e8f0', borderRadius: '10px', background: '#ffffff' }}
                  />
                  <button
                    type="button"
                    className="am-btn am-btn-ghost"
                    onClick={() => clearSignature('propietario')}
                    style={{ marginTop: '6px' }}
                  >
                    Borrar firma propietario
                  </button>
                </div>
              </div>
              <div className="am-modal-actions">
                <button
                  type="button"
                  className="am-btn am-btn-ghost"
                  onClick={() => setSignatureModalOpen(false)}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="am-btn am-btn-primary"
                  onClick={handleGeneratePdfWithSignatures}
                  disabled={!signatureConductorImg && !signaturePropietarioImg}
                >
                  Generar PDF
                </button>
              </div>
            </div>
          </div>
        )}

        <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <button
            className="am-btn am-btn-ghost"
            type="button"
            onClick={() => navigate('/admin')}
          >
            Cancelar
          </button>
          <button
            className="am-btn am-btn-primary"
            type="button"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CampanaDetail;
