const nivelColor = (nivel) => ({
  'Bajo': 'am-success',
  'Medio': 'am-warning',
  'Alto': 'am-danger',
}[nivel] || 'am-muted');

const PlagasGrid = ({ plagas, onAdd, onEdit, onDelete }) => (
  <div className="am-space-6">
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}} className="mb-6">
      <h2 className="am-section-title">Control de Plagas</h2>
      <button className="am-badge am-danger" style={{cursor:'pointer'}} onClick={onAdd}>+ Registrar Plaga</button>
    </div>
    <div className="am-grid am-grid-2-md" style={{gap:'16px'}}>
      {plagas.map((p) => (
        <div key={p.id} className="am-card" style={{padding:'20px'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'start',marginBottom:'12px'}}>
            <h3 style={{fontSize:'18px',fontWeight:600,color:'#111827'}}>{p.cultivo}</h3>
            <span className={`am-badge ${nivelColor(p.severidad)}`}>Nivel {p.severidad}</span>
          </div>
          <div style={{display:'grid',gap:'8px',fontSize:'14px',color:'#475569',marginBottom:'12px'}}>
            <p><span style={{fontWeight:600}}>Tipo de plaga:</span> {p.tipo}</p>
            <p><span style={{fontWeight:600}}>Fecha detección:</span> {p.fechaDetec}</p>
            <p><span style={{fontWeight:600}}>Tratamiento:</span> {p.tratamiento}</p>
          </div>
          <div style={{display:'flex',gap:'12px'}}>
            <button className="am-badge am-danger" style={{flex:1,cursor:'pointer'}} onClick={() => onEdit(p)}>Editar</button>
            <button className="am-badge am-muted" style={{flex:1,cursor:'pointer'}} onClick={() => onDelete(p.id)}>Eliminar</button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default PlagasGrid;
