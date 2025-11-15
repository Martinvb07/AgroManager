const FinanzasView = ({ ingresos, egresos }) => {
  const totalIngresos = ingresos.reduce((s, i) => s + i.monto, 0);
  const totalEgresos = egresos.reduce((s, e) => s + e.monto, 0);
  const balance = totalIngresos - totalEgresos;

  return (
    <div className="am-space-6">
      <h2 className="am-section-title mb-6">Control Financiero</h2>

      <div className="am-grid am-grid-3-md">
        <div className="am-stat am-grad-green"><p className="label">Total Ingresos</p><p className="value" style={{fontSize:'28px'}}>${totalIngresos.toLocaleString()}</p></div>
        <div className="am-stat am-grad-red"><p className="label">Total Egresos</p><p className="value" style={{fontSize:'28px'}}>${totalEgresos.toLocaleString()}</p></div>
        <div className={`am-stat ${balance>=0?'am-grad-blue':'am-grad-orange'}`}><p className="label">Balance</p><p className="value" style={{fontSize:'28px'}}>${balance.toLocaleString()}</p></div>
      </div>

      <div className="am-grid am-grid-2-md">
        <div className="am-card am-p-6">
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'12px'}}>
            <h3 className="am-card-header">Ingresos</h3>
            <button className="am-badge am-success" style={{cursor:'pointer'}}>+ Registrar</button>
          </div>
          <div style={{display:'grid',gap:'12px',maxHeight:'380px',overflow:'auto'}}>
            {ingresos.map((ingreso) => (
              <div key={ingreso.id} style={{display:'flex',justifyContent:'space-between',alignItems:'start',padding:'12px',background:'#ecfdf5',borderRadius:'10px'}}>
                <div>
                  <p style={{fontSize:'14px',fontWeight:600,color:'#1f2937'}}>{ingreso.concepto}</p>
                  <p style={{fontSize:'12px',color:'#475569'}}>{ingreso.fecha} • {ingreso.parcela}</p>
                </div>
                <p style={{fontSize:'14px',fontWeight:800,color:'#16a34a'}}>${ingreso.monto.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="am-card am-p-6">
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'12px'}}>
            <h3 className="am-card-header">Egresos</h3>
            <button className="am-badge am-danger" style={{cursor:'pointer'}}>+ Registrar</button>
          </div>
          <div style={{display:'grid',gap:'12px',maxHeight:'380px',overflow:'auto'}}>
            {egresos.map((egreso) => (
              <div key={egreso.id} style={{display:'flex',justifyContent:'space-between',alignItems:'start',padding:'12px',background:'#fee2e2',borderRadius:'10px'}}>
                <div>
                  <p style={{fontSize:'14px',fontWeight:600,color:'#1f2937'}}>{egreso.concepto}</p>
                  <p style={{fontSize:'12px',color:'#475569'}}>{egreso.fecha} • {egreso.categoria}</p>
                </div>
                <p style={{fontSize:'14px',fontWeight:800,color:'#dc2626'}}>- ${egreso.monto.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinanzasView;
