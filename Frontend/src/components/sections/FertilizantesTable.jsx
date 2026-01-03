const FertilizantesTable = ({ fertilizantes }) => (
  <div className="space-y-4">
      <div className="am-space-6">
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}} className="mb-6">
          <h2 className="am-section-title">Aplicaciones de Fertilizantes</h2>
          <button className="am-badge am-success" style={{cursor:'pointer'}}>+ Nueva Aplicación</button>
        </div>
        <div className="am-card" style={{overflow:'hidden'}}>
          <div className="am-table-wrapper">
          <table className="am-table">
            <thead className="head-green">
              <tr>
                <th>Parcela</th>
                <th>Fertilizante</th>
                <th>Dosis</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {fertilizantes.map((item) => (
                <tr key={item.id}>
                  <td>{item.parcela}</td>
                  <td>{item.fertilizante}</td>
                  <td>{item.dosis}</td>
                  <td>{item.fecha}</td>
                  <td>
                    <span className="am-badge" style={{...getEstadoColor(item.estado)}}>
                      {item.estado}
                    </span>
                  </td>
                  <td className="am-actions">
                    <button className="success">Editar</button>
                    <button className="danger">Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      </div>
  </div>
);

export default FertilizantesTable;
