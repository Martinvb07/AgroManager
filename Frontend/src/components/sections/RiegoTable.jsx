const RiegoTable = ({ riego }) => (
  <div className="am-space-6">
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}} className="mb-6">
      <h2 className="am-section-title">Programación de Riego</h2>
      <button className="am-badge am-info" style={{cursor:'pointer'}}>+ Programar Riego</button>
    </div>
    <div className="am-card" style={{overflow:'hidden'}}>
      <table className="am-table">
        <thead className="head-cyan">
          <tr>
            <th>Parcela</th>
            <th>Tipo de Riego</th>
            <th>Consumo Agua</th>
            <th>Último Riego</th>
            <th>Próximo Riego</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {riego.map((item) => (
            <tr key={item.id}>
              <td>{item.parcela}</td>
              <td>{item.tipo}</td>
              <td>{item.consumoAgua}</td>
              <td>{item.ultimoRiego}</td>
              <td>{item.proximoRiego}</td>
              <td className="am-actions">
                <button className="primary">Editar</button>
                <button className="success">Regar ahora</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default RiegoTable;
