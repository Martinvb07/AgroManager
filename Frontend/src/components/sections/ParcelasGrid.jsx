const colorEstado = (estado) => ({
  'Activa': 'am-success',
  'En preparación': 'am-info',
  'Cosechada': 'am-muted',
}[estado] || 'am-muted');

import { useEffect, useState } from 'react';
import { fetchParcelas, crearParcela } from '../../services/api.js';

const ParcelasGrid = () => {
  const [parcelas, setParcelas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cargar = async () => {
    try {
      setLoading(true);
      const data = await fetchParcelas();
      setParcelas(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const handleCrear = async () => {
    try {
      const nueva = await crearParcela({ nombre: `Parcela ${Date.now()}`, hectareas: 1, cultivo: 'Pendiente', estado: 'En preparación', inversion: 0 });
      setParcelas([nueva, ...parcelas]);
    } catch (e) {
      alert(e.message);
    }
  };

  if (loading) return <p>Cargando parcelas...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="am-space-6">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}} className="mb-6">
        <h2 className="am-section-title">Gestión de Parcelas</h2>
        <button onClick={handleCrear} className="am-badge am-success" style={{cursor:'pointer'}}>+ Nueva Parcela</button>
      </div>
      <div className="am-grid am-grid-2-md">
        {parcelas.map((parcela) => (
          <div key={parcela.id} className="am-card" style={{padding:'24px'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'start',marginBottom:'12px'}}>
              <h3 style={{fontSize:'20px',fontWeight:700,color:'#111827'}}>{parcela.nombre}</h3>
              <span className={`am-badge ${colorEstado(parcela.estado)}`}>{parcela.estado}</span>
            </div>
            <div className="am-grid" style={{gridTemplateColumns:'repeat(2,1fr)',gap:'16px',marginBottom:'12px'}}>
              <div style={{background:'#ecfdf5',padding:'12px',borderRadius:'10px'}}>
                <p style={{fontSize:'12px',color:'#475569',marginBottom:'4px'}}>Hectáreas</p>
                <p style={{fontSize:'18px',fontWeight:800,color:'#059669'}}>{parcela.hectareas ?? 0} ha</p>
              </div>
              <div style={{background:'#eff6ff',padding:'12px',borderRadius:'10px'}}>
                <p style={{fontSize:'12px',color:'#475569',marginBottom:'4px'}}>Inversión</p>
                <p style={{fontSize:'18px',fontWeight:800,color:'#2563eb'}}>${Number(parcela.inversion || 0).toLocaleString()}</p>
              </div>
            </div>
            <p style={{fontSize:'14px',color:'#475569',marginBottom:'12px'}}><span style={{fontWeight:600}}>Cultivo actual:</span> {parcela.cultivo || 'Sin definir'}</p>
            <div style={{display:'flex',gap:'12px'}}>
              <button className="am-badge am-success" style={{flex:1,cursor:'pointer'}}>Ver detalles</button>
              <button className="am-badge am-muted" style={{flex:1,cursor:'pointer'}}>Editar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ParcelasGrid;
