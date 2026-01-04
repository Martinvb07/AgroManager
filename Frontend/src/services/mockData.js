export const stats = {
  parcelasActivas: 5,
  trabajadores: 23,
  ingresosMes: 145750,
  gastosMes: 87320,
  maquinariasOperativas: 12,
};

export const parcelas = [
  { id: 1, nombre: 'Parcela Norte A', hectareas: 12.5, cultivo: 'Maíz', estado: 'Activa', inversion: 25000 },
  { id: 2, nombre: 'Parcela Sur B', hectareas: 8.3, cultivo: 'Soja', estado: 'En preparación', inversion: 18000 },
];

export const trabajadores = [
  { id: 1, nombre: 'Juan Pérez', cargo: 'Operario', salario: 2500, horasTrabajadas: 160, estado: 'Activo' },
  { id: 2, nombre: 'María González', cargo: 'Supervisor', salario: 3500, horasTrabajadas: 160, estado: 'Activo' },
  { id: 3, nombre: 'Carlos Rodríguez', cargo: 'Maquinista', salario: 3000, horasTrabajadas: 152, estado: 'Activo' },
];

export const ingresos = [
  { id: 1, concepto: 'Venta de Maíz', monto: 85000, fecha: '2025-11-10', tipo: 'Venta', parcela: 'Parcela Norte A' },
  { id: 2, concepto: 'Venta de Soja', monto: 60750, fecha: '2025-11-08', tipo: 'Venta', parcela: 'Parcela Sur B' },
];

export const egresos = [
  { id: 1, concepto: 'Fertilizantes NPK', monto: 15000, fecha: '2025-11-05', tipo: 'Insumos', categoria: 'Fertilizantes' },
  { id: 2, concepto: 'Combustible', monto: 8500, fecha: '2025-11-07', tipo: 'Operación', categoria: 'Combustible' },
  { id: 3, concepto: 'Mantenimiento Tractor', monto: 12000, fecha: '2025-11-09', tipo: 'Mantenimiento', categoria: 'Maquinaria' },
  { id: 4, concepto: 'Salarios Octubre', monto: 51820, fecha: '2025-11-01', tipo: 'Personal', categoria: 'Nómina' },
];

export const maquinaria = [
  { id: 1, nombre: 'Tractor John Deere 6125R', tipo: 'Tractor', estado: 'Operativo', ultimoMantenimiento: '2025-10-15', proximoMantenimiento: '2025-12-15' },
  { id: 2, nombre: 'Cosechadora Case IH 2388', tipo: 'Cosechadora', estado: 'Operativo', ultimoMantenimiento: '2025-09-20', proximoMantenimiento: '2025-11-20' },
  { id: 3, nombre: 'Pulverizador Montana 3000', tipo: 'Pulverizador', estado: 'Mantenimiento', ultimoMantenimiento: '2025-11-10', proximoMantenimiento: '2025-11-18' },
];

export const semillas = [
  { id: 1, tipo: 'Maíz Híbrido DK-390', cantidad: '500 kg', proveedor: 'AgroSemillas SA', costo: 8500 },
  { id: 2, tipo: 'Soja RR2', cantidad: '300 kg', proveedor: 'Semillas del Campo', costo: 6200 },
];

export const plagas = [
  { id: 1, nombre: 'Cogollero del maíz', nivel: 'Medio', ubicacion: 'Parcela Norte A', fecha: '2025-11-10', tratamiento: 'Químico' },
  { id: 2, nombre: 'Roya asiática', nivel: 'Bajo', ubicacion: 'Parcela Sur B', fecha: '2025-11-12', tratamiento: 'Preventivo' },
];

export const riego = [
  { id: 1, parcela: 'Parcela Norte A', tipo: 'Goteo', ultimoRiego: '2025-11-13', proximoRiego: '2025-11-15', consumoAgua: '25000 L' },
  { id: 2, parcela: 'Parcela Sur B', tipo: 'Aspersión', ultimoRiego: '2025-11-12', proximoRiego: '2025-11-14', consumoAgua: '18000 L' },
];

export const fertilizantes = [
  { id: 1, nombre: 'NPK 15-15-15', cantidad: '2000 kg', fechaAplicacion: '2025-11-05', parcela: 'Parcela Norte A', costo: 15000 },
  { id: 2, nombre: 'Urea 46%', cantidad: '1500 kg', fechaAplicacion: '2025-11-08', parcela: 'Parcela Sur B', costo: 9500 },
];

export const campanas = [
  {
    id: 1,
    nombre: 'Campaña 1 (Abril - Julio)',
    fechaInicio: '2025-04-01',
    fechaFin: '2025-07-31',
    hectareas: 20,
    lotes: 3,
    inversionTotal: 50000,
    gastosOperativos: 32000,
    ingresoTotal: 90000,
    rendimientoHa: 7.5,
    produccionTotal: 150,
  },
  {
    id: 2,
    nombre: 'Campaña 2 (Agosto - Diciembre)',
    fechaInicio: '2025-08-01',
    fechaFin: '2025-12-15',
    hectareas: 18,
    lotes: 2,
    inversionTotal: 43000,
    gastosOperativos: 29000,
    ingresoTotal: 82000,
    rendimientoHa: 6.8,
    produccionTotal: 122,
  },
];

export const calcularLiquidacion = (trabajador) => {
  const salarioBruto = trabajador.salario;
  const horasExtras = trabajador.horasTrabajadas > 160
    ? (trabajador.horasTrabajadas - 160) * (trabajador.salario / 160 * 1.5)
    : 0;
  const deducciones = salarioBruto * 0.12;
  const salarioNeto = salarioBruto + horasExtras - deducciones;
  return { salarioBruto, horasExtras, deducciones, salarioNeto };
};

export const getEstadoColor = (estado) => {
  const colores = {
    'Activa': 'bg-green-100 text-green-800',
    'Activo': 'bg-green-100 text-green-800',
    'Operativo': 'bg-green-100 text-green-800',
    'En preparación': 'bg-blue-100 text-blue-800',
    'Mantenimiento': 'bg-yellow-100 text-yellow-800',
    'Inactivo': 'bg-gray-100 text-gray-800',
    'Cosechada': 'bg-gray-100 text-gray-800',
  };
  return colores[estado] || 'bg-gray-100 text-gray-800';
};

export const getNivelColor = (nivel) => {
  const colores = {
    'Bajo': 'bg-green-100 text-green-800',
    'Medio': 'bg-yellow-100 text-yellow-800',
    'Alto': 'bg-red-100 text-red-800',
  };
  return colores[nivel] || 'bg-gray-100 text-gray-800';
};
