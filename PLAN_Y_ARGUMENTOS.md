# Plan de Arranque Adopción CX

Fusión de dos análisis independientes (Claude + Gemini/Antigravity), contrastada contra el código real de `penetron-dash` y contra la literatura de diseño de tableros y adopción digital.

---

## Primero: qué de todo esto está verificado

Antes de fusionar nada, se leyó el código de `penetron-dash` para comprobar las afirmaciones que Gemini hizo sobre el repo. Un plan construido sobre una descripción inventada del stack se cae en la primera hora de trabajo.

| Afirmación | Estado | Evidencia |
|---|---|---|
| React 19 + Vite + Tailwind v4 + Recharts + Lucide + Framer Motion | **Correcto** | webapp/package.json |
| `theme.js` con tokens `OK / BAD / MUT` | **Correcto** | src/lib/theme.js |
| Paleta calibrada light/dark para gráficas | **Correcto**, y mejor de lo descrito | CAT_LIGHT / CAT_DARK / useChartTheme() |
| Componentes de alta densidad (KPI, DataTable, FilterListbox) | **Correcto** | src/components/ |
| Nombres de modelos citados ("Claude 3.7 Sonnet", "Gemini 3.7 Pro") | **Inexistentes** | — |

**Nota de calibración.** Gemini describió el repo con precisión — crédito donde toca. Pero inventó con la misma confianza nombres de modelos que no existen. La lectura práctica: cuando afirme algo verificable, verificarlo; su tono de seguridad es idéntico esté acertando o rellenando. Aplica igual para Claude, y por eso todo lo técnico de este documento lleva su fuente al lado.

---

## La fusión: qué gana de cada lado

### Donde Gemini es mejor y se adopta

**El Action Drawer — la lista de clientes a recuperar.** *(Gemini · adoptado como MUST)*
Es la mejor idea del documento original. Al hacer clic en cualquier fila de la jerarquía, un panel lateral muestra los clientes de mayor volumen que no están incorporados o que dejaron de usar la plataforma. Convierte el tablero de *reporte que se mira* a *herramienta que se usa el lunes en la junta de cartera*. Es también el argumento más fuerte frente a Snowflake Cortex, porque un generador de dashboards produce gráficas, no listas de trabajo priorizadas.

**Triple Lente en vez de doble toggle.** *(Gemini · adoptado como MUST)*
El documento original pedía alternar entre "por clientes" y "por pedidos". Gemini agrega el tercero: **ponderado por volumen**. Ese es el que contesta la pregunta que el documento hace y no sabe cómo responder: "¿los clientes que no se incorporaron son relevantes o marginales?". Con dos lentes esa pregunta queda huérfana.

**Bullet graphs, no gauges · descartar pie charts · Ctrl+K.** *(Gemini · adoptado)*
Las tres correctas. El bullet graph (invención de Stephen Few) mete valor real, meta y rango cualitativo en 16px de alto — cabe donde un gauge circular no. El pie chart pierde en comparación angular y se sustituye por barras apiladas normalizadas. Con cinco niveles de jerarquía, un buscador global no es adorno: es la diferencia entre nueve clics y uno.

**FTTV y "reversión analógica" en vez de una métrica genérica de recencia.** *(Gemini · adoptado, más específico)*
La propuesta original de Claude era: "activo" como binario es más pobre que el estándar de la industria, medir recencia o frecuencia. Gemini aterrizó eso en dos métricas concretas y mejores: **días entre incorporación y primer pedido digital** (si pasan de 30, el onboarding fracasó aunque el contador diga "incorporado"), y **clientes que compraban digital y volvieron al teléfono**. La segunda es la fuga que ningún tablero de adopción suele ver.

### Donde se sostiene la posición original

**El benchmark de 37% — corregido a la baja.** *(Claude, mal calibrado, corregido)*
Se trajo el dato de que la tasa de activación promedio en B2B SaaS ronda el 37%. Es real, pero aplicarlo aquí sería mala metodología: ese número sale de productos self-serve donde el usuario se activa solo. Aquí hay una fuerza de ventas empujando y un producto que el cliente necesita para operar. Los pisos son estructuralmente distintos. Se queda como **contexto de conversación**, nunca como meta ni como línea de semáforo. La meta debe salir del propio histórico del negocio.

**El "todo en una pantalla" se reta — y con respaldo, no con opinión.** *(Claude + Gemini coinciden · confirmado por literatura)*
Few define la pantalla única para el **monitoreo**, no para el análisis completo. El estándar documentado para el detalle es *progressive disclosure* — resumen arriba, detalle bajo demanda. Forzar jerarquía de cinco niveles, funnel, KPIs y filtros en 800px no cumple el requisito: lo rompe, porque vuelve ilegible justo lo que se quería ver de un vistazo. La solución (ribbon ejecutivo fijo + master-detail 70/30) tiene un beneficio extra: el resumen queda **siempre** visible, que era el requisito real detrás de la petición.

---

## Tu problema de consistencia en penetron-dash tiene causa concreta

Se leyó el código y la causa no es falta de disciplina. Es arquitectónica.

### El sistema tiene tres capas, no una

| Capa | Qué contiene | Cómo se consume | Diagnóstico |
|---|---|---|---|
| `index.css` | Tailwind v4 `@theme`, variables Material Design 3, `@custom-variant dark` por clase | Variables CSS + utilities | **Sana.** Se conserva. |
| `theme.js` | Paleta de dataviz light/dark calibrada, `useChartTheme()`, tokens `OK/WARN/BAD` | Hook de React | **Sana y valiosa.** Se porta tal cual. |
| `designTokens.js` | `TOKENS.surfaces.card` = *string* de clases Tailwind | Concatenación de strings | **Aquí está la fuga.** |

La tercera capa guarda esto:

```
surfaces.card: "bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-xxs"
```

Es un string, y un string tiene tres problemas que no se arreglan con esfuerzo:

- **No se compone.** Si se necesita la misma tarjeta con otro padding, hay que concatenar y confiar en que Tailwind resuelva el conflicto en el orden esperado.
- **No se puede sobreescribir de forma predecible.** No hay precedencia declarada; hay orden de aparición.
- **Nada obliga a usarlo.** Un componente nuevo que escriba `className="bg-white border rounded-xl"` a mano se ve *casi* igual. Casi. Y nadie se entera hasta que están lado a lado.

Ese último punto es la inconsistencia. No es falta de disciplina: el sistema no tiene forma de notar cuando alguien no lo usó.

### Qué cambia con shadcn, exactamente

shadcn invierte el flujo: la variable vive en CSS (`--card`), Tailwind la expone como utility (`bg-card`), y las variantes se declaran con `cva` en el componente. Cambiar una variable cambia todo lo que la usa, porque **el token ES la utility**. Un componente no puede "olvidarse" del sistema sin que se vea que se lo saltó.

Crucialmente: **shadcn no trae una estética propia.** Es código que se copia al repo, sobre Radix + Tailwind. La paleta MD3, Barlow, `theme.js` calibrado y el look sobrio se quedan intactos. Lo único que se mapea son los nombres: las variables MD3 pasan a los nombres que shadcn espera (`--background`, `--card`, `--primary`, `--border`, `--ring`).

**Bonus encontrado de paso.** La detección de móvil está duplicada en al menos seis archivos — `ColumnPicker`, `DataTable`, `PricingMetricsTable`, `SalesCharts` y los charts, cada uno con su propio `useState` y su listener de `resize` contra `window.innerWidth < 768`. Y `Modal.jsx` usa 640 en lugar de 768, así que hay un rango de anchos donde el modal cree que es móvil y la tabla cree que no. shadcn resuelve esto con un `use-mobile` canónico, un solo breakpoint, un solo listener.

### La decisión

**Sí a shadcn — pero migrando la capa 3, no las capas 1 y 2.** La paleta de dataviz calibrada contra Tufte, Few y Datawrapper es mejor que cualquier default de shadcn; sería absurdo tirarla.

Y no se migra `penetron-dash` ahora. Se construye **Adopción CX shadcn-first**, con los tokens mapeados desde el día uno. Si el mapeo funciona y el resultado se ve y se siente como `penetron-dash`, entonces migrar `penetron-dash` deja de ser un acto de fe y pasa a ser una copia de algo que ya se vio funcionando. Este proyecto es el laboratorio, y sale gratis porque de todos modos hay que construirlo.

---

## Sin backend, sin simplificar: el puerto de datos

**Ningún componente hace `fetch`.** Todo pasa por un repositorio:

```
adopcionRepo.getJerarquia(filtros)
adopcionRepo.getCartera(vendedorId)
adopcionRepo.getSerie(periodo)
```

Hoy existe una implementación: `mockRepo`, que lee un dataset generado con distribución de Pareto realista. El día que se conecten datos reales, se escribe **una** implementación más y se cambia una línea:

| Si el dato vive en… | Se escribe | Cambios en componentes |
|---|---|---|
| Una API REST propia | `restRepo` | cero |
| Snowflake vía SQL API | `snowflakeRepo` | cero |
| Un export a CSV/Parquet | `fileRepo` | cero |
| Un JSON inyectado en el build | `embeddedRepo` | cero |

No es sobreingeniería: es una interfaz y dos implementaciones. Es *menos* código que hardcodear `fetch` en doce componentes, y es el argumento de venta más limpio: "el tablero ya está hecho, ustedes sólo enchufan su fuente".

**Y el segundo efecto: latencia cero.** Como toda la jerarquía y las carteras caben en memoria, cambiar de lente, de filtro o de nivel es una agregación en el cliente: milisegundos, sin spinner, sin round-trip al warehouse. Ese es el argumento técnico contra Cortex, y es demostrable en vivo.

---

## Dónde corre esto

| Opción | ¿Sirve? | Detalle |
|---|---|---|
| **Streamlit in Snowflake** | No aplica | Es Python renderizando su propia UI. No puede hospedar una app de React. Otro paradigma, no una limitación propia. |
| **Snowpark Container Services (SPCS)** | Sí | Un contenedor con nginx sirviendo el build estático, con URL pública. Es el camino que la propia documentación de Snowflake marca para data apps con frontend React. Requiere que lo tengan habilitado. |
| **Cualquier hosting estático + su API** | Sí | El más simple si su TI lo permite. |

**La decisión de arquitectura que mantiene abiertas las tres puertas:** el build es 100% estático. Sin SSR, sin Node en runtime, sin servidor propio. Un directorio de HTML, CSS y JS. Desplegable en literalmente cualquier lado — incluido SPCS.

---

## El argumento contra Snowflake Cortex

### Donde un SPA gana, sin discusión

- **Es una herramienta de ejecución, no una vista.** El Action Drawer no es una gráfica: es la lista de a quién le hablas el lunes. Los generadores de dashboards producen vistas.
- **Latencia.** Cambiar de lente o de nivel es una agregación en memoria: milisegundos, sin spinner. Un warehouse hace round-trip.
- **Interacciones coordinadas.** Pasar el cursor por una etapa del funnel y que se resalten las filas correspondientes es trivial en un SPA y no existe en un generador.
- **Control total de identidad visual** y de cada decisión de densidad tipográfica.
- **Vive en git, con pruebas.** Un dashboard generado no tiene tests ni historial de por qué una métrica se calcula así.

### El cableado no es una desventaja permanente — el dato que lo cierra

El argumento que van a usar es que con Cortex "lo conectas a datos vivos, publicas en tiempo real, ya no tienes que exportar nada". Es cierto para Cortex. **Pero también lo es para este tablero en cuanto vive en SPCS**, y el mecanismo exacto:

- Un contenedor en Snowpark Container Services recibe automáticamente un token OAuth en `/snowflake/session/token`. Snowflake lo provisiona solo.
- **No hay credenciales que administrar.** Nadie captura un usuario, nadie guarda un secreto, nadie rota nada a mano.
- El token vive **10 minutos** y se renueva automáticamente. Pasando `token_file_path`, el driver se encarga.
- La conexión va por la red interna de Snowflake. El contenedor autentica como el *service user*, dentro del perímetro.

**Traducción para la junta:** una vez desplegado, el cableado es automático y no hay paso de exportar ni de publicar. Exactamente la ventaja que le atribuyen a Cortex. La diferencia de "datos vivos" no es entre Cortex y esto — es entre estar desplegado y no estarlo, y eso se resuelve una sola vez.

**Y de pilón, gana en seguridad.** Credenciales que no existen no se filtran; tokens de 10 minutos con rotación automática son mejor postura que cualquier cadena de conexión guardada en algún lado. Si alguien de seguridad está en la sala, este punto vale más que todo el diseño.

### Donde el warehouse gana — decirlo antes que ellos

- Gobierno de datos, linaje y permisos a nivel de fila los resuelve él, no el SPA.
- Exploración ad-hoc: si mañana quieren cortar por una dimensión no anticipada, en el warehouse es una consulta y en el SPA es una fase de desarrollo.
- No hay código que mantener.

**El encuadre que gana la conversación:** "para una herramienta de ejecución táctica que un vendedor abre todos los lunes, un SPA gana; para exploración ad-hoc de datos, el warehouse gana — y no compiten, porque el warehouse puede ser justamente quien alimente a este tablero". Eso los deja sin contraargumento y sin sentir que se les está quitando su plataforma. Decir que Cortex es malo invita a que lo defiendan; decir esto invita a que den los datos.

### Por qué hacer las dos versiones (Claude y Coco), no sólo una

En la reunión ya dijeron explícitamente "pruébalo", "hazle el challenge", "hazlo por los dos lados" — comparando una versión con Claude y una con Cortex Code (Coco). Si sólo se presenta la versión de Claude, cualquiera puede decir "sí, pero no probaste Coco". Haciendo ambas, la comparación lado a lado argumenta sola, sin tener que decir una sola palabra despectiva de Coco — la conclusión la sacan ellos, que es más fuerte que afirmarla.

Sus argumentos a favor de Coco (datos vivos, tiempo real, sin exportar) son ciertos — pelear ahí es perder. El terreno donde ganar es el que nadie contestó en la reunión: **la experiencia**, no el pipeline de datos.

**Tres cosas donde la diferencia es estructural, no de esfuerzo:**

1. **El teléfono.** Dashboards de Streamlit en celular son miserables — no por falta de esfuerzo, sino por el framework. Abrir la demo en el teléfono frente a ellos cierra la conversación ahí.
2. **El Action Drawer.** Coco genera gráficas y filtros, no *herramientas*. Una lista priorizada con botón de copiar no es una visualización — es un flujo de trabajo.
3. **La velocidad de interacción.** Cambiar de lente sin un solo spinner. No explicarlo — hacerlo en vivo, tres veces seguidas.

**El titular es el tiempo.** Esperan semanas. Llegar en un día con ambas versiones hace el argumento antes de enseñar la primera pantalla.

---

## Alcance: MUST / guía / descartado

| Elemento | Clase | Razón |
|---|---|---|
| Funnel de 4 pasos con caídas entre etapas | MUST | Diagnóstico: distingue "no incorpora" de "incorpora y no usan". 4 pasos está en el rango recomendado (4–6). |
| Drill-down VP → Director → Gerente → Vendedor con migas | MUST | Estructura de la conversación de ejecución. |
| Triple Lente: Pedidos / Clientes / Volumen | MUST | Sin el lente de volumen, "¿lo que falta es relevante?" no tiene respuesta. |
| Action Drawer con clientes a recuperar | MUST | Separa herramienta de reporte. |
| Exportar CSV respetando filtros y nivel | MUST | Pedido explícito y barato de cumplir. |
| Tooltip con definición de negocio de cada métrica | MUST | "Incorporado" y "activo" se discuten en cada junta; la definición viviendo en el tablero corta la discusión. |
| FTTV y reversión analógica | Nuevo | No estaban en el documento original. Detectan onboarding de papel y fuga silenciosa. |
| Cero scroll absoluto | Se reta | Sustituido por ribbon fijo + master-detail. El requisito real (no perder el resumen) se cumple mejor. |
| Semáforo de color, tarjetas vs franja, sidebar plegable | Guía | Preferencias de layout. Se respetan salvo que choquen con legibilidad. |
| Gráfico de pastel de canales | Descartado | Comparación angular pobre. Barras apiladas normalizadas. |
| Gauges / odómetros circulares | Descartado | Ocupan mucho y dicen poco. Bullet graphs. |

---

## Quién hace qué: orquestación de modelos

| Quién | Qué | Por qué |
|---|---|---|
| **Claude** | Contrato de datos, generador de mock, lógica de agregación y lentes, mapeo de tokens, arquitectura del puerto de datos, construcción de componentes. | Trabajo de consistencia lógica a lo largo de muchos archivos, donde un descuido se manifiesta como un número mal sumado tres pantallas después. |
| **Gemini** | Crítica de composición visual, densidad, jerarquía tipográfica, ajuste fino de Recharts, revisión de legibilidad en claro y oscuro. | Buen ojo, punto donde una segunda opinión tiene valor real. Ya lo demostró en este ejercicio. |
| **Antigravity** | Ejecución en el entorno: dependencias, servidor de desarrollo, verificación visual. | Es la mano. |

**El matiz importante:** el error sería que Gemini diseñe en abstracto y alguien traduzca después. La composición se juzga mucho mejor sobre la cosa corriendo con datos reales que sobre un mockup. Por eso: construir funcional con los tokens propios primero, que Gemini critique *eso*, y aplicar. Iteración sobre artefacto real, no sobre lámina.

---

## Fuentes consultadas

Verificación del stack: `penetron-dash/webapp` (package.json, index.css, lib/theme.js, lib/designTokens.js, componentes).

Literatura y estado del arte:
- [Tufte sobre dashboards ejecutivos](https://www.edwardtufte.com/notebook/executive-dashboards/)
- [UXPin, principios de diseño de dashboards 2026](https://www.uxpin.com/studio/blog/dashboard-design-principles/)
- [UXPin, progressive disclosure](https://www.uxpin.com/studio/blog/what-is-progressive-disclosure/)
- [Atlassian, guía de funnel charts](https://www.atlassian.com/data/charts/funnel-chart-complete-guide)
- [Domo, funnel charts en analítica](https://www.domo.com/learn/charts/funnel-charts)
- [Usertour, métricas de adopción 2026](https://www.usertour.io/blog/product-adoption-metrics-2026)
- [Userpilot, adopción vs engagement](https://userpilot.com/blog/adoption-vs-engagement-metrics/)
- [WalkMe, analítica de adopción digital](https://www.walkme.com/data/)
- [shadcn/ui, theming](https://ui.shadcn.com/docs/theming)
- [shadcn/ui con Tailwind v4](https://ui.shadcn.com/docs/tailwind-v4)
- [Snowflake, data apps en Snowpark Container Services](https://www.snowflake.com/en/developers/guides/build-a-data-app-and-run-it-on-snowpark-container-services/)
- [Snowflake, token OAuth automático en SPCS](https://docs.snowflake.com/en/developer-guide/snowpark-container-services/additional-considerations-services-jobs)
- [Snowflake, ejecución de SQL desde SPCS](https://docs.snowflake.com/en/developer-guide/snowpark-container-services/spcs-execute-sql)
- [Toptal, dashboards móviles](https://www.toptal.com/designers/dashboard-design/mobile-dashboard-ui)
