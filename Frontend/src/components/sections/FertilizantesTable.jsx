import { getEstadoColor } from '../../services/mockData';

const FertilizantesTable = ({ fertilizantes, onAdd, onEdit, onDelete }) => (
  <div className="space-y-4">
      <div className="am-space-6">
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}} className="mb-6">
          <h2 className="am-section-title">Aplicaciones de Fertilizantes</h2>
          <button
            className="am-badge am-success"
            style={{cursor:'pointer'}}
            onClick={onAdd}
          >
            + Nueva Aplicación
          </button>
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
                  <td>{item.fertilizante || item.nombre}</td>
                  <td>{item.dosis || item.cantidad}</td>
                  <td>{item.fecha || item.fechaAplicacion}</td>
                  <td>
                    <span className={`am-badge ${getEstadoColor(item.estado || 'Activo')}`}>
                      {item.estado || 'Aplicado'}
                    </span>
                  </td>
                  <td className="am-actions">
                    <button
                      className="success"
                      onClick={onEdit ? () => onEdit(item) : undefined}
                    >
                      Editar
                    </button>
                    <button
                      className="danger"
                      onClick={onDelete ? () => onDelete(item.id) : undefined}
                    >
                      Eliminar
                    </button>
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
