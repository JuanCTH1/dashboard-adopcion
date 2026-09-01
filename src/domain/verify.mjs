import { generateDataset } from './mockGenerator.js';
import { adopcionRepo } from './adopcionRepo.js';
import { validateVolumeCompatibility } from './aggregation.js';

console.log('--- VERIFICACION DE RENDIMIENTO Y CAPA DE DOMINIO ---');

// 1. Estructura
const dataset = generateDataset(20260828);
console.log('VPs:', dataset.VPS.length, '(esperado 3)');
console.log('Regiones:', dataset.REGIONES.length, '(esperado 4)');
console.log('Directores:', dataset.DIRECTORES.length, '(esperado 12)');
console.log('Gerentes:', dataset.GERENTES.length, '(esperado 144, 48 mercados x 3 lineas)');
console.log('Vendedores:', dataset.VENDEDORES.length, '(variable por tier de mercado)');
console.log('Clientes:', dataset.CLIENTES.length, '(variable)');
console.log('Meses:', dataset.MESES.length, '(esperado 36)');
console.log('Transacciones:', dataset.TRANSACCIONES.length);

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
console.log('Distribucion Pareto Volumen (Top 20%):', pctPareto + '% del volumen total (esperado ~70-80%)');

const pedidosPorCliente = new Map();
dataset.TRANSACCIONES.forEach(t => {
  pedidosPorCliente.set(t.clienteId, (pedidosPorCliente.get(t.clienteId) || 0) + t.pedidosTotales);
});
const pedidosOrdenados = [...pedidosPorCliente.values()].sort((a, b) => b - a);
const totalPedidosGen = pedidosOrdenados.reduce((s, v) => s + v, 0);
const top20CountPedidos = Math.round(pedidosOrdenados.length * 0.20);
const pedidosTop20 = pedidosOrdenados.slice(0, top20CountPedidos).reduce((s, v) => s + v, 0);
console.log('Distribucion Pareto Pedidos (Top 20% clientes):', ((pedidosTop20 / totalPedidosGen) * 100).toFixed(1) + '% de los pedidos totales (esperado ~65-85%)');

const maxCeiling = Math.max(...dataset.CLIENTES.map(c => c.adoptionCeiling));
console.log('Techo maximo de adopcion individual:', (maxCeiling * 100).toFixed(1) + '% (esperado <= 90%)');

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
funnel.forEach((p, idx) => console.log('  Paso ' + (idx + 1) + ': ' + p.stepName + ' = ' + p.count + ' ' + p.unit + (p.dropOffPct !== undefined ? ' (Drop: ' + p.dropOffPct + '%)' : '')));

// 7. Action Drawer
const action = adopcionRepo.getTopClientesAccion({}, 5);
console.log('Action Drawer Top Clientes sin cuenta:', action.sinIncorporar.length, 'cuentas (Top 1:', action.sinIncorporar[0]?.id, '-', action.sinIncorporar[0]?.volumenMes, 'unidades)');
console.log('Action Drawer Top Clientes revertidos/inactivos:', action.inactivosORevertidos.length, 'cuentas (Top 1:', action.inactivosORevertidos[0]?.id, '-', action.inactivosORevertidos[0]?.volumenMes, 'unidades)');

// 8. Benchmark de Velocidad de Consultas
console.log('\n--- BENCHMARK DE VELOCIDAD ---');
const t0 = performance.now();
for (let i = 0; i < 50; i++) {
  adopcionRepo.getMetricasGlobales({ vpIds: ['vp-readymix'] });
  adopcionRepo.getJerarquia('vp', ['vp-readymix']);
  adopcionRepo.getJerarquia('director', ['Atlantic']);
  adopcionRepo.getJerarquia('gerente', ['New York']);
  adopcionRepo.getCartera(null, { vpIds: ['vp-readymix'] });
  adopcionRepo.getLeaderboard({ vpIds: ['vp-readymix'] });
}
const t1 = performance.now();
const avgMs = (t1 - t0) / 50;
console.log(`50 ciclos completos de render ejecutados en ${(t1 - t0).toFixed(2)}ms (Promedio: ${avgMs.toFixed(3)}ms por ciclo completo)`);
console.log('--------------------------------------------------');

