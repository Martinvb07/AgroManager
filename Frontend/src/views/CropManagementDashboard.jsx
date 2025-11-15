import { useState } from 'react';
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

import {
  stats as initialStats,
  parcelas as initialParcelas,
  trabajadores as initialTrabajadores,
  ingresos as initialIngresos,
  egresos as initialEgresos,
  maquinaria as initialMaquinaria,
  semillas as initialSemillas,
  plagas as initialPlagas,
  riego as initialRiego,
  fertilizantes as initialFertilizantes,
  calcularLiquidacion,
} from '../services/mockData.js';

const CropManagementDashboard = () => {
  const [activeSection, setActiveSection] = useState('dashboard');

  const [stats] = useState(initialStats);
  const [parcelas] = useState(initialParcelas);
  const [trabajadores] = useState(initialTrabajadores);
  const [ingresos] = useState(initialIngresos);
  const [egresos] = useState(initialEgresos);
  const [maquinaria] = useState(initialMaquinaria);
  const [semillas] = useState(initialSemillas);
  const [plagas] = useState(initialPlagas);
  const [riego] = useState(initialRiego);
  const [fertilizantes] = useState(initialFertilizantes);

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardOverview stats={stats} ingresos={ingresos} egresos={egresos} />;
      case 'trabajadores':
        return <TrabajadoresTable trabajadores={trabajadores} calcularLiquidacion={calcularLiquidacion} />;
      case 'finanzas':
        return <FinanzasView ingresos={ingresos} egresos={egresos} />;
      case 'maquinaria':
        return <MaquinariaGrid maquinaria={maquinaria} />;
      case 'parcelas':
        return <ParcelasGrid parcelas={parcelas} />;
      case 'semillas':
        return <SemillasTable semillas={semillas} />;
      case 'plagas':
        return <PlagasGrid plagas={plagas} />;
      case 'riego':
        return <RiegoTable riego={riego} />;
      case 'fertilizantes':
        return <FertilizantesTable fertilizantes={fertilizantes} />;
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
          <div>
            <h1 className="brand-title">AgroManager</h1>
            <p className="brand-sub">Sistema Integral de Gestión Agrícola</p>
          </div>
          <div className="user">
            <div style={{textAlign:'right'}}>
              <p style={{fontSize:'13px',color:'#d1fae5'}}>Usuario</p>
              <p style={{fontSize:'14px',fontWeight:700}}>Admin Agrícola</p>
            </div>
            <div className="am-pill"><Settings className="am-icon-lg" /></div>
          </div>
        </div>
      </div>

      <div className="am-container">
        <Navigation activeSection={activeSection} setActiveSection={setActiveSection} />
        <div className="am-card" style={{padding:'32px',minHeight:'600px'}}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default CropManagementDashboard;
