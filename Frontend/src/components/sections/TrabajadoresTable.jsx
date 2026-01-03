import React from 'react';

const TrabajadoresTable = ({ trabajadores, calcularLiquidacion }) => {
  const estadoClass = (estado) => (estado === 'Activo' ? 'am-success' : 'am-muted');

  return (
    <div className="am-space-6">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}} className="mb-6">
        <h2 className="am-section-title">Gestión de Personal</h2>
        <button className="am-badge am-info" style={{cursor:'pointer'}}>+ Agregar Trabajador</button>
      </div>

      <div className="am-card" style={{overflow:'hidden'}}>
        <div className="am-table-wrapper">
        <table className="am-table">
          <thead className="head-blue">
            <tr>
              <th>Nombre</th>
              <th>Cargo</th>
              <th>Salario</th>
              <th>Horas</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {trabajadores.map((t) => {
              const liq = calcularLiquidacion(t);
              return (
                <tr key={t.id}>
                  <td>{t.nombre}</td>
                  <td>{t.cargo}</td>
                  <td>${t.salario.toLocaleString()}</td>
                  <td>{t.horasTrabajadas}h</td>
                  <td><span className={`am-badge ${estadoClass(t.estado)}`}>{t.estado}</span></td>
                  <td className="am-actions">
                    <button className="primary">Editar</button>
                    <button
                      className="success"
                      onClick={() => alert(`Liquidación de ${t.nombre}:\n\nSalario Bruto: $${liq.salarioBruto.toLocaleString()}\nHoras Extras: $${liq.horasExtras.toFixed(2)}\nDeducciones: $${liq.deducciones.toFixed(2)}\n\nSalario Neto: $${liq.salarioNeto.toFixed(2)}`)}
                    >
                      Liquidar
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
};

export default TrabajadoresTable;
