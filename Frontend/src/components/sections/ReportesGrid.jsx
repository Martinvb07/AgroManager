import { FileText, MapPin, Users, Truck, Bug, Droplets } from 'lucide-react';

const reportes = [
  { icon: FileText, titulo: 'Reporte Financiero', grad: 'linear-gradient(135deg,#6366f1,#4f46e5)', desc: 'Análisis completo de ingresos, egresos y balance general del período.' },
  { icon: MapPin, titulo: 'Reporte de Producción', grad: 'linear-gradient(135deg,#10b981,#059669)', desc: 'Rendimiento por parcela, cultivos y proyecciones de cosecha.' },
  { icon: Users, titulo: 'Reporte de Nómina', grad: 'linear-gradient(135deg,#3b82f6,#1d4ed8)', desc: 'Liquidaciones, salarios y estadísticas del personal.' },
  { icon: Truck, titulo: 'Reporte de Maquinaria', grad: 'linear-gradient(135deg,#f59e0b,#d97706)', desc: 'Estado, mantenimientos y costos de operación de equipos.' },
  { icon: Bug, titulo: 'Reporte Fitosanitario', grad: 'linear-gradient(135deg,#ef4444,#dc2626)', desc: 'Control de plagas, tratamientos aplicados y efectividad.' },
  { icon: Droplets, titulo: 'Reporte de Riego', grad: 'linear-gradient(135deg,#06b6d4,#0e7490)', desc: 'Consumo de agua, eficiencia y programación de riego.' }
];

const ReportesGrid = () => (
  <div className="am-space-6">
    <h2 className="am-section-title mb-6">Centro de Reportes</h2>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:'1.25rem'}}>
      {reportes.map(({icon:Icon, titulo, grad, desc}, idx) => (
        <div key={idx} className="am-card" style={{background:grad,color:'#fff',padding:'1.25rem',boxShadow:'0 4px 14px rgba(0,0,0,0.25)',transition:'transform .25s, box-shadow .25s',cursor:'pointer'}}>
          <div style={{display:'flex',alignItems:'center',gap:'0.85rem',marginBottom:'0.85rem'}}>
            <div style={{padding:'0.75rem',borderRadius:'0.85rem',background:'rgba(255,255,255,0.23)',backdropFilter:'blur(4px)'}}>
              <Icon size={24} />
            </div>
            <h3 style={{fontSize:'1rem',fontWeight:600,margin:0}}>{titulo}</h3>
          </div>
          <p style={{fontSize:'0.72rem',lineHeight:'1.1rem',opacity:0.9,marginBottom:'0.85rem'}}>{desc}</p>
          <button className="am-badge" style={{width:'100%',textAlign:'center',background:'rgba(255,255,255,0.23)',color:'#fff',padding:'0.55rem 0',fontSize:'0.7rem',fontWeight:600,cursor:'pointer'}}>Generar Reporte</button>
        </div>
      ))}
    </div>
  </div>
);

export default ReportesGrid;
