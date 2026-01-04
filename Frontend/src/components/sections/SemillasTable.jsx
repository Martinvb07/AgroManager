const SemillasTable = ({ semillas, onAdd, onEdit, onDelete }) => (
  <div className="am-space-6">
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}} className="mb-6">
      <h2 className="am-section-title">Inventario de Semillas</h2>
      <button className="am-badge am-success" style={{cursor:'pointer'}} onClick={onAdd}>+ Agregar Semilla</button>
    </div>
    <div className="am-card" style={{overflow:'hidden'}}>
      <div className="am-table-wrapper">
      <table className="am-table">
        <thead className="head-green">
          <tr>
            <th>Tipo de Semilla</th>
            <th>Cantidad</th>
            <th>Costo</th>
            <th>Proveedor</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {semillas.map((s) => (
            <tr key={s.id}>
              <td>{s.tipo}</td>
              <td>{s.cantidad}</td>
              <td>${s.costo.toLocaleString()}</td>
              <td>{s.proveedor}</td>
              <td className="am-actions">
                <button className="success" onClick={() => onEdit(s)}>Editar</button>
                <button className="danger" onClick={() => onDelete(s.id)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  </div>
);

export default SemillasTable;
