import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings } from 'lucide-react';
import Navigation from '../components/sections/Navigation.jsx';
import DashboardOverview from '../components/sections/DashboardOverview.jsx';
import TrabajadoresTable from '../components/sections/TrabajadoresTable.jsx';
import FinanzasView from '../components/sections/FinanzasView.jsx';
import MaquinariaGrid from '../components/sections/MaquinariaGrid.jsx';
import ParcelasGrid from '../components/sections/ParcelasGrid.jsx';
import SemillasTable from '../components/sections/SemillasTable.jsx';
import PlagasGrid from '../components/sections/PlagasGrid.jsx';
import RiegoTable from '../components/sections/RiegoTable.jsx';
import FertilizantesTable from '../components/sections/FertilizantesTable.jsx';
import ReportesGrid from '../components/sections/ReportesGrid.jsx';
import CampanasTable from '../components/sections/CampanasTable.jsx';

import {
  stats as initialStats,
  parcelas as initialParcelas,
  fertilizantes as initialFertilizantes,
  campanas as initialCampanas,
  calcularLiquidacion,
} from '../services/mockData.js';
import { fetchParcelas, crearParcela, actualizarParcela, eliminarParcela, fetchTrabajadores, crearTrabajador, actualizarTrabajador, eliminarTrabajador, fetchFinanzas, crearIngreso, crearEgreso, fetchMaquinaria, crearMaquinaria, actualizarMaquinaria, eliminarMaquinaria, fetchSemillas, crearSemilla, actualizarSemilla, eliminarSemilla, fetchPlagas, crearPlaga, actualizarPlaga, eliminarPlaga, fetchRiego, crearRiego, actualizarRiego, eliminarRiego, fetchCampanas, crearCampana, actualizarCampana, eliminarCampana } from '../services/api.js';

const CropManagementDashboard = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const navigate = useNavigate();

  const storedUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
  const currentUser = storedUser ? JSON.parse(storedUser) : null;

  const [stats] = useState(initialStats);
  const [trabajadores, setTrabajadores] = useState([]);
  const [ingresos, setIngresos] = useState([]);
  const [egresos, setEgresos] = useState([]);
  const [maquinaria, setMaquinaria] = useState([]);
  const [parcelas, setParcelas] = useState(initialParcelas);
  const [campanas, setCampanas] = useState(initialCampanas);
  const [semillas, setSemillas] = useState([]);
  const [plagas, setPlagas] = useState([]);
  const [riego, setRiego] = useState([]);
  const [fertilizantes, setFertilizantes] = useState(initialFertilizantes);

  // Modales: parcelas
  const [parcelaModalOpen, setParcelaModalOpen] = useState(false);
  const [parcelaEditing, setParcelaEditing] = useState(null);
  const [parcelaDetalleOpen, setParcelaDetalleOpen] = useState(false);
  const [parcelaDetalle, setParcelaDetalle] = useState(null);
  const [parcelaForm, setParcelaForm] = useState({
    nombre: '',
    hectareas: '',
    cultivo: '',
    estado: 'En preparación',
    inversion: '',
  });
  const [deleteParcelaId, setDeleteParcelaId] = useState(null);

  // Modales: trabajadores
  const [trabajadorModalOpen, setTrabajadorModalOpen] = useState(false);
  const [trabajadorEditing, setTrabajadorEditing] = useState(null);
  const [trabajadorForm, setTrabajadorForm] = useState({
    nombre: '',
    cargo: '',
    salario: '',
    horasTrabajadas: '',
    estado: 'Activo',
  });

  const [deleteTrabajadorId, setDeleteTrabajadorId] = useState(null);

  // Modales: finanzas
  const [ingresoModalOpen, setIngresoModalOpen] = useState(false);
  const [egresoModalOpen, setEgresoModalOpen] = useState(false);
  const [ingresoForm, setIngresoForm] = useState({
    concepto: '',
    monto: '',
    fecha: new Date().toISOString().slice(0, 10),
    tipo: 'Venta',
  });
  const [egresoForm, setEgresoForm] = useState({
    concepto: '',
    monto: '',
    fecha: new Date().toISOString().slice(0, 10),
    tipo: 'Insumos',
    categoria: '',
  });

  // Modales: maquinaria
  const [maquinariaModalOpen, setMaquinariaModalOpen] = useState(false);
  const [maquinariaEditing, setMaquinariaEditing] = useState(null);
  const [maquinariaForm, setMaquinariaForm] = useState({
    nombre: '',
    tipo: '',
    estado: 'Operativo',
    ultimoMantenimiento: '',
    proximoMantenimiento: '',
  });
  const [deleteMaquinariaId, setDeleteMaquinariaId] = useState(null);

  // Modales: semillas
  const [semillaModalOpen, setSemillaModalOpen] = useState(false);
  const [semillaEditing, setSemillaEditing] = useState(null);
  const [semillaForm, setSemillaForm] = useState({
    tipo: '',
    cantidad: '',
    proveedor: '',
    costo: '',
  });
  const [deleteSemillaId, setDeleteSemillaId] = useState(null);

  // Modales: plagas
  const [plagaModalOpen, setPlagaModalOpen] = useState(false);
  const [plagaEditing, setPlagaEditing] = useState(null);
  const [plagaForm, setPlagaForm] = useState({
    cultivo: '',
    tipo: '',
    severidad: 'Bajo',
    tratamiento: '',
    fechaDetec: new Date().toISOString().slice(0, 10),
  });
  const [deletePlagaId, setDeletePlagaId] = useState(null);

  // Modales: riego
  const [riegoModalOpen, setRiegoModalOpen] = useState(false);
  const [riegoEditing, setRiegoEditing] = useState(null);
  const [riegoForm, setRiegoForm] = useState({
    tipo: '',
    consumoAgua: '',
    ultimoRiego: new Date().toISOString().slice(0, 10),
    proximoRiego: new Date().toISOString().slice(0, 10),
  });
  const [deleteRiegoId, setDeleteRiegoId] = useState(null);

  // Modales: fertilizantes
  const [fertilizanteModalOpen, setFertilizanteModalOpen] = useState(false);
  const [fertilizanteEditing, setFertilizanteEditing] = useState(null);
  const [fertilizanteForm, setFertilizanteForm] = useState({
    parcela: '',
    fertilizante: '',
    dosis: '',
    fecha: new Date().toISOString().slice(0, 10),
    estado: 'Aplicado',
  });
  const [deleteFertilizanteId, setDeleteFertilizanteId] = useState(null);

  // Modales: campanas
  const [campanaModalOpen, setCampanaModalOpen] = useState(false);
  const [campanaEditing, setCampanaEditing] = useState(null);
  const [campanaForm, setCampanaForm] = useState({
    nombre: '',
    fechaInicio: new Date().toISOString().slice(0, 10),
    fechaFin: new Date().toISOString().slice(0, 10),
    hectareas: '',
    lotes: '',
    inversionTotal: '',
    gastosOperativos: '',
    ingresoTotal: '',
    rendimientoHa: '',
    produccionTotal: '',
  });
  const [deleteCampanaId, setDeleteCampanaId] = useState(null);

  useEffect(() => {
    fetchTrabajadores()
      .then(setTrabajadores)
      .catch(() => setTrabajadores([]));
    fetchParcelas()
      .then(setParcelas)
      .catch(() => setParcelas(initialParcelas));
    fetchFinanzas()
      .then((data) => {
        setIngresos(data.ingresos || []);
        setEgresos(data.egresos || []);
      })
      .catch(() => {
        setIngresos([]);
        setEgresos([]);
      });
    fetchMaquinaria()
      .then(setMaquinaria)
      .catch(() => setMaquinaria([]));
    fetchCampanas()
      .then(setCampanas)
      .catch(() => setCampanas(initialCampanas));
    fetchSemillas()
      .then(setSemillas)
      .catch(() => setSemillas([]));
    fetchPlagas()
      .then(setPlagas)
      .catch(() => setPlagas([]));
    fetchRiego()
      .then(setRiego)
      .catch(() => setRiego([]));
  }, []);

  const handleAddTrabajador = async () => {
    setTrabajadorEditing(null);
    setTrabajadorForm({ nombre: '', cargo: '', salario: '', horasTrabajadas: '', estado: 'Activo' });
    setTrabajadorModalOpen(true);
  };

  const handleEditTrabajador = async (trabajador) => {
    setTrabajadorEditing(trabajador);
    setTrabajadorForm({
      nombre: trabajador.nombre || '',
      cargo: trabajador.cargo || '',
      salario: String(trabajador.salario ?? ''),
      horasTrabajadas: String(trabajador.horasTrabajadas ?? ''),
      estado: trabajador.estado || 'Activo',
    });
    setTrabajadorModalOpen(true);
  };

  const handleDeleteTrabajador = async (id) => {
    setDeleteTrabajadorId(id);
  };

  const handleAddIngreso = async () => {
    setIngresoForm({ concepto: '', monto: '', fecha: new Date().toISOString().slice(0, 10), tipo: 'Venta' });
    setIngresoModalOpen(true);
  };

  const handleAddEgreso = async () => {
    setEgresoForm({ concepto: '', monto: '', fecha: new Date().toISOString().slice(0, 10), tipo: 'Insumos', categoria: '' });
    setEgresoModalOpen(true);
  };

  const submitTrabajador = async () => {
    const salario = Number(trabajadorForm.salario) || 0;
    const horasTrabajadas = Number(trabajadorForm.horasTrabajadas) || 0;
    const payload = {
      nombre: trabajadorForm.nombre,
      cargo: trabajadorForm.cargo,
      salario,
      horasTrabajadas,
      estado: trabajadorForm.estado || 'Activo',
    };

    if (trabajadorEditing) {
      const updated = await actualizarTrabajador(trabajadorEditing.id, payload);
      setTrabajadores((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    } else {
      const created = await crearTrabajador(payload);
      setTrabajadores((prev) => [created, ...prev]);
    }

    setTrabajadorModalOpen(false);
    setTrabajadorEditing(null);
  };

  const confirmDeleteTrabajador = async () => {
    if (!deleteTrabajadorId) return;
    await eliminarTrabajador(deleteTrabajadorId);
    setTrabajadores((prev) => prev.filter((t) => t.id !== deleteTrabajadorId));
    setDeleteTrabajadorId(null);
  };

  const submitIngreso = async () => {
    const monto = Number(ingresoForm.monto) || 0;
    const payload = {
      concepto: ingresoForm.concepto,
      monto,
      fecha: ingresoForm.fecha,
      tipo: ingresoForm.tipo,
    };
    const created = await crearIngreso(payload);
    setIngresos((prev) => [created, ...prev]);
    setIngresoModalOpen(false);
  };

  const submitEgreso = async () => {
    const monto = Number(egresoForm.monto) || 0;
    const payload = {
      concepto: egresoForm.concepto,
      monto,
      fecha: egresoForm.fecha,
      tipo: egresoForm.tipo,
      categoria: egresoForm.categoria,
    };
    const created = await crearEgreso(payload);
    setEgresos((prev) => [created, ...prev]);
    setEgresoModalOpen(false);
  };

  const handleAddMaquinaria = () => {
    setMaquinariaEditing(null);
    setMaquinariaForm({ nombre: '', tipo: '', estado: 'Operativo', ultimoMantenimiento: '', proximoMantenimiento: '' });
    setMaquinariaModalOpen(true);
  };

  const handleAddParcela = () => {
    setParcelaEditing(null);
    setParcelaForm({
      nombre: '',
      hectareas: '',
      cultivo: '',
      estado: 'En preparación',
      inversion: '',
    });
    setParcelaModalOpen(true);
  };

  const handleViewParcela = (parcela) => {
    setParcelaDetalle(parcela);
    setParcelaDetalleOpen(true);
  };

  const handleEditParcela = (parcela) => {
    setParcelaEditing(parcela);
    setParcelaForm({
      nombre: parcela.nombre || '',
      hectareas: String(parcela.hectareas ?? ''),
      cultivo: parcela.cultivo || '',
      estado: parcela.estado || 'En preparación',
      inversion: String(parcela.inversion ?? ''),
    });
    setParcelaModalOpen(true);
  };

  const handleDeleteParcela = (id) => {
    setDeleteParcelaId(id);
  };

  const submitParcela = async () => {
    const payload = {
      nombre: parcelaForm.nombre,
      hectareas: Number(parcelaForm.hectareas) || 0,
      cultivo: parcelaForm.cultivo,
      estado: parcelaForm.estado || 'En preparación',
      inversion: Number(parcelaForm.inversion) || 0,
    };

    if (parcelaEditing) {
      const updated = await actualizarParcela(parcelaEditing.id, payload);
      setParcelas((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    } else {
      const created = await crearParcela(payload);
      setParcelas((prev) => [created, ...prev]);
    }

    setParcelaModalOpen(false);
    setParcelaEditing(null);
  };

  const confirmDeleteParcela = async () => {
    if (!deleteParcelaId) return;
    await eliminarParcela(deleteParcelaId);
    setParcelas((prev) => prev.filter((p) => p.id !== deleteParcelaId));
    setDeleteParcelaId(null);
  };

  const handleEditMaquinaria = (item) => {
    setMaquinariaEditing(item);
    setMaquinariaForm({
      nombre: item.nombre || '',
      tipo: item.tipo || '',
      estado: item.estado || 'Operativo',
      ultimoMantenimiento: item.ultimoMantenimiento || '',
      proximoMantenimiento: item.proximoMantenimiento || '',
    });
    setMaquinariaModalOpen(true);
  };

  const handleDeleteMaquinaria = (id) => {
    setDeleteMaquinariaId(id);
  };

  const submitMaquinaria = async () => {
    const payload = { ...maquinariaForm };
    if (maquinariaEditing) {
      const updated = await actualizarMaquinaria(maquinariaEditing.id, payload);
      setMaquinaria((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
    } else {
      const created = await crearMaquinaria(payload);
      setMaquinaria((prev) => [created, ...prev]);
    }
    setMaquinariaModalOpen(false);
    setMaquinariaEditing(null);
  };

  const confirmDeleteMaquinaria = async () => {
    if (!deleteMaquinariaId) return;
    await eliminarMaquinaria(deleteMaquinariaId);
    setMaquinaria((prev) => prev.filter((m) => m.id !== deleteMaquinariaId));
    setDeleteMaquinariaId(null);
  };

  const handleAddSemilla = () => {
    setSemillaEditing(null);
    setSemillaForm({ tipo: '', cantidad: '', proveedor: '', costo: '' });
    setSemillaModalOpen(true);
  };

  const handleEditSemilla = (item) => {
    setSemillaEditing(item);
    setSemillaForm({
      tipo: item.tipo || '',
      cantidad: String(item.cantidad ?? ''),
      proveedor: item.proveedor || '',
      costo: String(item.costo ?? ''),
    });
    setSemillaModalOpen(true);
  };

  const handleDeleteSemilla = (id) => {
    setDeleteSemillaId(id);
  };

  const submitSemilla = async () => {
    const payload = {
      tipo: semillaForm.tipo,
      cantidad: Number(semillaForm.cantidad) || 0,
      proveedor: semillaForm.proveedor,
      costo: Number(semillaForm.costo) || 0,
    };

    if (semillaEditing) {
      const updated = await actualizarSemilla(semillaEditing.id, payload);
      setSemillas((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    } else {
      const created = await crearSemilla(payload);
      setSemillas((prev) => [created, ...prev]);
    }

    setSemillaModalOpen(false);
    setSemillaEditing(null);
  };

  const confirmDeleteSemilla = async () => {
    if (!deleteSemillaId) return;
    await eliminarSemilla(deleteSemillaId);
    setSemillas((prev) => prev.filter((s) => s.id !== deleteSemillaId));
    setDeleteSemillaId(null);
  };

  const handleAddPlaga = () => {
    setPlagaEditing(null);
    setPlagaForm({
      cultivo: '',
      tipo: '',
      severidad: 'Bajo',
      tratamiento: '',
      fechaDetec: new Date().toISOString().slice(0, 10),
    });
    setPlagaModalOpen(true);
  };

  const handleEditPlaga = (item) => {
    setPlagaEditing(item);
    setPlagaForm({
      cultivo: item.cultivo || '',
      tipo: item.tipo || '',
      severidad: item.severidad || 'Bajo',
      tratamiento: item.tratamiento || '',
      fechaDetec: item.fechaDetec || new Date().toISOString().slice(0, 10),
    });
    setPlagaModalOpen(true);
  };

  const handleDeletePlaga = (id) => {
    setDeletePlagaId(id);
  };

  const submitPlaga = async () => {
    const payload = { ...plagaForm };

    if (plagaEditing) {
      const updated = await actualizarPlaga(plagaEditing.id, payload);
      setPlagas((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    } else {
      const created = await crearPlaga(payload);
      setPlagas((prev) => [created, ...prev]);
    }

    setPlagaModalOpen(false);
    setPlagaEditing(null);
  };

  const confirmDeletePlaga = async () => {
    if (!deletePlagaId) return;
    await eliminarPlaga(deletePlagaId);
    setPlagas((prev) => prev.filter((p) => p.id !== deletePlagaId));
    setDeletePlagaId(null);
  };

  const handleAddRiego = () => {
    setRiegoEditing(null);
    setRiegoForm({
      tipo: '',
      consumoAgua: '',
      ultimoRiego: new Date().toISOString().slice(0, 10),
      proximoRiego: new Date().toISOString().slice(0, 10),
    });
    setRiegoModalOpen(true);
  };

  const handleEditRiego = (item) => {
    setRiegoEditing(item);
    setRiegoForm({
      tipo: item.tipo || '',
      consumoAgua: item.consumoAgua || '',
      ultimoRiego: item.ultimoRiego || new Date().toISOString().slice(0, 10),
      proximoRiego: item.proximoRiego || new Date().toISOString().slice(0, 10),
    });
    setRiegoModalOpen(true);
  };

  const handleDeleteRiego = (id) => {
    setDeleteRiegoId(id);
  };

  const submitRiego = async () => {
    const payload = {
      tipo: riegoForm.tipo,
      consumoAgua: riegoForm.consumoAgua,
      ultimoRiego: riegoForm.ultimoRiego || null,
      proximoRiego: riegoForm.proximoRiego || null,
    };

    if (riegoEditing) {
      const updated = await actualizarRiego(riegoEditing.id, payload);
      setRiego((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    } else {
      const created = await crearRiego(payload);
      setRiego((prev) => [created, ...prev]);
    }

    setRiegoModalOpen(false);
    setRiegoEditing(null);
  };

  const confirmDeleteRiego = async () => {
    if (!deleteRiegoId) return;
    await eliminarRiego(deleteRiegoId);
    setRiego((prev) => prev.filter((r) => r.id !== deleteRiegoId));
    setDeleteRiegoId(null);
  };

  const handleAddFertilizante = () => {
    setFertilizanteEditing(null);
    setFertilizanteForm({
      parcela: '',
      fertilizante: '',
      dosis: '',
      fecha: new Date().toISOString().slice(0, 10),
      estado: 'Aplicado',
    });
    setFertilizanteModalOpen(true);
  };

  const handleEditFertilizante = (item) => {
    setFertilizanteEditing(item);
    setFertilizanteForm({
      parcela: item.parcela || '',
      fertilizante: item.fertilizante || item.nombre || '',
      dosis: item.dosis || item.cantidad || '',
      fecha: item.fecha || item.fechaAplicacion || new Date().toISOString().slice(0, 10),
      estado: item.estado || 'Aplicado',
    });
    setFertilizanteModalOpen(true);
  };

  const handleDeleteFertilizante = (id) => {
    setDeleteFertilizanteId(id);
  };

  const submitFertilizante = async () => {
    const payload = {
      parcela: fertilizanteForm.parcela,
      fertilizante: fertilizanteForm.fertilizante,
      dosis: fertilizanteForm.dosis,
      fecha: fertilizanteForm.fecha,
      estado: fertilizanteForm.estado || 'Aplicado',
    };

    if (fertilizanteEditing) {
      setFertilizantes((prev) => prev.map((f) => (f.id === fertilizanteEditing.id ? { ...f, ...payload } : f)));
    } else {
      const nuevo = { id: Date.now(), ...payload };
      setFertilizantes((prev) => [nuevo, ...prev]);
    }

    setFertilizanteModalOpen(false);
    setFertilizanteEditing(null);
  };

  const confirmDeleteFertilizante = () => {
    if (!deleteFertilizanteId) return;
    setFertilizantes((prev) => prev.filter((f) => f.id !== deleteFertilizanteId));
    setDeleteFertilizanteId(null);
  };

  const handleAddCampana = () => {
    setCampanaEditing(null);
    setCampanaForm({
      nombre: '',
      fechaInicio: new Date().toISOString().slice(0, 10),
      fechaFin: new Date().toISOString().slice(0, 10),
      hectareas: '',
      lotes: '',
      inversionTotal: '',
      gastosOperativos: '',
      ingresoTotal: '',
      rendimientoHa: '',
      produccionTotal: '',
    });
    setCampanaModalOpen(true);
  };

  const handleEditCampana = (c) => {
    navigate(`/admin/campanas/${c.id}`);
  };

  const handleDeleteCampana = async (id) => {
    if (typeof window !== 'undefined' && !window.confirm('¿Eliminar esta campaña?')) return;
    await eliminarCampana(id);
    setCampanas((prev) => prev.filter((c) => c.id !== id));
  };

  const submitCampana = async () => {
    const payload = {
      nombre: campanaForm.nombre,
      fechaInicio: campanaForm.fechaInicio,
      fechaFin: campanaForm.fechaFin,
      hectareas: Number(campanaForm.hectareas) || null,
      lotes: Number(campanaForm.lotes) || null,
      inversionTotal: Number(campanaForm.inversionTotal) || 0,
      gastosOperativos: Number(campanaForm.gastosOperativos) || 0,
      ingresoTotal: Number(campanaForm.ingresoTotal) || 0,
      rendimientoHa: Number(campanaForm.rendimientoHa) || null,
      produccionTotal: Number(campanaForm.produccionTotal) || null,
    };

    if (campanaEditing) {
      const updated = await actualizarCampana(campanaEditing.id, payload);
      setCampanas((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    } else {
      const created = await crearCampana(payload);
      setCampanas((prev) => [created, ...prev]);
    }

    setCampanaModalOpen(false);
    setCampanaEditing(null);
  };

  const confirmDeleteCampana = async () => {
    if (!deleteCampanaId) return;
    await eliminarCampana(deleteCampanaId);
    setCampanas((prev) => prev.filter((c) => c.id !== deleteCampanaId));
    setDeleteCampanaId(null);
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardOverview stats={stats} ingresos={ingresos} egresos={egresos} />;
      case 'trabajadores':
        return (
          <TrabajadoresTable
            trabajadores={trabajadores}
            calcularLiquidacion={calcularLiquidacion}
            onAdd={handleAddTrabajador}
            onEdit={handleEditTrabajador}
            onDelete={handleDeleteTrabajador}
          />
        );
      case 'finanzas':
        return (
          <FinanzasView
            ingresos={ingresos}
            egresos={egresos}
            onAddIngreso={handleAddIngreso}
            onAddEgreso={handleAddEgreso}
          />
        );
      case 'maquinaria':
        return (
          <MaquinariaGrid
            maquinaria={maquinaria}
            onAdd={handleAddMaquinaria}
            onEdit={handleEditMaquinaria}
            onDelete={handleDeleteMaquinaria}
          />
        );
      case 'campanas':
        return (
          <CampanasTable
            campanas={campanas}
            onAdd={handleAddCampana}
            onEdit={handleEditCampana}
            onDelete={handleDeleteCampana}
          />
        );
      case 'parcelas':
        return (
          <ParcelasGrid
            parcelas={parcelas}
            onAdd={handleAddParcela}
            onEdit={handleEditParcela}
            onView={handleViewParcela}
          />
        );
      case 'semillas':
        return (
          <SemillasTable
            semillas={semillas}
            onAdd={handleAddSemilla}
            onEdit={handleEditSemilla}
            onDelete={handleDeleteSemilla}
          />
        );
      case 'plagas':
        return (
          <PlagasGrid
            plagas={plagas}
            onAdd={handleAddPlaga}
            onEdit={handleEditPlaga}
            onDelete={handleDeletePlaga}
          />
        );
      case 'riego':
        return (
          <RiegoTable
            riego={riego}
            onAdd={handleAddRiego}
            onEdit={handleEditRiego}
            onDelete={handleDeleteRiego}
          />
        );
      case 'fertilizantes':
        return (
          <FertilizantesTable
            fertilizantes={fertilizantes}
            onAdd={handleAddFertilizante}
            onEdit={handleEditFertilizante}
            onDelete={handleDeleteFertilizante}
          />
        );
      case 'reportes':
        return <ReportesGrid />;
      default:
        return null;
    }
  };

  return (
    <div style={{minHeight:'100vh',background:'linear-gradient(135deg, #f8fafc, #ecfdf5)'}}>
      <div className="am-header">
        <div className="am-header-inner">
          <div className="am-header-brand">
            <h1 className="brand-title">AgroManager</h1>
            <p className="brand-sub">Sistema Integral de Gestión Agrícola</p>
          </div>
          <div className="am-header-user">
            <div className="am-header-user-info">
              <p className="am-header-user-label">Usuario</p>
              <p className="am-header-user-name">{currentUser?.nombre || 'Usuario'}</p>
            </div>
            <button className="am-pill am-header-settings" aria-label="Configuración">
              <Settings className="am-icon-lg" />
            </button>
          </div>
        </div>
      </div>

      <div className="am-container">
        <Navigation activeSection={activeSection} setActiveSection={setActiveSection} />
        <div className="am-card am-main-card">
          {renderContent()}
        </div>
      </div>

      {parcelaDetalleOpen && parcelaDetalle && (
        <div className="am-modal-backdrop">
          <div className="am-modal">
            <h3 className="am-modal-title">Detalles de la parcela</h3>
            <div className="am-modal-body">
              <div className="am-modal-row">
                <label>Nombre</label>
                <p>{parcelaDetalle.nombre}</p>
              </div>
              <div className="am-modal-row">
                <label>Hectáreas</label>
                <p>{parcelaDetalle.hectareas ?? 0} ha</p>
              </div>
              <div className="am-modal-row">
                <label>Cultivo actual</label>
                <p>{parcelaDetalle.cultivo || 'Sin definir'}</p>
              </div>
              <div className="am-modal-row">
                <label>Estado</label>
                <p>{parcelaDetalle.estado || 'En preparación'}</p>
              </div>
              <div className="am-modal-row">
                <label>Inversión</label>
                <p>${'{'}Number(parcelaDetalle.inversion || 0).toLocaleString(){'}'}</p>
              </div>
            </div>
            <div className="am-modal-actions">
              <button
                type="button"
                className="am-btn am-btn-primary"
                onClick={() => {
                  setParcelaDetalleOpen(false);
                  setParcelaDetalle(null);
                }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {fertilizanteModalOpen && (
        <div className="am-modal-backdrop">
          <div className="am-modal">
            <h3 className="am-modal-title">{fertilizanteEditing ? 'Editar aplicación de fertilizante' : 'Nueva aplicación de fertilizante'}</h3>
            <div className="am-modal-body">
              <div className="am-modal-row">
                <label>Parcela</label>
                <input
                  value={fertilizanteForm.parcela}
                  onChange={(e) => setFertilizanteForm({ ...fertilizanteForm, parcela: e.target.value })}
                />
              </div>
              <div className="am-modal-row">
                <label>Fertilizante</label>
                <input
                  value={fertilizanteForm.fertilizante}
                  onChange={(e) => setFertilizanteForm({ ...fertilizanteForm, fertilizante: e.target.value })}
                />
              </div>
              <div className="am-modal-row">
                <label>Dosis</label>
                <input
                  value={fertilizanteForm.dosis}
                  onChange={(e) => setFertilizanteForm({ ...fertilizanteForm, dosis: e.target.value })}
                  placeholder="Ej: 2000 kg, 150 L/ha"
                />
              </div>
              <div className="am-modal-row">
                <label>Fecha de aplicación</label>
                <input
                  type="date"
                  value={fertilizanteForm.fecha}
                  onChange={(e) => setFertilizanteForm({ ...fertilizanteForm, fecha: e.target.value })}
                />
              </div>
              <div className="am-modal-row">
                <label>Estado</label>
                <select
                  value={fertilizanteForm.estado}
                  onChange={(e) => setFertilizanteForm({ ...fertilizanteForm, estado: e.target.value })}
                >
                  <option value="Aplicado">Aplicado</option>
                  <option value="Programado">Programado</option>
                  <option value="Cancelado">Cancelado</option>
                </select>
              </div>
            </div>
            <div className="am-modal-actions">
              <button
                type="button"
                className="am-btn am-btn-ghost"
                onClick={() => {
                  setFertilizanteModalOpen(false);
                  setFertilizanteEditing(null);
                }}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="am-btn am-btn-primary"
                onClick={submitFertilizante}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {campanaModalOpen && (
        <div className="am-modal-backdrop">
          <div className="am-modal">
            <h3 className="am-modal-title">{campanaEditing ? 'Editar campaña' : 'Nueva campaña'}</h3>
            <div className="am-modal-body">
              <div className="am-modal-row">
                <label>Nombre de la campaña</label>
                <input
                  value={campanaForm.nombre}
                  onChange={(e) => setCampanaForm({ ...campanaForm, nombre: e.target.value })}
                />
              </div>
              <div className="am-modal-row">
                <label>Fecha de inicio</label>
                <input
                  type="date"
                  value={campanaForm.fechaInicio}
                  onChange={(e) => setCampanaForm({ ...campanaForm, fechaInicio: e.target.value })}
                />
              </div>
              <div className="am-modal-row">
                <label>Fecha de fin</label>
                <input
                  type="date"
                  value={campanaForm.fechaFin}
                  onChange={(e) => setCampanaForm({ ...campanaForm, fechaFin: e.target.value })}
                />
              </div>
              <div className="am-modal-row">
                <label>Hectáreas</label>
                <input
                  type="number"
                  value={campanaForm.hectareas}
                  onChange={(e) => setCampanaForm({ ...campanaForm, hectareas: e.target.value })}
                />
              </div>
              <div className="am-modal-row">
                <label>Lotes</label>
                <input
                  type="number"
                  value={campanaForm.lotes}
                  onChange={(e) => setCampanaForm({ ...campanaForm, lotes: e.target.value })}
                />
              </div>
              <div className="am-modal-row">
                <label>Inversión total</label>
                <input
                  type="number"
                  value={campanaForm.inversionTotal}
                  onChange={(e) => setCampanaForm({ ...campanaForm, inversionTotal: e.target.value })}
                />
              </div>
              <div className="am-modal-row">
                <label>Gastos operativos</label>
                <input
                  type="number"
                  value={campanaForm.gastosOperativos}
                  onChange={(e) => setCampanaForm({ ...campanaForm, gastosOperativos: e.target.value })}
                />
              </div>
              <div className="am-modal-row">
                <label>Ingreso total</label>
                <input
                  type="number"
                  value={campanaForm.ingresoTotal}
                  onChange={(e) => setCampanaForm({ ...campanaForm, ingresoTotal: e.target.value })}
                />
              </div>
              <div className="am-modal-row">
                <label>Rendimiento por ha</label>
                <input
                  type="number"
                  value={campanaForm.rendimientoHa}
                  onChange={(e) => setCampanaForm({ ...campanaForm, rendimientoHa: e.target.value })}
                  placeholder="t/ha"
                />
              </div>
              <div className="am-modal-row">
                <label>Producción total</label>
                <input
                  type="number"
                  value={campanaForm.produccionTotal}
                  onChange={(e) => setCampanaForm({ ...campanaForm, produccionTotal: e.target.value })}
                  placeholder="t"
                />
              </div>
            </div>
            <div className="am-modal-actions">
              <button
                type="button"
                className="am-btn am-btn-ghost"
                onClick={() => {
                  setCampanaModalOpen(false);
                  setCampanaEditing(null);
                }}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="am-btn am-btn-primary"
                onClick={submitCampana}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {parcelaModalOpen && (
        <div className="am-modal-backdrop">
          <div className="am-modal">
            <h3 className="am-modal-title">{parcelaEditing ? 'Editar parcela' : 'Nueva parcela'}</h3>
            <div className="am-modal-body">
              <div className="am-modal-row">
                <label>Nombre de la parcela</label>
                <input
                  value={parcelaForm.nombre}
                  onChange={(e) => setParcelaForm({ ...parcelaForm, nombre: e.target.value })}
                />
              </div>
              <div className="am-modal-row">
                <label>Hectáreas</label>
                <input
                  type="number"
                  value={parcelaForm.hectareas}
                  onChange={(e) => setParcelaForm({ ...parcelaForm, hectareas: e.target.value })}
                />
              </div>
              <div className="am-modal-row">
                <label>Cultivo actual</label>
                <input
                  value={parcelaForm.cultivo}
                  onChange={(e) => setParcelaForm({ ...parcelaForm, cultivo: e.target.value })}
                  placeholder="Ej: Maíz, Soja, Trigo"
                />
              </div>
              <div className="am-modal-row">
                <label>Estado</label>
                <select
                  value={parcelaForm.estado}
                  onChange={(e) => setParcelaForm({ ...parcelaForm, estado: e.target.value })}
                >
                  <option value="En preparación">En preparación</option>
                  <option value="Activa">Activa</option>
                  <option value="Cosechada">Cosechada</option>
                </select>
              </div>
              <div className="am-modal-row">
                <label>Inversión inicial</label>
                <input
                  type="number"
                  value={parcelaForm.inversion}
                  onChange={(e) => setParcelaForm({ ...parcelaForm, inversion: e.target.value })}
                />
              </div>
            </div>
            <div className="am-modal-actions">
              <button
                type="button"
                className="am-btn am-btn-ghost"
                onClick={() => {
                  setParcelaModalOpen(false);
                  setParcelaEditing(null);
                }}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="am-btn am-btn-primary"
                onClick={submitParcela}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteParcelaId && (
        <div className="am-modal-backdrop">
          <div className="am-modal">
            <h3 className="am-modal-title">Eliminar parcela</h3>
            <div className="am-modal-body">
              <p>¿Seguro que deseas eliminar esta parcela?</p>
            </div>
            <div className="am-modal-actions">
              <button
                type="button"
                className="am-btn am-btn-ghost"
                onClick={() => setDeleteParcelaId(null)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="am-btn am-btn-danger"
                onClick={confirmDeleteParcela}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {maquinariaModalOpen && (
        <div className="am-modal-backdrop">
          <div className="am-modal">
            <h3 className="am-modal-title">{maquinariaEditing ? 'Editar maquinaria' : 'Nueva maquinaria'}</h3>
            <div className="am-modal-body">
              <div className="am-modal-row">
                <label>Nombre</label>
                <input
                  value={maquinariaForm.nombre}
                  onChange={(e) => setMaquinariaForm({ ...maquinariaForm, nombre: e.target.value })}
                />
              </div>
              <div className="am-modal-row">
                <label>Tipo</label>
                <input
                  value={maquinariaForm.tipo}
                  onChange={(e) => setMaquinariaForm({ ...maquinariaForm, tipo: e.target.value })}
                />
              </div>
              <div className="am-modal-row">
                <label>Estado</label>
                <select
                  value={maquinariaForm.estado}
                  onChange={(e) => setMaquinariaForm({ ...maquinariaForm, estado: e.target.value })}
                >
                  <option value="Operativo">Operativo</option>
                  <option value="Mantenimiento">Mantenimiento</option>
                  <option value="Fuera de servicio">Fuera de servicio</option>
                </select>
              </div>
              <div className="am-modal-row">
                <label>Último mantenimiento</label>
                <input
                  type="date"
                  value={maquinariaForm.ultimoMantenimiento}
                  onChange={(e) => setMaquinariaForm({ ...maquinariaForm, ultimoMantenimiento: e.target.value })}
                />
              </div>
              <div className="am-modal-row">
                <label>Próximo mantenimiento</label>
                <input
                  type="date"
                  value={maquinariaForm.proximoMantenimiento}
                  onChange={(e) => setMaquinariaForm({ ...maquinariaForm, proximoMantenimiento: e.target.value })}
                />
              </div>
            </div>
            <div className="am-modal-actions">
              <button
                type="button"
                className="am-btn am-btn-ghost"
                onClick={() => {
                  setMaquinariaModalOpen(false);
                  setMaquinariaEditing(null);
                }}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="am-btn am-btn-primary"
                onClick={submitMaquinaria}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteMaquinariaId && (
        <div className="am-modal-backdrop">
          <div className="am-modal">
            <h3 className="am-modal-title">Eliminar maquinaria</h3>
            <div className="am-modal-body">
              <p>¿Seguro que deseas eliminar este equipo?</p>
            </div>
            <div className="am-modal-actions">
              <button
                type="button"
                className="am-btn am-btn-ghost"
                onClick={() => setDeleteMaquinariaId(null)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="am-btn am-btn-danger"
                onClick={confirmDeleteMaquinaria}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {semillaModalOpen && (
        <div className="am-modal-backdrop">
          <div className="am-modal">
            <h3 className="am-modal-title">{semillaEditing ? 'Editar semilla' : 'Nueva semilla'}</h3>
            <div className="am-modal-body">
              <div className="am-modal-row">
                <label>Tipo de semilla</label>
                <input
                  value={semillaForm.tipo}
                  onChange={(e) => setSemillaForm({ ...semillaForm, tipo: e.target.value })}
                />
              </div>
              <div className="am-modal-row">
                <label>Cantidad</label>
                <input
                  type="number"
                  value={semillaForm.cantidad}
                  onChange={(e) => setSemillaForm({ ...semillaForm, cantidad: e.target.value })}
                />
              </div>
              <div className="am-modal-row">
                <label>Costo</label>
                <input
                  type="number"
                  value={semillaForm.costo}
                  onChange={(e) => setSemillaForm({ ...semillaForm, costo: e.target.value })}
                />
              </div>
              <div className="am-modal-row">
                <label>Proveedor</label>
                <input
                  value={semillaForm.proveedor}
                  onChange={(e) => setSemillaForm({ ...semillaForm, proveedor: e.target.value })}
                />
              </div>
            </div>
            <div className="am-modal-actions">
              <button
                type="button"
                className="am-btn am-btn-ghost"
                onClick={() => {
                  setSemillaModalOpen(false);
                  setSemillaEditing(null);
                }}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="am-btn am-btn-primary"
                onClick={submitSemilla}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteSemillaId && (
        <div className="am-modal-backdrop">
          <div className="am-modal">
            <h3 className="am-modal-title">Eliminar semilla</h3>
            <div className="am-modal-body">
              <p>¿Seguro que deseas eliminar esta semilla?</p>
            </div>
            <div className="am-modal-actions">
              <button
                type="button"
                className="am-btn am-btn-ghost"
                onClick={() => setDeleteSemillaId(null)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="am-btn am-btn-danger"
                onClick={confirmDeleteSemilla}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {plagaModalOpen && (
        <div className="am-modal-backdrop">
          <div className="am-modal">
            <h3 className="am-modal-title">{plagaEditing ? 'Editar registro de plaga' : 'Nuevo registro de plaga'}</h3>
            <div className="am-modal-body">
              <div className="am-modal-row">
                <label>Cultivo afectado</label>
                <input
                  value={plagaForm.cultivo}
                  onChange={(e) => setPlagaForm({ ...plagaForm, cultivo: e.target.value })}
                />
              </div>
              <div className="am-modal-row">
                <label>Tipo de plaga</label>
                <input
                  value={plagaForm.tipo}
                  onChange={(e) => setPlagaForm({ ...plagaForm, tipo: e.target.value })}
                />
              </div>
              <div className="am-modal-row">
                <label>Severidad</label>
                <select
                  value={plagaForm.severidad}
                  onChange={(e) => setPlagaForm({ ...plagaForm, severidad: e.target.value })}
                >
                  <option value="Bajo">Bajo</option>
                  <option value="Medio">Medio</option>
                  <option value="Alto">Alto</option>
                </select>
              </div>
              <div className="am-modal-row">
                <label>Fecha detección</label>
                <input
                  type="date"
                  value={plagaForm.fechaDetec}
                  onChange={(e) => setPlagaForm({ ...plagaForm, fechaDetec: e.target.value })}
                />
              </div>
              <div className="am-modal-row">
                <label>Tratamiento</label>
                <input
                  value={plagaForm.tratamiento}
                  onChange={(e) => setPlagaForm({ ...plagaForm, tratamiento: e.target.value })}
                />
              </div>
            </div>
            <div className="am-modal-actions">
              <button
                type="button"
                className="am-btn am-btn-ghost"
                onClick={() => {
                  setPlagaModalOpen(false);
                  setPlagaEditing(null);
                }}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="am-btn am-btn-primary"
                onClick={submitPlaga}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {deletePlagaId && (
        <div className="am-modal-backdrop">
          <div className="am-modal">
            <h3 className="am-modal-title">Eliminar registro de plaga</h3>
            <div className="am-modal-body">
              <p>¿Seguro que deseas eliminar este registro?</p>
            </div>
            <div className="am-modal-actions">
              <button
                type="button"
                className="am-btn am-btn-ghost"
                onClick={() => setDeletePlagaId(null)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="am-btn am-btn-danger"
                onClick={confirmDeletePlaga}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {riegoModalOpen && (
        <div className="am-modal-backdrop">
          <div className="am-modal">
            <h3 className="am-modal-title">{riegoEditing ? 'Editar programación de riego' : 'Nueva programación de riego'}</h3>
            <div className="am-modal-body">
              <div className="am-modal-row">
                <label>Tipo de riego</label>
                <input
                  value={riegoForm.tipo}
                  onChange={(e) => setRiegoForm({ ...riegoForm, tipo: e.target.value })}
                />
              </div>
              <div className="am-modal-row">
                <label>Consumo de agua</label>
                <input
                  value={riegoForm.consumoAgua}
                  onChange={(e) => setRiegoForm({ ...riegoForm, consumoAgua: e.target.value })}
                  placeholder="Ej: 25000 L"
                />
              </div>
              <div className="am-modal-row">
                <label>Último riego</label>
                <input
                  type="date"
                  value={riegoForm.ultimoRiego}
                  onChange={(e) => setRiegoForm({ ...riegoForm, ultimoRiego: e.target.value })}
                />
              </div>
              <div className="am-modal-row">
                <label>Próximo riego</label>
                <input
                  type="date"
                  value={riegoForm.proximoRiego}
                  onChange={(e) => setRiegoForm({ ...riegoForm, proximoRiego: e.target.value })}
                />
              </div>
            </div>
            <div className="am-modal-actions">
              <button
                type="button"
                className="am-btn am-btn-ghost"
                onClick={() => {
                  setRiegoModalOpen(false);
                  setRiegoEditing(null);
                }}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="am-btn am-btn-primary"
                onClick={submitRiego}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteRiegoId && (
        <div className="am-modal-backdrop">
          <div className="am-modal">
            <h3 className="am-modal-title">Eliminar programación de riego</h3>
            <div className="am-modal-body">
              <p>¿Seguro que deseas eliminar esta programación?</p>
            </div>
            <div className="am-modal-actions">
              <button
                type="button"
                className="am-btn am-btn-ghost"
                onClick={() => setDeleteRiegoId(null)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="am-btn am-btn-danger"
                onClick={confirmDeleteRiego}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {trabajadorModalOpen && (
        <div className="am-modal-backdrop">
          <div className="am-modal">
            <h3 className="am-modal-title">{trabajadorEditing ? 'Editar trabajador' : 'Nuevo trabajador'}</h3>
            <div className="am-modal-body">
              <div className="am-modal-row">
                <label>Nombre</label>
                <input
                  value={trabajadorForm.nombre}
                  onChange={(e) => setTrabajadorForm({ ...trabajadorForm, nombre: e.target.value })}
                />
              </div>
              <div className="am-modal-row">
                <label>Cargo</label>
                <input
                  value={trabajadorForm.cargo}
                  onChange={(e) => setTrabajadorForm({ ...trabajadorForm, cargo: e.target.value })}
                />
              </div>
              <div className="am-modal-row">
                <label>Salario mensual</label>
                <input
                  type="number"
                  value={trabajadorForm.salario}
                  onChange={(e) => setTrabajadorForm({ ...trabajadorForm, salario: e.target.value })}
                />
              </div>
              <div className="am-modal-row">
                <label>Horas trabajadas</label>
                <input
                  type="number"
                  value={trabajadorForm.horasTrabajadas}
                  onChange={(e) => setTrabajadorForm({ ...trabajadorForm, horasTrabajadas: e.target.value })}
                />
              </div>
              <div className="am-modal-row">
                <label>Estado</label>
                <select
                  value={trabajadorForm.estado}
                  onChange={(e) => setTrabajadorForm({ ...trabajadorForm, estado: e.target.value })}
                >
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                </select>
              </div>
            </div>
            <div className="am-modal-actions">
              <button
                type="button"
                className="am-btn am-btn-ghost"
                onClick={() => {
                  setTrabajadorModalOpen(false);
                  setTrabajadorEditing(null);
                }}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="am-btn am-btn-primary"
                onClick={submitTrabajador}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteTrabajadorId && (
        <div className="am-modal-backdrop">
          <div className="am-modal">
            <h3 className="am-modal-title">Eliminar trabajador</h3>
            <div className="am-modal-body">
              <p>¿Seguro que deseas eliminar este trabajador?</p>
            </div>
            <div className="am-modal-actions">
              <button
                type="button"
                className="am-btn am-btn-ghost"
                onClick={() => setDeleteTrabajadorId(null)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="am-btn am-btn-danger"
                onClick={confirmDeleteTrabajador}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {ingresoModalOpen && (
        <div className="am-modal-backdrop">
          <div className="am-modal">
            <h3 className="am-modal-title">Registrar ingreso</h3>
            <div className="am-modal-body">
              <div className="am-modal-row">
                <label>Concepto</label>
                <input
                  value={ingresoForm.concepto}
                  onChange={(e) => setIngresoForm({ ...ingresoForm, concepto: e.target.value })}
                />
              </div>
              <div className="am-modal-row">
                <label>Monto</label>
                <input
                  type="number"
                  value={ingresoForm.monto}
                  onChange={(e) => setIngresoForm({ ...ingresoForm, monto: e.target.value })}
                />
              </div>
              <div className="am-modal-row">
                <label>Fecha</label>
                <input
                  type="date"
                  value={ingresoForm.fecha}
                  onChange={(e) => setIngresoForm({ ...ingresoForm, fecha: e.target.value })}
                />
              </div>
              <div className="am-modal-row">
                <label>Tipo</label>
                <input
                  value={ingresoForm.tipo}
                  onChange={(e) => setIngresoForm({ ...ingresoForm, tipo: e.target.value })}
                />
              </div>
            </div>
            <div className="am-modal-actions">
              <button
                type="button"
                className="am-btn am-btn-ghost"
                onClick={() => setIngresoModalOpen(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="am-btn am-btn-primary"
                onClick={submitIngreso}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {egresoModalOpen && (
        <div className="am-modal-backdrop">
          <div className="am-modal">
            <h3 className="am-modal-title">Registrar egreso</h3>
            <div className="am-modal-body">
              <div className="am-modal-row">
                <label>Concepto</label>
                <input
                  value={egresoForm.concepto}
                  onChange={(e) => setEgresoForm({ ...egresoForm, concepto: e.target.value })}
                />
              </div>
              <div className="am-modal-row">
                <label>Monto</label>
                <input
                  type="number"
                  value={egresoForm.monto}
                  onChange={(e) => setEgresoForm({ ...egresoForm, monto: e.target.value })}
                />
              </div>
              <div className="am-modal-row">
                <label>Fecha</label>
                <input
                  type="date"
                  value={egresoForm.fecha}
                  onChange={(e) => setEgresoForm({ ...egresoForm, fecha: e.target.value })}
                />
              </div>
              <div className="am-modal-row">
                <label>Tipo</label>
                <input
                  value={egresoForm.tipo}
                  onChange={(e) => setEgresoForm({ ...egresoForm, tipo: e.target.value })}
                />
              </div>
              <div className="am-modal-row">
                <label>Categoría</label>
                <input
                  value={egresoForm.categoria}
                  onChange={(e) => setEgresoForm({ ...egresoForm, categoria: e.target.value })}
                />
              </div>
            </div>
            <div className="am-modal-actions">
              <button
                type="button"
                className="am-btn am-btn-ghost"
                onClick={() => setEgresoModalOpen(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="am-btn am-btn-primary"
                onClick={submitEgreso}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CropManagementDashboard;
