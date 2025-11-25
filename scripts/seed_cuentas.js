// Script para poblar cuentas contables de ejemplo
require('dotenv').config();
const { init } = require('../db');
const CuentaModel = require('../models/cuenta');

(async () => {
  try {
    const db = await init();
    const Cuenta = CuentaModel(db);

    // Cuentas de ejemplo basadas en plan contable básico
    const cuentas = [
      // ACTIVOS
      { codigo: '1010', nombre: 'Caja', tipo: 'activo', clase: 'Disponibilidades' },
      { codigo: '1020', nombre: 'Bancos', tipo: 'activo', clase: 'Disponibilidades' },
      { codigo: '1030', nombre: 'Cuentas por Cobrar', tipo: 'activo', clase: 'Deudores' },
      { codigo: '1040', nombre: 'Inventario de Mercancías', tipo: 'activo', clase: 'Existencias' },
      
      // PASIVOS
      { codigo: '2010', nombre: 'Cuentas por Pagar', tipo: 'pasivo', clase: 'Acreedores' },
      { codigo: '2020', nombre: 'Impuestos por Pagar', tipo: 'pasivo', clase: 'Obligaciones' },
      { codigo: '2030', nombre: 'Deuda a Largo Plazo', tipo: 'pasivo', clase: 'Obligaciones' },
      
      // CAPITAL
      { codigo: '3010', nombre: 'Capital', tipo: 'capital', clase: 'Patrimonio' },
      { codigo: '3020', nombre: 'Ganancias Retenidas', tipo: 'capital', clase: 'Patrimonio' },
      
      // INGRESOS
      { codigo: '4010', nombre: 'Ventas de Mercancías', tipo: 'ingreso', clase: 'Ingresos Operacionales' },
      { codigo: '4020', nombre: 'Servicios Prestados', tipo: 'ingreso', clase: 'Ingresos Operacionales' },
      { codigo: '4030', nombre: 'Ingresos por Intereses', tipo: 'ingreso', clase: 'Otros Ingresos' },
      
      // COSTOS
      { codigo: '5010', nombre: 'Costo de Ventas', tipo: 'costo', clase: 'Costos Directos' },
      { codigo: '5020', nombre: 'Compra de Mercancías', tipo: 'costo', clase: 'Costos Directos' },
      
      // GASTOS
      { codigo: '6010', nombre: 'Sueldos y Salarios', tipo: 'gasto', clase: 'Gastos Administrativos' },
      { codigo: '6020', nombre: 'Arrendamiento', tipo: 'gasto', clase: 'Gastos Administrativos' },
      { codigo: '6030', nombre: 'Servicios Públicos', tipo: 'gasto', clase: 'Gastos Administrativos' },
      { codigo: '6040', nombre: 'Gastos de Venta', tipo: 'gasto', clase: 'Gastos de Venta' },
      { codigo: '6050', nombre: 'Depreciación', tipo: 'gasto', clase: 'Gastos Administrativos' },
    ];

    let created = 0;
    for (const cuenta of cuentas) {
      try {
        await Cuenta.crear(cuenta);
        created++;
        console.log(`✓ Cuenta creada: ${cuenta.codigo} - ${cuenta.nombre}`);
      } catch (err) {
        if (err.message.includes('UNIQUE')) {
          console.log(`↻ Cuenta ya existe: ${cuenta.codigo}`);
        } else {
          console.error(`✗ Error: ${err.message}`);
        }
      }
    }

    console.log(`\nResumen: ${created}/${cuentas.length} cuentas creadas`);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
