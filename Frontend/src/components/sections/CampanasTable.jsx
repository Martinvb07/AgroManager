const formatDate = (value) => {
  if (!value) return '';
  const d = new Date(value);
  if (!Number.isNaN(d.getTime())) {
    return d.toISOString().slice(0, 10);
  }
  return String(value).slice(0, 10);
};

const CampanasTable = ({ campanas, onAdd, onEdit, onDelete }) => (
  <div className="am-space-6">
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} className="mb-6">
      <h2 className="am-section-title">Campañas Agrícolas</h2>
      <button className="am-badge am-success" style={{ cursor: 'pointer' }} onClick={onAdd}>
        + Nueva Campaña
      </button>
    </div>
    <div className="am-card" style={{ overflow: 'hidden' }}>
      <div className="am-table-wrapper">
        <table className="am-table">
          <thead className="head-violet">
            <tr>
              <th>Nombre</th>
              <th>Periodo</th>
              <th>Hectáreas</th>
              <th>Lotes</th>
              <th>Inversión</th>
              <th>Gastos</th>
              <th>Ingresos</th>
              <th>Rend. / ha</th>
              <th>Producción</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {campanas.map((c) => (
              <tr key={c.id}>
                <td>{c.nombre}</td>
                <td>
                  {formatDate(c.fechaInicio)}
                  {' '}&#8594;{' '}
                  {formatDate(c.fechaFin)}
                </td>
                <td>{c.hectareas ?? '-'} ha</td>
                <td>{c.lotes ?? '-'}</td>
                <td>${Number(c.inversionTotal || 0).toLocaleString()}</td>
                <td>${Number(c.gastosOperativos || 0).toLocaleString()}</td>
                <td>${Number(c.ingresoTotal || 0).toLocaleString()}</td>
                <td>{c.rendimientoHa ?? '-'} t/ha</td>
                <td>{c.produccionTotal ?? '-'} t</td>
                <td className="am-actions">
                  <button className="primary" onClick={() => onEdit(c)}>Editar</button>
                  <button className="danger" onClick={() => onDelete(c.id)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

export default CampanasTable;
