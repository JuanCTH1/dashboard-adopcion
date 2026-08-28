# Manual de Obra — Dashboard Adopción CX

Especificación de ejecución. Léela completa antes de escribir código. No asumas nada que no esté aquí — si algo parece incompleto o contradictorio, pregunta antes de decidir por tu cuenta.

## Qué se construye y para qué

Un tablero de adopción digital para una organización comercial de materiales de construcción. Responde tres preguntas en orden descendente de jerarquía: **¿cómo va la adopción?** (directivo), **¿quién va rezagado?** (gerencial), **¿a quién le hablo el lunes?** (vendedor).

Es una **demostración con datos sintéticos**, no un piloto. No hay backend, no hay autenticación, no hay datos reales. El objetivo es que se vea y se sienta como producto terminado.

**El criterio de éxito no es que compile: es que alguien lo abra en un teléfono y quiera usarlo.** Todo lo que sigue está subordinado a eso.

---

## Contrato de datos

Números cerrados. No se negocian ni se "mejoran" — son deliberadamente sintéticos.

### Estructura organizacional

| Nivel | Cantidad | Regla |
|---|---|---|
| VP | 2 | VP Oeste, VP Este |
| Director | 4 | 2 por VP |
| Gerente | 12 | 3 por director |
| Vendedor | 50 | 4–5 por gerente |
| Cliente | ~1,300 | 20–30 por vendedor, ID anónimo tipo `CLI-04821` |
| Periodo | 24 meses | Termina en el mes actual |

### Geografía — Estados Unidos, inventada

**6 regiones:** Pacific Northwest, California, Southwest, Texas, Midwest, Southeast.

**18 plazas:** Seattle, Portland, Sacramento, Los Angeles, San Diego, Phoenix, Tucson, Albuquerque, Dallas, Houston, Austin, San Antonio, Chicago, Detroit, Minneapolis, Atlanta, Orlando, Charlotte.

### Líneas de negocio y unidades

| Línea | Unidad | Peso |
|---|---|---|
| Readymix | m³ | ~55% de clientes |
| Cemento | toneladas | ~30% |
| Agregados | toneladas | ~15% |

**Regla dura: m³ y toneladas nunca se suman.** El lente de volumen opera *dentro* de una línea, o muestra las tres por separado. Si el filtro cruza líneas, el lente de volumen se deshabilita con un mensaje que lo explique — no se inventa una unidad común. Esto es correcto de negocio y además se ve profesional.

### Distribución de volumen

- Volumen mensual por cliente: **log-normal**, mediana ≈ 5,000, rango 2,000–50,000.
- **Pareto obligatorio:** el 20% de los clientes concentra ≈ 75% del volumen. Sin esto el Action Drawer no tiene gracia y el lente de volumen no dice nada distinto al de clientes.
- Estacionalidad suave: −15% en invierno en regiones del norte.

### Adopción

| Parámetro | Valor | Nota |
|---|---|---|
| Clientes incorporados (global) | ~72% | Varianza fuerte por vendedor: 30%–98% |
| De incorporados, activos | ~65% | Aquí está el hueco que cuenta la historia |
| Share of wallet digital (de activos) | media 68% | Los clientes son híbridos, no binarios |
| Tendencia mensual | +1.2 pp | Con ruido; algunos vendedores planos o a la baja |
| FTTV (días a primer pedido digital) | mediana 12 | Cola larga; 18% nunca activan |
| Reversión analógica mensual | ~4% | Activos que vuelven al canal análogo |

### Canales digitales

Portal web 70% · App móvil 26% · EDI/API 4%.

Los tres cuentan como pedido digital, pero **se guardan diferenciados** y el tablero permite ver el desglose. Razón: un cliente integrado por EDI es digital sin que el vendedor haya hecho nada, y esa distinción va a importar en cuanto alguien mire los rankings.

### Definiciones — propuestas, no verdades

"Incorporado" y "activo" **aún no están definidos por el negocio**. Se implementan como constantes en un solo archivo (`src/domain/definiciones.js`) y se muestran en el tooltip de cada métrica con la etiqueta "definición propuesta". Cambiarlas después debe ser una línea, nunca una refactorización.

Propuesta inicial: **Incorporado** = completó el proceso de onboarding, sea lo que sea que eso incluya. **Activo** = al menos un pedido digital en los últimos 90 días. Se ofrece un selector de ventana (30 / 90 días) porque los dos números cuentan historias distintas y conviene que se vea.

---

## Stack y sistema de diseño

Vite + React 19 + Tailwind v4 + shadcn/ui + Recharts + lucide-react. Build 100% estático: sin SSR, sin Next.js, sin servidor en runtime.

### Tipografía

**Barlow** para todo (es la del sistema de penetron-dash) y una monoespaciada con `tabular-nums` para columnas numéricas. No usar Inter.

### Mapeo de tokens: Material Design 3 → shadcn

El sistema de color viene del `index.css` de penetron-dash, que usa variables MD3. shadcn espera otros nombres. El mapeo va en `globals.css`, definiendo el par claro/oscuro completo:

```
--background      ← md-sys-color-background
--foreground      ← md-sys-color-on-background
--card            ← md-sys-color-surface
--card-foreground ← md-sys-color-on-surface
--popover         ← md-sys-color-surface
--primary         ← md-sys-color-primary
--primary-foreground ← md-sys-color-on-primary
--muted           ← md-sys-color-surface-variant
--muted-foreground← md-sys-color-on-surface-variant
--border          ← md-sys-color-outline-variant
--input           ← md-sys-color-outline-variant
--ring            ← md-sys-color-primary
--chart-1..8      ← CAT_LIGHT / CAT_DARK de theme.js
--radius          ← 0.75rem
```

`theme.js` de penetron-dash se porta **sin modificar**: su paleta de gráficas está calibrada para contraste en claro y oscuro y es mejor que los defaults de shadcn. El hook `useChartTheme()` sigue siendo la fuente de color para todo Recharts.

### Modo oscuro

Por clase en `<html>` con `@custom-variant dark`, igual que penetron-dash. No por `prefers-color-scheme` directo.

### Móvil

Un **único** hook `use-mobile` con un solo breakpoint (768px). No replicar `window.innerWidth` en cada componente — ese es precisamente el bug heredado que este proyecto existe para no repetir.

---

## Orden de construcción

Secuencial. Cada paso tiene criterio de aceptación: si no se cumple, no se avanza.

### 1. Generador de datos y capa de dominio

El generador produce la organización completa según el contrato de arriba, con semilla fija para que los números no cambien entre recargas. Junto a él, `adopcionRepo` con la interfaz de consulta y las funciones puras de agregación.

**Aceptación:** los totales cuadran de abajo hacia arriba — la suma de carteras de vendedor iguala el total de su gerente, y así hasta el nacional. El Pareto es verificable: ordenar clientes por volumen y confirmar que el primer 20% acumula ~75%.

### 2. Scaffold con los tokens ya mapeados

Vite + Tailwind v4 + shadcn instalados, mapeo de color completo, Barlow cargada, modo oscuro funcionando, `theme.js` portado.

**Aceptación:** una pantalla con tres tarjetas y un botón ya debe verse como penetron-dash, en claro y en oscuro. Si se ve como shadcn genérico, el mapeo está incompleto y no se avanza.

### 3. Ribbon ejecutivo y Triple Lente

Franja superior fija con KPIs compactos: % de adopción con delta contra mes anterior, pedidos totales / digitales / análogos, clientes en cartera / incorporados / activos. Sparkline de 12 puntos en el KPI principal. El selector de lente (Pedidos · Clientes · Volumen) recalcula todo en memoria.

**Aceptación:** cambiar de lente no muestra ningún indicador de carga. Debe sentirse instantáneo, porque lo es.

### 4. Funnel de adopción

Tira horizontal de cuatro pasos: Asignados → Incorporados → Activos → % digital. Cada paso muestra el número absoluto y la caída porcentual respecto al anterior. Responde al lente y al nivel seleccionado.

**Aceptación:** con un vendedor seleccionado debe leerse de un vistazo dónde se rompe su cartera — si no incorpora, o si incorpora y no usan.

### 5. Jerarquía con drill-down

Tabla por nivel con migas de pan siempre visibles. Columnas: nombre, pedidos totales / digitales / análogos, % de adopción con bullet graph, incorporados, no incorporados. Clic en una fila baja de nivel y reencuadra toda la pantalla. Los filtros persisten al navegar.

**Aceptación:** bajar cuatro niveles y volver con las migas sin perder filtros ni lente.

### 6. Action Drawer — la pieza que gana la demo

Panel lateral que responde a la fila seleccionada. Dos listas ordenadas por volumen descendente: **clientes sin incorporar** y **clientes que dejaron de usar la plataforma**. Cada renglón muestra el volumen que representa. Botón de copiar la lista y de exportar.

**Aceptación:** es la primera cosa que se enseña en la demo. Si no se entiende sin explicación, rehacerla.

### 7. Buscador global y exportación

Ctrl+K abre un buscador que salta a cualquier vendedor, gerente, plaza o cliente. Exportar a CSV respeta filtros, lente y nivel actual.

**Aceptación:** llegar a un vendedor específico en un solo gesto desde cualquier punto.

### 8. Móvil

Columna única. Ribbon colapsa a una línea con el % dominante. Funnel en vertical. Tabla convertida en tarjetas apiladas. Action Drawer sube como hoja inferior. Objetivos de toque mínimo 44px.

**Aceptación:** un vendedor puede ver su cartera y su lista de clientes a recuperar en un teléfono, de pie, sin hacer zoom. Este paso no es opcional — es la mitad del argumento.

### 9. Tooltips de definición y estados vacíos

Cada métrica lleva su definición de negocio accesible desde la etiqueta, marcando cuáles son propuestas pendientes de confirmar. Estados vacíos y de carga con texto útil, no un spinner mudo.

**Aceptación:** un gerente que nunca vio el tablero entiende qué significa "activo" sin preguntarle a nadie.

---

## Límites que no se cruzan

| No | Por qué |
|---|---|
| **No** gráficos de pastel ni gauges circulares | Comparación angular pobre y desperdicio de espacio. Barras apiladas normalizadas y bullet graphs. |
| **No** `fetch` dentro de componentes | Todo pasa por `adopcionRepo`. Es lo que permite conectar datos reales cambiando un archivo. |
| **No** otra librería de gráficas | Recharts, la misma de penetron-dash. Coherencia y menos peso. |
| **No** Next.js ni SSR | El build debe ser estático para poder desplegarse en cualquier lado, incluido Snowpark Container Services. |
| **No** sumar m³ con toneladas | Es incorrecto de negocio y lo van a notar. |
| **No** cambiar paleta ni tipografía | El punto del proyecto es probar que el sistema de penetron-dash sobrevive a shadcn. |
| **No** inventar métricas nuevas | El contrato de arriba es cerrado. Ideas adicionales se anotan, no se construyen. |
| **No** nombres de clientes que parezcan reales | IDs anónimos tipo `CLI-04821`. Los datos son sintéticos y debe ser evidente. |

---

## Arquitectura de datos — por qué existe `adopcionRepo`

No hay backend, pero el frontend no debe hardcodear su fuente de datos. Todo componente consulta a través de una interfaz (`adopcionRepo.getJerarquia(filtros)`, `adopcionRepo.getCartera(vendedorId)`, `adopcionRepo.getSerie(periodo)`) implementada hoy por `mockRepo` sobre el generador sintético. El día que haya datos reales, se escribe una implementación nueva de esa misma interfaz y no se toca ni un componente. Esto no es sobreingeniería: es una interfaz y una implementación, y es menos código que tener `fetch` regado en doce archivos.

Con ~1,300 clientes × 24 meses (≈36k filas), todo cabe en memoria del navegador sin problema — por eso cambiar de lente, filtro o nivel debe sentirse instantáneo, sin llamadas de red.

---

## Prompt de arranque

```
Vamos a construir un dashboard de adopción digital comercial.
La especificación completa está en este documento (MANUAL_OBRA.md) —
léela entera antes de escribir código y no asumas nada que no esté ahí.

Contexto en una línea: es una demostración con datos sintéticos,
sin backend, que debe verse y sentirse como producto terminado,
y funcionar en teléfono.

Arranca por el paso 1 (generador de datos y capa de dominio).
No avances al paso siguiente hasta cumplir su criterio de
aceptación, y dímelo explícitamente cuando lo cumplas.

Si algo de la especificación te parece incompleto o contradictorio,
pregunta antes de decidir por tu cuenta.
```
