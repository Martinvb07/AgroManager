import { MapPin, Users, TrendingUp, DollarSign, Truck } from 'lucide-react';

const DashboardOverview = ({ stats, ingresos, egresos }) => {
  return (
    <div className="am-space-6">
      <h2 className="am-section-title mb-6">Panel de Control</h2>

      <div className="am-grid am-grid-2-md am-grid-5-lg">
        <div className="am-stat am-grad-emerald">
          <MapPin className="am-icon-lg" />
          <p className="label">Parcelas Activas</p>
          <p className="value" style={{fontSize:'28px'}}>{stats.parcelasActivas}</p>
        </div>
        <div className="am-stat am-grad-blue">
          <Users className="am-icon-lg" />
          <p className="label">Trabajadores</p>
          <p className="value" style={{fontSize:'28px'}}>{stats.trabajadores}</p>
        </div>
        <div className="am-stat am-grad-green">
          <TrendingUp className="am-icon-lg" />
          <p className="label">Ingresos (mes)</p>
          <p className="value" style={{fontSize:'24px'}}>${stats.ingresosMes.toLocaleString()}</p>
        </div>
        <div className="am-stat am-grad-red">
          <DollarSign className="am-icon-lg" />
          <p className="label">Egresos (mes)</p>
          <p className="value" style={{fontSize:'24px'}}>${stats.gastosMes.toLocaleString()}</p>
        </div>
        <div className="am-stat am-grad-orange">
          <Truck className="am-icon-lg" />
          <p className="label">Maquinarias</p>
          <p className="value" style={{fontSize:'28px'}}>{stats.maquinariasOperativas}</p>
        </div>
      </div>

      <div className="am-grid am-grid-2-md" style={{marginTop:'24px'}}>
        <div className="am-card am-p-6">
          <h3 className="am-card-header">Últimas Transacciones</h3>
          <div style={{display:'grid',gap:'12px'}}>
            {[...ingresos.slice(0, 2), ...egresos.slice(0, 2)].map((item, idx) => (
              <div key={idx} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0',borderBottom:'1px solid #f1f5f9'}}>
                <div>
                  <p style={{fontSize:'14px',fontWeight:600,color:'#1f2937'}}>{item.concepto}</p>
                  <p style={{fontSize:'12px',color:'#6b7280'}}>{item.fecha}</p>
                </div>
                <p style={{fontSize:'14px',fontWeight:700,color: item.tipo === 'Venta' ? '#16a34a' : '#dc2626'}}>
                  {item.tipo === 'Venta' ? '+' : '-'}${item.monto.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="am-card am-p-6">
          <h3 className="am-card-header">Alertas y Notificaciones</h3>
          <div style={{display:'grid',gap:'12px'}}>
            <div style={{display:'flex',gap:'12px',padding:'12px',background:'#fef3c7',borderRadius:'10px'}}>
              <div style={{width:'8px',height:'8px',borderRadius:'999px',background:'#f59e0b',marginTop:'6px'}}></div>
              <div>
                <p style={{fontSize:'14px',fontWeight:600,color:'#1f2937'}}>Mantenimiento pendiente</p>
                <p style={{fontSize:'12px',color:'#475569'}}>Pulverizador Montana 3000 requiere revisión</p>
              </div>
            </div>
            <div style={{display:'flex',gap:'12px',padding:'12px',background:'#fee2e2',borderRadius:'10px'}}>
              <div style={{width:'8px',height:'8px',borderRadius:'999px',background:'#ef4444',marginTop:'6px'}}></div>
              <div>
                <p style={{fontSize:'14px',fontWeight:600,color:'#1f2937'}}>Plaga detectada</p>
                <p style={{fontSize:'12px',color:'#475569'}}>Nivel medio de cogollero en Parcela Norte A</p>
              </div>
            </div>
            <div style={{display:'flex',gap:'12px',padding:'12px',background:'#dbeafe',borderRadius:'10px'}}>
              <div style={{width:'8px',height:'8px',borderRadius:'999px',background:'#3b82f6',marginTop:'6px'}}></div>
              <div>
                <p style={{fontSize:'14px',fontWeight:600,color:'#1f2937'}}>Riego programado</p>
                <p style={{fontSize:'12px',color:'#475569'}}>Parcela Norte A - Mañana 15/11</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
