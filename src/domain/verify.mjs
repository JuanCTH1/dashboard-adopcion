import { generateDataset } from './mockGenerator.js';
import { adopcionRepo } from './adopcionRepo.js';
import { validateVolumeCompatibility } from './aggregation.js';

console.log('--- VERIFICACION DE FASE 1: CAPA DE DOMINIO ---');

// 1. Estructura
const dataset = generateDataset(20260828);
console.log('VPs:', dataset.VPS.length, '(esperado 2)');
console.log('Directores:', dataset.DIRECTORES.length, '(esperado 4)');
console.log('Gerentes:', dataset.GERENTES.length, '(esperado 12)');
console.log('Vendedores:', dataset.VENDEDORES.length, '(esperado 50)');
console.log('Clientes:', dataset.CLIENTES.length, '(esperado ~1300)');
console.log('Meses:', dataset.MESES.length, '(esperado 24)');

// 2. Determinismo
const dataset2 = generateDataset(20260828);
const isDeterministic = dataset.CLIENTES[0].volumenBase === dataset2.CLIENTES[0].volumenBase &&
                        dataset.CLIENTES[100].id === dataset2.CLIENTES[100].id;
console.log('Determinismo:', isDeterministic ? 'OK' : 'FALLO');

// 3. Pareto 20/75
const clientesOrdenados = [...dataset.CLIENTES].sort((a, b) => b.volumenBase - a.volumenBase);
const totalVol = clientesOrdenados.reduce((s, c) => s + c.volumenBase, 0);
const top20Count = Math.round(clientesOrdenados.length * 0.20);
const volTop20 = clientesOrdenados.slice(0, top20Count).reduce((s, c) => s + c.volumenBase, 0);
const pctPareto = ((volTop20 / totalVol) * 100).toFixed(1);
console.log('Distribucion Pareto (Top 20%):', pctPareto + '% del volumen total (esperado 70%-80%)');

// 4. Sumas de abajo hacia arriba
const nac = adopcionRepo.getMetricasGlobales();
const vps = adopcionRepo.getJerarquia('nacional');
const sumaVpsPedidos = vps.reduce((s, v) => s + v.metricas.pedidos.totales, 0);
const sumaVpsClientes = vps.reduce((s, v) => s + v.metricas.clientes.asignados, 0);
console.log('Cuadre Jerarquico Pedidos: Nacional =', nac.actual.pedidos.totales, 'Suma VPs =', sumaVpsPedidos, (nac.actual.pedidos.totales === sumaVpsPedidos ? 'OK' : 'MISMATCH'));
console.log('Cuadre Jerarquico Clientes: Nacional =', nac.actual.clientes.asignados, 'Suma VPs =', sumaVpsClientes, (nac.actual.clientes.asignados === sumaVpsClientes ? 'OK' : 'MISMATCH'));

// 5. Incompatibilidad de volumen
const vIncompat = validateVolumeCompatibility([
  { lineaNegocio: 'readymix' },
  { lineaNegocio: 'cemento' }
]);
console.log('Validacion m3 vs tons (incompatible):', !vIncompat.compatible ? 'OK (Deshabilitado)' : 'FALLO');

// 6. Funnel
const funnel = adopcionRepo.getFunnel({}, 'clientes');
console.log('Funnel 4 pasos:');
funnel.forEach(p => console.log('  Paso ' + p.paso + ': ' + p.etiqueta + ' = ' + p.valor + (p.esPorcentaje ? '%' : '') + ' (Caida: ' + p.dropOffPct.toFixed(1) + '%)'));

// 7. Action Drawer
const action = adopcionRepo.getTopClientesAccion({}, 5);
console.log('Action Drawer Top Clientes sin cuenta:', action.sinIncorporar.length, 'cuentas (Top 1:', action.sinIncorporar[0]?.id, '-', action.sinIncorporar[0]?.volumen, 'unidades)');
console.log('Action Drawer Top Clientes revertidos/inactivos:', action.inactivosORevertidos.length, 'cuentas (Top 1:', action.inactivosORevertidos[0]?.id, '-', action.inactivosORevertidos[0]?.volumen, 'unidades)');
console.log('--------------------------------------------------');
