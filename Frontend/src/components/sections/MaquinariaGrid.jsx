import { Truck } from 'lucide-react';

const estadoClass = (estado) => ({
  'Operativo': 'am-success',
  'Mantenimiento': 'am-warning',
}[estado] || 'am-muted');

const MaquinariaGrid = ({ maquinaria, onAdd, onEdit, onDelete }) => (
  <div className="am-space-6">
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}} className="mb-6">
      <h2 className="am-section-title">Gestión de Maquinaria</h2>
      <button
        className="am-badge am-warning"
        style={{cursor:'pointer'}}
        onClick={onAdd}
      >
        + Registrar Maquinaria
      </button>
    </div>
    <div className="am-grid am-grid-2-md" style={{gap:'16px'}}>
      {maquinaria.map((maq) => (
        <div key={maq.id} className="am-card" style={{padding:'20px'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'start',marginBottom:'12px'}}>
            <div className="am-badge am-muted" style={{background:'#ffedd5',color:'#9a3412'}}><Truck className="am-icon-lg" /></div>
            <span className={`am-badge ${estadoClass(maq.estado)}`}>{maq.estado}</span>
          </div>
          <h3 style={{fontSize:'18px',fontWeight:600,color:'#111827',marginBottom:'8px'}}>{maq.nombre}</h3>
          <p style={{fontSize:'14px',color:'#475569',marginBottom:'12px'}}>{maq.tipo}</p>
          <div style={{display:'grid',gap:'6px',fontSize:'12px',color:'#475569',background:'#f8fafc',padding:'12px',borderRadius:'10px'}}>
            <p><span style={{fontWeight:600}}>Último mantenimiento:</span> {maq.ultimoMantenimiento}</p>
            <p><span style={{fontWeight:600}}>Próximo mantenimiento:</span> {maq.proximoMantenimiento}</p>
          </div>
          <div style={{marginTop:'12px',display:'flex',gap:'12px'}}>
            <button className="am-actions primary" onClick={() => onEdit && onEdit(maq)}>Editar</button>
            <button
              className="am-actions danger"
              style={{color:'#dc2626'}}
              onClick={() => onDelete && onDelete(maq.id)}
            >
              Eliminar
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default MaquinariaGrid;
