# Addendum — Ribbon-Funnel unificado

Este documento **reemplaza y tiene prioridad** sobre lo que diga `MANUAL_OBRA.md` en los pasos 3 y 4 (Ribbon ejecutivo / Funnel de adopción) y sobre la mención de "Triple Lente" en cualquier parte de ese documento. Todo lo demás en `MANUAL_OBRA.md` (contrato de datos, stack, pasos 1-2 y 5-9, límites) sigue vigente sin cambios — este addendum solo toca el ribbon y el funnel.

Léelo junto con `MANUAL_OBRA.md`, después de él.

---

Los KPIs y el embudo dejan de ser dos componentes en dos filas. Es **una sola fila**, del mismo ancho y alto que ocupaba hoy la fila de 4 tarjetas KPI (~150–180px) — la card de "Customer Conversion Funnel" completa desaparece como fila aparte. Ahí está el ahorro vertical real, no en comprimir esta fila al mínimo.

**Las 2 tarjetas de volumen (Readymix / Bulk Cement) se eliminan de esta fila** (confirmado: el lente aquí es doble — Clientes / Pedidos — no triple). El volumen **sigue existiendo en el resto del proyecto** (Action Drawer, ordenamiento de clientes por volumen, jerarquía) — solo sale de esta fila específica, no del contrato de datos completo. El ancho que liberan las 2 tarjetas de volumen no se desperdicia: es exactamente donde van las etapas 2 y 3 del embudo. Resultado: 4 columnas en la misma fila, cada una una etapa completa, dos renglones cada una — ya no hace falta esconder la segunda dimensión en un popover.

**Las 4 etapas, cada una con 2 renglones (primario + secundario):**
1. **Universo asignado** — primario: # clientes. Secundario: # órdenes totales de ese universo.
2. **Onboarded** — primario: # clientes onboardeados *a la fecha del mes seleccionado* (stock) + delta `▲+N este mes` (flujo, altas netas de ese mes — dos preguntas distintas, las dos caben aquí). Secundario: # órdenes de esos clientes. (Nota de nombre: esto es lo que `MANUAL_OBRA.md` llamaba "Incorporado" — mismo concepto, nombre actualizado a "Onboarded" en toda esta pieza.)
3. **Activos** — primario: # clientes activos, mismo tratamiento stock/flujo. Secundario: # órdenes de esos clientes.
4. **Adopción digital** — primario: % de pedidos digitales, mayor peso tipográfico que las demás (es la más importante). Secundario: # órdenes digitales / # órdenes totales.

**Navegación mensual + tooltip de definición:** sigue viviendo por etapa (clic o hover en el número), ya no como único lugar donde ver la segunda dimensión — ahora es solo para el detalle histórico mes a mes, no para ver clientes+órdenes (eso ya está siempre visible).

**Entre cada par de etapas:** indicador de caída (%). La transición con la peor conversión del corte actual se pinta en ámbar/rojo, las otras en neutro — se recalcula dinámicamente al cambiar mercado/región/filtro, nunca es fija. Responde "¿dónde está el cuello de botella?" sin que el usuario haga cuentas.

**Sticky:** ya no es la prioridad. Con esta fila reemplazando dos filas completas + gráfica de tendencia reducida a sparkline, es probable que todo el stack quepa en una pantalla sin scroll — en ese caso el sticky sobra. Verificar primero si cabe; solo si no cabe, aplicar `position: sticky; top:0` a esta fila (mismos cuidados de `overflow` en ancestros que ya aplicaron para el bug de la animación de columnas).

**Tarjetas de navegación (jerarquía):** mismo patrón headline+detalle-secundario: el % manda visualmente (barra tipo bullet graph), el conteo crudo va como texto chico entre paréntesis debajo — nunca como línea que compite en jerarquía visual.
```
Onb  75% ▬▬▬▬░  (21/28 cli)
Adop 61% ▬▬▬░░  (126 ord)
```

**Poda confirmada en la tabla de detalle:** fuera "Order Based Adoption Breakdown" y "Selected Scope" — ruido redundante con la tira y el breadcrumb. Los tooltips de definición de negocio (ya especificados en el paso 9 de `MANUAL_OBRA.md`) se anclan directo en las etiquetas Onb/Adop de cada tarjeta, sustituyendo la necesidad de esas filas explicativas.

**Móvil (afecta el paso 8 de `MANUAL_OBRA.md`):** la fila unificada de 4 etapas se apila en columna en vez de colapsar a "una línea con el % dominante" (eso ya no aplica, era del diseño viejo de ribbon+funnel separados). Cada etapa ocupa su propio bloque completo (headline + secundario), apiladas verticalmente, con el mismo criterio de toque mínimo 44px del resto del documento.
