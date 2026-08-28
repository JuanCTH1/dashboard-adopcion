# 📄 CX DIGITAL ADOPTION DASHBOARD - MASTER HANDOVER & PROJECT BITÁCORA

> **Version:** 2.2 (USA Operations · 100% English UI · Animated Layout · Visual Micro-Pills)  
> **Last Updated:** August 28, 2026  
> **Dev Server:** `http://localhost:5173`  
> **Status:** Production-ready, fully compiled (0 errors, Vite build ~2.1s)

---

## 🎯 1. Business Purpose & Core Design Philosophy

This executive dashboard enables commercial leaders (VPs, Regional Directors, Managers, and Sales Reps) to monitor, audit, and execute digital adoption across B2B accounts:
1. **5-Second Executive Assessment:** Immediate clarity on digital order share, volume penetration, and onboarding.
2. **Order-Based Primary Currency:** Primary adoption measurement is based on **Orders (Pedidos)**, as volume units (cu yd vs Tons) differ by product line. Orders provide a unit-agnostic, clean metric.
3. **90.0% Corporate Goal:** Targets an ambitious 90% digital order penetration, starting from a realistic 12.2% baseline in Jan 2024 up to ~75.4% in Aug 2026.
4. **Actionable Commercial Execution:** 1-click generation of the "Monday Morning Sales Priority List" to copy into 1-on-1 meetings or WhatsApp.

---

## 🏗️ 2. Architectural Structure & Data Model

### A. Geographical & Organizational Hierarchy Model
* **Country Scope:** `USA National`
* **Level 1 (VPs by Business Line):**
  1. `VP Readymix Concrete` (`readymix` · `cu yd`)
  2. `VP Bulk Cement` (`cemento` · `tons`)
  3. `VP Quarries & Aggregates` (`agregados` · `tons`)
* **Level 2 (Regional Directors - 5 per VP = 15 Total):**
  * *Readymix:* East Coast, Sunbelt, Midwest, Mountain, Pacific.
  * *Cement:* Atlantic, Gulf Coast, Great Lakes, Central Plains, Pacific NW.
  * *Aggregates:* Northeast, Southeast, Central, Texas & Gulf, West Coast.
* **Level 3 (Plaza Managers):** 2 Managers per Regional Director (30 Managers total).
* **Level 4 (Sales Representatives):** Dedicated Sales Reps per Manager & Business Line.
* **Level 5 (Client Portfolio):** 1,200+ realistic B2B accounts (`Apex Construction LLC`, `Turner Heavy Infra`, `Skanska USA Built`, `Bechtel Concrete Works`, etc.).

---

## 🖥️ 3. Dashboard Layout & Component Architecture

The interface is structured in **3 Main Horizontal Tiers**:

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ TIER 1: EXECUTIVE KPI RIBBON (ExecutiveRibbon.jsx)                                               │
│ [Digital Adoption Rate]   [Readymix Vol cu yd]   [Bulk Cement Vol Tons]   [Client Onboarding]    │
├──────────────────────────────────────────────────────────────────┬───────────────────────────────┤
│ TIER 2 (LEFT - 7 Cols): HISTORICAL TREND (AdoptionTrendCard.jsx) │ TIER 2 (RIGHT - 5 Cols):      │
│ • Recharts Area Chart filtered strictly to selected dates         │ VERTICAL FUNNEL               │
│ • Monthly seasonality & variability (2024 - 2026)                │ (VerticalFunnelCard.jsx)      │
│ • Metric Switcher: Adoption % / Concrete Vol / Cement Vol        │ • 4-Stage Retention Pipeline  │
│ • Pinned Target Line: 90.0%                                      │ • Red drop-off connectors     │
├──────────────────────────────────────────────────────────────────┴───────────────────────────────┤
│ TIER 3: CASCADED HIERARCHY EXPLORER + EXPANDABLE ACCOUNT PORTFOLIO TABLE                         │
│ (ProgressiveHierarchy.jsx)                                                                       │
│ [USA National] ➔ [VP by Line] ➔ [Directors] ➔ [Managers] ➔ [Sales Reps] │ [RIGHT-HAND TABLE]      │
│ • Compact, vertically centered Miller Columns with Multi-Selection      │ • Expandable Rows (▶/▼) │
│ • Smooth Framer Motion spring push animation on table                   │ • Visual Micro-Pills    │
│ • Global Dashboard Slicer (Hierarchy filters entire dashboard)           │ • Sticky Totals Footer  │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## ⚡ 4. Essential Interaction & Business Logic Rules

1. **Hierarchy as Global Dashboard Slicer:**
   * Selecting any `VP`, `Director`, `Manager`, or `Sales Rep` updates the ENTIRE dashboard in real time (Executive Ribbon KPIs, Trend Chart, Vertical Funnel, and Client Table).
2. **Visual Micro-Pills for Channel Breakdown:**
   * Expanded row drawers display compact high-contrast badges instead of repetitive text:
     * `💻 Web: 18` | `📱 App: 6` | `🔌 EDI: 4` | `📞 Phone: 30` | `⏱️ FTTV: 12 days`
3. **Smooth Layout Spring Animation:**
   * Opening or closing hierarchy columns triggers a smooth Framer Motion spring animation that slides the client table gracefully to the right.
4. **Deduplicated Sidebar Filters:**
   * `Sidebar.jsx` contains only Time Period (Year/Month with drag range) as Business Line is natively handled by the VPs in the hierarchy tree.

---

## 📜 5. Git Commit History & Rollback Checkpoints

* **`7450e76`** *(Current active state)* — `feat: animar desplazamiento de tabla al abrir columnas, rediseñar cajon desplegable con micro-pildoras visuales, remover filtro duplicado de Business Line del sidebar y promover jerarquia a filtro global`
* **`b20d728`** — `feat: ampliar jerarquia a 5 regiones/direcciones por VP division`
* **`3b64f2c`** — `feat: traducir 100% de la aplicacion al ingles (Sidebar, Header, Ribbon, Trend, Funnel, Hierarchy, Action Drawer y Search)`
* **`9151b68`** — `feat: agregar filas desplegables para desglose de ordenes digitales vs analogas, emparejamiento estricto de canal principal y traducir UI a ingles`
* **`f4aae2f`** — `feat: cambiar unidad primaria de la tabla a Ordenes/Pedidos y agregar fila de Totales con promedio ponderado real`
* **`b92fafa`** — `feat: reestructurar VPs por linea de negocio, directores por ubicacion y vendedores dedicados, unificando filtros del sidebar`
---

## 🎨 7. Future Funnel Redesign Inspiration (Sankey / Flow Ribbon Funnel)

> **Saved Reference Image:**  
> ile:///C:/Users/jtatto/.gemini/antigravity/brain/4ed9ea6c-91bf-4491-8f67-34bb9d43b6b9/.user_uploaded/media_1787910960818.png

### Key Design Attributes Saved for Future Funnel Iterations:
1. **Flow Stream Topology (Sankey Diagram style):** Smooth fluid gradient wave ribbons connecting stages (e.g. Visits $\rightarrow$ Leads $\rightarrow$ Customers).
2. **Channel Stream Breakdown:** Multi-stream source flows with percentage badges per stream (2%, 3%, 15%, 80%).
3. **Vertical Stage Dividers:** Clean vertical guide lines with step titles and big percentage conversions.
4. **Theme Alignment:** Deep dark blue palette with vibrant purple/magenta gradient ribbons.
---

## 🚀 Versión 2.3 - Unificación de Motor FLIP (Framer Motion LayoutGroup + popLayout) & Tipografía Optimizada

- **Single-Clock FLIP Layout System:** Se envolvió la jerarquía completa en <LayoutGroup> de Framer Motion.
- **AnimatePresence mode="popLayout":** Las columnas salientes se extraen del flujo DOM inmediatamente (position: absolute), permitiendo que la tabla de la derecha reconozca su destino final desde el milisegundo 0 sin perseguir objetivos móviles.
- **Tipografía Optimizada:** Se incrementó la escala tipográfica de la tabla (encabezados a 	ext-xs font-bold, nombres a 	ext-xs font-bold, badges a 	ext-[10px] y 	ext-xs) para garantizar máxima legibilidad y confort visual.
---

## 👔 Versión 2.4 - Nombres Ejecutivos Realistas y Estructura de Jerarquía (Regions & Markets)

- **Encabezado VP Division:** Muestra la línea de negocio (ej. Readymix Concrete) y abajo el nombre del VP a cargo (VP: Sarah Jenkins).
- **Encabezado Regions:** Reemplazó a *Directors*. Muestra la región geográfica (ej. Atlantic Region) y abajo el nombre del Director a cargo (Dir: Robert Vance).
- **Encabezado Markets:** Reemplazó a *Managers*. Muestra el mercado/plaza comercial (ej. Dallas Market) y abajo el nombre del Gerente a cargo (Mgr: Christopher Harris).
- **Encabezado Sales Reps:** Muestra el nombre del vendedor (ej. John Smith) y abajo su plaza (Dallas Market).
---

## 🏭 Versión 2.5 - Diversificación Única de Regiones y Mercados por VP / Línea de Negocio

- **VP Readymix Concrete:** Regiones y mercados de plantas dosificadoras (*Atlantic Metro*, *Sunbelt Metro*, *Dallas Metro Plants*, *Houston Metro Plants*, *Chicago Loop Plants*...).
- **VP Bulk Cement:** Regiones y terminales marisas/silos de cemento (*Atlantic Silos*, *Gulf Coast Mills*, *Philly Bulk Silo*, *Baltimore Port Terminal*, *New Orleans Barge Dock*...).
- **VP Quarries & Aggregates:** Regiones de canteras y pozos de arena (*Appalachian Quarries*, *Southeast Granite*, *Pittsburgh Quarry #1*, *Atlanta Granite Pit*, *Austin Stone Quarry*...).
---

## 🏛️ Versión 2.6 - Organización Matricial (Geografía Física Compartida con Liderazgo Dedicado por VP)

- **Geografías Físicas Estandarizadas:** Las regiones (Atlantic, Sunbelt, Midwest, Mountain, Pacific NW) y los mercados (Dallas, Houston, New York, Boston, Chicago...) son **físicamente idénticos** entre todas las VP Divisions.
- **Liderazgo Ejecutivo Dedicado:**
  - En **Dallas Market**:
    - *Readymix Concrete Manager:* **Christopher Harris**
    - *Bulk Cement Manager:* **Mark Hill**
    - *Quarries & Aggregates Manager:* **Pamela Turner**
  - En **Atlantic Region**:
    - *Readymix Director:* **Robert Vance**
    - *Bulk Cement Director:* **William Baxter**
    - *Quarries & Aggregates Director:* **George Hamilton**
---

## 🗺️ Versión 2.7 - Agrupación Geográfica Unificada & Conmutación Dinámica de Liderazgo / BL

- **5 Regiones Geográficas Físicas Únicas:** Atlantic, Sunbelt, Midwest, Mountain, Pacific NW.
- **Regla de Persona vs Línea de Negocio:**
  - **1 sola VP Seleccionada (ej. Readymix Concrete):** Muestra exactamente las mismas 5 regiones geográficas, calcula las métricas de esa VP en cada región y muestra el **nombre del Director / Manager asignado** (Robert Vance en Atlantic, Christopher Harris en Dallas).
  - **Cambio a Bulk Cement:** Muestra **las mismas 5 regiones**, pero sus métricas se actualizan a Bulk Cement y el sub-texto cambia al **Director de Bulk Cement** (William Baxter en Atlantic, Mark Hill en Dallas).
  - **Múltiples VPs Seleccionadas (o ámbito nacional):** Como aplica más de un líder, se deja de mostrar un nombre individual y se muestra la etiqueta de las **Líneas de Negocio involucradas** (ej. Readymix Concrete + Bulk Cement).
---

## 🏷️ Versión 2.8 - Micro-Píldoras de BL (RMX, CEM, AGG), Tooltips Ejecutivos & Ancho Optimizado de Mercados

- **Micro-Píldoras Compactas de BL:**
  - RMX (Readymix Concrete) — badge azul suave.
  - CEM (Bulk Cement) — badge índigo/violeta.
  - AGG (Quarries & Aggregates) — badge ámbar/naranja.
  - Cuando hay múltiples VPs seleccionadas o en vista nacional, cada tarjeta de región o mercado muestra sus micro-píldoras de presencia activa ([RMX] [CEM] [AGG]).
- **Tooltip Ejecutivo Flotante en Hover:**
  - Al pasar el cursor sobre cualquier tarjeta de Región o Mercado, se despliega una tarjeta ejecutiva flotante con:
    * Nombre completo de la plaza/región.
    * **Desglose de Línea por Línea** con la **Persona Responsable asignada** (Readymix: Robert Vance, Bulk Cement: William Baxter, Aggregates: George Hamilton).
    * Totales de pedidos y % de adopción agregados.
- **Ancho Optimizado para Mercados (w-52 & w-[188px]):**
  - Ajuste de contenedor a w-52 (188px de ancho útil) con wrap automático de micro-píldoras para eliminar cortes de texto cuando hay múltiples BLs seleccionadas.
---

## 🖱️ Versión 2.9 - Selección por Arrastre (Drag-to-Select), 5 Sales Reps por Mercado & Tooltip Sin Recortes

- **5 Sales Reps por Mercado:** Cada mercado cuenta con una nómina rica de **5 ejecutivos de venta** asignados (John Smith, Michael Johnson, David Miller, Emily Davis, James Wilson...).
- **Selección Múltiple por Arrastre (Drag-to-Select):** Puedes hacer clic y arrastrar el cursor hacia abajo o hacia los lados en cualquier columna (VP Division, Regions, Markets, Sales Reps) para seleccionar múltiples elementos de forma continua, exactamente igual que en el sidebar.
- **Posicionamiento Inteligente de Tooltips (Sin Recortes):**
  - Para el primer elemento superior (idx === 0), el Tooltip flota suavemente hacia abajo (	op-full mt-2), evitando que el borde superior del contenedor corte la tarjeta.
  - Para los demás elementos, flota hacia arriba (ottom-full mb-2), garantizando visualización limpia en 100% de la pantalla.
---

## 🎯 Versión 2.10 - Alineación Superior Fija (Top-Alignment) & Popover Flotante de Viewport con Botón Micro-(i)

- **Alineación Vertical Superior (justify-start):**
  - Se removió justify-center de los contenedores de columna. Todas las listas están **fijas arriba (=0$)**.
  - Al expandir o colapsar secciones, el primer elemento nunca se desplaza hacia abajo ni genera saltos caóticos de layout.
- **Botón Micro-Trigger (i) y Popover Flotante en Viewport:**
  - El tooltip ya no se abre al pasar el cursor por toda la tarjeta, evitando molestias al navegar.
  - En cada tarjeta de Región y Mercado agregamos un micro-botón (i) *(Info)*.
  - Al pasar el cursor o hacer clic sobre la (i), el Popover se calcula mediante coordenadas de Viewport (position: fixed; z-index: 9999) sobre todo el body.
  - **Garantía 0% Recortes:** Al renderizarse fuera de la jerarquía de scroll de la columna, el popover flota libremente por encima de encabezados, columnas y bordes.
---

## 🎯 Versión 2.11 - Ordenes Ponderadas en Tarjetas, Tooltip Conciso por BL & Tabla Ultra-Fluida en Estado Colapsado

- **Volumen de Órdenes Ponderado en Tarjetas:**
  - Todas las tarjetas de **VP Division**, **Regions**, **Markets** y **Sales Reps** ahora muestran tanto el número total de órdenes como el % de adopción (ej. 1,420 ord · 51.5%).
- **Tooltip Conciso y Desglose por Línea de Negocio:**
  - Se eliminaron redundancias (Readymix Concrete duplicado), mostrando directamente la pill corta ([RMX] Robert Vance).
  - El tooltip ahora muestra las **Órdenes totales y % de Adopción individuales para cada Línea de Negocio** que opera en esa región o mercado.
- **Sales Reps con Mercado y Línea de Negocio (BL):**
  - La etiqueta secundaria del vendedor muestra tanto la Plaza/Mercado como su Línea de Negocio específica (ej. Dallas · RMX).
- **Rediseño de Tabla Responsiva en Modo Colapsado:**
  - Se solucionó el empaquetamiento feo cuando las 4 columnas de la jerarquía están abiertas.
  - La tabla implementa overflow-x-auto con min-w-[500px], etiquetas cortas y legibles (RMX, Phone, Active), celdas whitespace-nowrap y totales limpios sin saltos de línea feos.
---

## 🎯 Versión 2.12 - Limpieza de Tooltip, Corrección de Colores, Filtro Multi-BL en Jerarquía & Default Año Completo en Filtro Global

- **Simplificación y Paleta Limpia de Tooltips:**
  - Se removió la fila redundante de totales del tooltip (ya está visible en la tarjeta).
  - Se rediseñó la paleta a un tema oscuro slate-950 con borde sutil slate-700/80 y pills de alto contraste por BL.
- **Corrección de Filtrado Multi-BL en Mercados y Vendedores:**
  - Al seleccionar 1 Región pero múltiples Líneas de Negocio (ej. RMX + CEM), la columna de Mercados y Vendedores ahora muestra y preserva **ambas Líneas de Negocio** en lugar de limitar la búsqueda al primer nodo.
- **Comportamiento Predeterminado de Filtro Global de Meses:**
  - Cuando no hay ningún mes seleccionado explícitamente en el filtro global, el sistema ahora incluye automáticamente **todos los 12 meses** del año seleccionado (o de los años seleccionados), en lugar de limitar los datos a un solo mes.
---

## 🎯 Versión 2.13 - Auditoría Visual de Modo Oscuro, Iconos Vectoriales SVG & Tooltip Adaptativo con Scrollbars Personalizados

- **Revisión Completa de Contraste en Modo Oscuro:**
  - Se detectó que la clase dark:bg-slate-850 utilizada en encabezados, drawers, tablas y barras laterales no existía en la paleta oficial de Tailwind CSS, lo que provocaba que los headers y fondos se renderizaran con colores no deseados/transparentes.
  - Se reemplazaron todas las ocurrencias por dark:bg-slate-800 y dark:bg-slate-900, logrando una transición perfecta, armoniosa y con alto contraste en modo oscuro.
- **Iconografía 100% Vectorial SVG (Lucide Icons):**
  - Se sustituyó cualquier texto de flechas manuales (➔) o emojis por componentes de iconos vectoriales dinámicos (<ArrowRight /> de Lucide Icons).
- **Rediseño Adaptativo de Tooltips:**
  - El tooltip ahora se adapta de manera equilibrada a ambos temas:
    - **Modo Claro:** Tarjeta elegante de cristal slate-900 con texto blanco brillante e insignias nítidas.
    - **Modo Oscuro:** Tarjeta con relieve slate-800 y borde slate-600 que destaca con contraste perfecto sobre el fondo oscuro sin confundirse ni verse "demasiado negro".
- **Scrollbars Estilizados:**
  - Se añadieron estilos CSS personalizados para scrollbars finos y redondeados (::-webkit-scrollbar), tanto para temas claros como oscuros.
---

## 🎯 Versión 2.14 - Rediseño de Tarjetas a 3 Renglones, Filtro Multi-BL Geográfico Definitivo & Tabla Fluida SIN Scroll Horizontal

- **Corrección Definitiva de Coincidencia Multi-BL (Nodos Geográficos):**
  - Se identificó la causa raíz: los IDs de las tarjetas regionales y de mercado estaban utilizando el ID interno del primer director en lugar del identificador geográfico unificado (.nombre y m.nombre).
  - Al seleccionar 1 Región (ej. Atlantic) con 2 VPs/BLs (ej. Readymix + Bulk Cement), ahora el repositorio busca y encuentra **el 100% de los gerentes y vendedores de ambas líneas de negocio** asociadas a la zona geográfica sin omitir ninguna.
- **Rediseño de Tarjetas a 3 Renglones:**
  - Las tarjetas en las columnas de la jerarquía ahora están estructuradas en 3 renglones verticales limpios:
    1. **Renglón 1:** Nombre de la entidad + Check e icono de Info (i).
    2. **Renglón 2:** Nombre de liderazgo o Micro-insignias por línea (RMX · CEM).
    3. **Renglón 3:** Volumen de Órdenes y % de Adopción (1,420 ord | 51.5%).
- **Eliminación Total del Scroll Horizontal en la Tabla:**
  - Se removió la barra de scroll horizontal (overflow-x-auto) de la tabla derecha.
  - Se optimizaron los anchos de las columnas de la jerarquía (w-44 / 176px), liberando más de 200px de espacio horizontal.
  - La tabla utiliza w-full table-fixed con proporciones porcentuales para que el portafolio de cuentas se visualice fluido, amplio y sin ningún empaquetamiento ni barra de desplazamiento horizontal.
---

## 🎯 Versión 2.15 - Tarjeta USA Simplificada & Solución Definitiva al Bug de Métricas en 0 en Mercados/Tabla

- **Simplificación de la Tarjeta USA:**
  - Se modificó la tarjeta del país para mostrar un título limpio de 3 renglones: USA en el renglón 1, National en el renglón 2, y 119,005 ord | 51.0% en el renglón 3.
- **Corrección de Bug de Datos en 0 (Mercados, Vendedores y Tabla):**
  - **Causa Raíz:** Al filtrar por el nombre del mercado (ej. ['New York']) o región (ej. ['Atlantic']), el método _filtrar en dopcionRepo.js buscaba únicamente por c.gerenteId (ej. 'ger-1'), el cual no coincidía con la cadena 'New York', provocando que la consulta devolviera 0 cuentas y 0 órdenes.
  - **Solución:** Se actualizó _filtrar para evaluar tanto directorId como egionNombre, y tanto gerenteId como plaza. Ahora, seleccionar cualquier mercado o región recupera el 100% de las cuentas reales de la cartera con sus órdenes y adopción calculadas con precisión.
---

## 🎯 Versión 2.16 - Corrección Definitiva del Filtrado de Clientes (Región + Plaza)

- **Causa Raíz Resuelta:** Los objetos CLIENTES generados en el dataset simulado carecían de la propiedad egionNombre explícita y su egionId (ej. 'reg-1') difería del nombre visible de la tarjeta (ej. 'Atlantic').
- **Solución Aplicada:**
  - Se incluyó la propiedad egionNombre: rep.regionNombre en todos los objetos CLIENTES dentro de mockGenerator.js.
  - Se agregó un diccionario inverso de mapeo REGION_NAME_TO_ID ('Atlantic' -> 'reg-1', 'Sunbelt' -> 'reg-2', etc.) en el método _filtrar de dopcionRepo.js.
  - Ahora seleccionar cualquier combinación de VP, Región y Mercado calcula con precisión matemática el 100% de las órdenes y cuentas sin volver a mostrar 0.
---

## 🎯 Versión 2.17 - Límite de Altura Máxima a 5 Tarjetas (max-h-[310px]) en Columnas de Jerarquía

- **Restricción de Altura en Columnas:**
  - Para evitar que la columna de **Sales Reps** (que puede contener de 15 a 25 vendedores por mercado) o la columna de **Markets** crezcan verticalmente de forma desmedida rompiendo la alineación del dashboard, se estableció un alto máximo uniforme de 5 tarjetas (max-h-[310px]).
- **Desplazamiento Suave Integrado:**
  - Cuando una columna supera las 5 tarjetas, se muestran las 5 primeras de manera completa y se activa un scroll vertical estilizado (scrollbar-thin).
- **Alineación de Baseline:**
  - La tabla del Portafolio de Cuentas comparte exactamente el mismo límite max-h-[310px], logrando una simetría horizontal perfecta entre todas las columnas y el portafolio.
---

## 🎯 Versión 2.18 - Recalibración Exacta para 5 Tarjetas Visibles (max-h-[385px])

- **Capacidad Exacta de 5 Tarjetas Visibles:**
  - Se ajustó el alto máximo a max-h-[385px]. 
  - Con este valor exacto, **las 5 regiones (o 5 vendedores) caben 100% completas en pantalla sin activar scrollbar alguno**.
  - La barra de scroll vertical solo aparece a partir de la **6ta tarjeta en adelante** en listas largas (como Sales Reps o Markets).
---

## 🎯 Versión 2.19 - Eliminación del Espacio Vacío Inferior Forzado (items-start & Altura Dinámica)

- **Eliminación del Hueco Blanco/Gris:**
  - Se identificó que la regla items-stretch min-h-[380px] en el contenedor padre forzaba a todas las columnas cortas (como Markets con 2 tarjetas o VP Division con 3 VPs) a estirarse artificialmente, creando un rectángulo vacío grande debajo de las tarjetas.
  - Se cambió la alineación del contenedor a items-start y se ajustó la altura máxima a max-h-[350px].
  - Ahora cada columna **se ajusta dinámicamente a la altura de sus elementos reales sin crear espacios vacíos ficticios**, mientras que las listas largas muestran sus tarjetas holgadas y activan scroll únicamente cuando superan el límite.
---

## 🎯 Versión 2.20 - Ajuste Fino de Contenedor a 370px (5 Tarjetas 100% Integras)

- **Corrección de Recorte Visual:**
  - Se identificó que a 350px la 5ta tarjeta (ej. Pacific NW en Regiones) se cortaba en la parte inferior activando una barra de scroll no deseada.
  - Se calibró la altura a max-h-[370px].
  - Ahora las **5 tarjetas (y las 5 regiones)** entran 100% integras, holgadas y visibles a simple vista sin recortar ningún texto y sin activar scroll. La barra de scroll aparece de la 6ta tarjeta en adelante.
---

## 🎯 Versión 2.21 - Alineación de Baseline Inferior Perfecto (items-stretch & lex-1)

- **Alineación de Bordes Inferiores:**
  - La tabla derecha (Account Portfolio) no se tocó en absoluto.
  - Se configuró la fila contenedora con items-stretch para que los bordes inferiores de **todas las columnas de la izquierda** (Country, VP Division, Regions, Markets y Sales Reps) se estiren exactamente hasta la misma línea de base horizontal que la tabla.
  - Se asignó lex-1 a los contenedores internos de tarjetas para que ocupen todo el alto útil disponible sin dejar descalces ni espacios sueltos.
---

## 🎯 Versión 2.22 - Restricción de Altura Estricta (max-h-[365px]) e Inmunidad a Crecimiento Vertical

- **Causa Raíz Resuelta:** Al no tener una restricción de altura máxima fija (max-h) en los contenedores de columna ni en la tabla, seleccionar 4 o más regiones provocaba que la columna de **Markets** generara 8 tarjetas, expandiendo su altura a más de 550px y estirando la tabla y todo el dashboard verticalmente de forma desmedida.
- **Solución Definitiva:**
  - Se asignó un tope estricto e infranqueable de max-h-[365px] a todos los contenedores de columna (VP Division, Regions, Markets, Sales Reps) y a la tabla (Account Portfolio).
  - Los contenedores internos de tarjetas tienen su límite interno en max-h-[315px].
  - Ahora, sin importar cuántas regiones (1, 3, 5) o cuántos mercados (2, 8, 15) estén seleccionados, **la gráfica y la tabla mantienen SIEMPRE su altura máxima de 365px**, mostrando las primeras 5 tarjetas y activando un scroll vertical limpio para el resto.
---

## 🎯 Versión 2.23 - Reversión Completa al Estado v2.15 (Restauración de Tabla Original)

- **Reversión de Cambios de Altura:**
  - Se revirtió por completo el archivo ProgressiveHierarchy.jsx a la versión **v2.15**, deshaciendo cualquier alteración sobre la tabla del portafolio y sobre las restricciones de altura de las columnas.
- **Estado Actual Estable (v2.15/v2.23):**
  - **Tabla del Portafolio:** Restaurada a su formato, tamaño y altura original perfecta.
  - **Tarjeta USA:** Simplificada en 3 renglones (USA / National / 119,005 ord | 51.0%).
  - **Filtro Multi-BL:** Coincidencia por región y plaza 100% funcional y sin datos en 0.
  - **Modo Oscuro & Iconos:** Auditoría visual completa con contraste adaptativo, scrollbars estilizados e iconos vectoriales SVG.
---

## 🎯 Versión 2.24 - Control de Altura Estricto Uniforme (h-[375px]), Ancho Optimizado & Modo Focus Table

- **Control Estricto de Altura Uniforme (`h-[375px]` / `h-[365px]`):**
  - Se fijó una altura estricta de `h-[365px]` para todas las columnas de la jerarquía (`Country`, `VP Division`, `Regions`, `Markets`, `Sales Reps`) y para la tarjeta de la tabla (`Account Portfolio`).
  - Los contenedores internos de tarjetas en cada columna implementan scroll vertical estilizado (`overflow-y-auto scrollbar-thin max-h-[305px] min-h-0`), mostrando las primeras 5 tarjetas y permitiendo scroll suave si la nómina de ejecutivos o mercados es muy extensa.
  - El dashboard **nunca** se deforma ni se estira verticalmente, eliminando espacios vacíos desproporcionados debajo de las columnas cortas.
- **Ancho Optimizado de Columnas (`w-[150px]`):**
  - Se ajustó el ancho de las columnas a `w-[150px]`, liberando más de 110px de espacio horizontal que benefician directamente a la tabla (`min-w-[380px]`), previniendo amontonamientos y scrollbars horizontales.
- **Modo Enfoque de Tabla (`[ ⇥ Focus Table ]` / `[ ⇤ Show All Columns ]`):**
  - Se añadió el botón `Focus Table` en la cabecera del explorador jerárquico.
  - Al activarlo, colapsa temporalmente las columnas de País y VPs en una barra de resumen (*breadcrumbs ribbon*) en la parte superior, otorgándole el **75%+ del ancho del dashboard** a los Mercados, Vendedores y Portafolio de Cuentas.
---

## 🎯 Versión 2.25 - Encabezado de Altura Fija (48px / h-12) & Eliminación Total de Brinco Vertical al Filtrar

- **Integración Inline de Micro-Insignias de Filtro:**
  - Se trasladaron los badges de `Active Filters` directamente al interior de la barra superior principal (`h-12` / 48px) en [AppHeader.jsx](file:///c:/Users/jtatto/Claude/Projects/Dashboard%20Adopcion%20CX/src/components/AppHeader.jsx).
- **Cero Desplazamiento de Pantalla (Zero Layout Shift):**
  - Al seleccionar o deseleccionar cualquier filtro (ej. *Readymix Concrete*), la altura del encabezado se mantiene **100% fija en 48px** en todo momento.
  - La pantalla, las tarjetas del Ribbon, la gráfica de tendencia y la tabla permanecen **inmóviles**, eliminando el salto vertical de 32px que forzaba a hacer scroll.
---

## 🎯 Versión 2.26 - Eliminación de Etiqueta "Active" & Corrección de Deselección en Chips de Jerarquía

- **Remoción de la palabra "Active":**
  - Se eliminó la etiqueta redundante "Active:" en el encabezado superior para una apariencia más limpia y minimalista.
- **Corrección de Deselección al hacer clic en la (X):**
  - **Causa Raíz:** Al hacer clic en la (X) de un chip de la jerarquía (ej. *VPs*, *Regions*, *Markets*, *Sales Reps*), el manejador buscaba la clave dentro del estado del sidebar `filtrosContexto` en lugar del estado de la jerarquía `filtrosJerarquia`.
  - **Solución:** Se actualizó `handleRemoveChip` y `handleResetFiltros` en [App.jsx](file:///c:/Users/jtatto/Claude/Projects/Dashboard%20Adopcion%20CX/src/App.jsx) para resetear adecuadamente los arreglos `vpIds`, `directorIds`, `gerenteIds` y `vendedorIds`. Ahora al pulsar la (X) en cualquier chip del header, la selección correspondiente en la jerarquía se limpia inmediatamente.
---

## 🎯 Versión 2.27 - Restauración de Icono de Filtro SVG, Corrección de Mapeo de Meses del Sidebar & Iconografía Vectorial 100%

- **Restauración del Icono Vectorial de Filtro:**
  - Se colocó el icono SVG `<Filter className="w-3.5 h-3.5 text-primary shrink-0" />` justo al inicio del listado de chips en el encabezado de [AppHeader.jsx](file:///c:/Users/jtatto/Claude/Projects/Dashboard%20Adopcion%20CX/src/components/AppHeader.jsx).
- **Corrección Crítica de Mapeo de Meses (Jan-Dec vs Ene-Dic):**
  - **Causa Raíz:** Los meses seleccionados en el Sidebar enviaban cadenas en inglés (`Jan`, `Feb`, `Aug`), pero [adopcionRepo.js](file:///c:/Users/jtatto/Claude/Projects/Dashboard%20Adopcion%20CX/src/domain/adopcionRepo.js) los comparaba contra un arreglo en español (`Ene`, `Feb`, `Ago`), haciendo que deseleccionar o seleccionar meses devolviera 0 registros.
  - **Solución:** Se unificaron los nombres de los meses en [adopcionRepo.js](file:///c:/Users/jtatto/Claude/Projects/Dashboard%20Adopcion%20CX/src/domain/adopcionRepo.js) a inglés (`['Jan', 'Feb', 'Mar', ... 'Dec']`) y se corrigió la sincronización del efecto `useEffect` en [ProgressiveHierarchy.jsx](file:///c:/Users/jtatto/Claude/Projects/Dashboard%20Adopcion%20CX/src/components/ProgressiveHierarchy.jsx) para reaccionar a las deselecciones de chips.
- **Iconografía 100% Vectorial (SVG / Lucide Icons):**
  - Se sustituyó el carácter de palomita de texto (`✔`) en [FilterListbox.jsx](file:///c:/Users/jtatto/Claude/Projects/Dashboard%20Adopcion%20CX/src/components/FilterListbox.jsx) por el icono vectorial SVG `<Check className="w-3 h-3 text-white" />` de Lucide.
---

## 🎯 Versión 2.28 - Actualización de la Paleta Global al Azul PANTONE 293c (#0000B3)

- **Actualización de Variables de Color Principal:**
  - Se configuró el tono azul principal corporativo a **PANTONE 293c (`#0000B3` · RGB 0, 0, 179)** en [globals.css](file:///c:/Users/jtatto/Claude/Projects/Dashboard%20Adopcion%20CX/src/globals.css) (`--primary`, `--ring`, `--chart-1`, `--accent-foreground`).
- **Sincronización de Tema y Dataviz:**
  - Se actualizaron los tokens de color semánticos y la paleta de visualización de datos en [theme.js](file:///c:/Users/jtatto/Claude/Projects/Dashboard%20Adopcion%20CX/src/lib/theme.js) (`CAT_LIGHT`, `BLUE`, `primary`).
---

## 🎯 Versión 2.29 - Deselección Total de Años y Meses en Sidebar (Lógica Ámbito Completo)

- **Corrección de Lógica de Deselección:**
  - **Causa Raíz:** Al deseleccionar un año (ej. *2026*) o un mes (ej. *Aug*) en el Sidebar o en los chips del header, el manejador volvía a forzar los valores predeterminados `[2026]` y `['Aug']`, impidiendo al usuario limpiar la selección.
  - **Solución:** Se configuró el estado inicial y los manejadores de deselección en [App.jsx](file:///c:/Users/jtatto/Claude/Projects/Dashboard%20Adopcion%20CX/src/App.jsx) y [Sidebar.jsx](file:///c:/Users/jtatto/Claude/Projects/Dashboard%20Adopcion%20CX/src/components/Sidebar.jsx) para establecer arreglos vacíos `[]`.
- **Lógica de Ámbito Completo:**
  - Al no haber ningún año seleccionado (`anios: []`), el dashboard incluye automáticamente los **3 años históricos (2024, 2025, 2026)**.
  - Al no haber ningún mes seleccionado (`meses: []`), el dashboard incluye automáticamente **los 12 meses del año**.
  - Si el usuario selecciona explícitamente un año/mes, se filtra a ese periodo; si lo deselecciona o toca la (X), vuelve a la vista completa de todo el histórico de forma limpia.
---

## 🎯 Versión 2.30 - Filtro de Estado de Onboarding (Yes / No)

- **Filtro de Estado de Onboarding en el Sidebar:**
  - Se agregó el bloque `Onboarded Client` con las opciones `Yes` / `No` en [Sidebar.jsx](file:///c:/Users/jtatto/Claude/Projects/Dashboard%20Adopcion%20CX/src/components/Sidebar.jsx).
- **Comportamiento Dinámico:**
  - **Sin seleccionar / Ambos:** Incluye el 100% de la cartera de cuentas (visión general).
  - **`Yes` seleccionado:** Filtra strictly el 100% del dashboard a **cuentas ya incorporadas/habilitadas (`estaIncorporado === true`)**. Permite medir la adopción pura de pedidos en clientes que ya tienen credenciales activas.
  - **`No` seleccionado:** Filtra a **cuentas no incorporadas (`estaIncorporado === false`)** para auditar la cartera pendiente del vendedor.
- **Insignias y Limpieza:**
  - Muestra el chip `Onboarded: Yes` o `Onboarded: No` en el encabezado con su botón **(X)** para limpiar la selección de forma instantánea.
---

## 🎯 Versión 2.31 - Simplificación de Etiqueta a "Onboarded"

- **Actualización de Nombre en Sidebar:**
  - Se simplificó el título del bloque y la etiqueta del listbox en [Sidebar.jsx](file:///c:/Users/jtatto/Claude/Projects/Dashboard%20Adopcion%20CX/src/components/Sidebar.jsx) para decir simplemente **`Onboarded`** (`Yes` / `No`).
---

## 🎯 Versión 2.32 - Estandarización Global de Terminología a "Customer"

- **Reemplazo Universal de "Client" por "Customer":**
  - Se actualizaron todos los encabezados y etiquetas de la interfaz en [ExecutiveRibbon.jsx](file:///c:/Users/jtatto/Claude/Projects/Dashboard%20Adopcion%20CX/src/components/ExecutiveRibbon.jsx) (`Customer Onboarding Penetration`) y [VerticalFunnelCard.jsx](file:///c:/Users/jtatto/Claude/Projects/Dashboard%20Adopcion%20CX/src/components/VerticalFunnelCard.jsx) (`1. Customer Universe`, `2. Onboarded Customers`, `3. Active Digital Customers`).
  - Estandarización 100% en inglés corporativo para operaciones de EE. UU.
---

## 🎯 Versión 2.33 - Especificación Sticky en Ribbon, Embudo Consistente de 3 Pasos & Indicador Doble

- **Implementación Sticky Segura (`sticky top-0 z-30`):**
  - Se configuró el Ribbon Ejecutivo en [ExecutiveRibbon.jsx](file:///c:/Users/jtatto/Claude/Projects/Dashboard%20Adopcion%20CX/src/components/ExecutiveRibbon.jsx) con `sticky top-0 z-30 bg-background/95 backdrop-blur-md shadow-xs border-b border-border/40`.
  - **Verificación de Ancestros:** El contenedor padre directo es el único scroll vertical (`page-scroll`), garantizando que la propiedad `sticky` no se rompa silenciosamente y permanezca flotando por debajo del `ActionDrawer` (`z-50`).
- **Embudo de Conversión Matemáticamente Puro (3 Pasos de Cohorte Única):**
  - Se corrigió [VerticalFunnelCard.jsx](file:///c:/Users/jtatto/Claude/Projects/Dashboard%20Adopcion%20CX/src/components/VerticalFunnelCard.jsx) para tener **exactamente 3 pasos** basados en la misma unidad de cuentas (*Customer Universe* $\rightarrow$ *Onboarded Customers* $\rightarrow$ *Active Digital Customers*).
  - Se removió la falsa cuarta grada y se colocó el porcentaje de adopción transaccional (`Order Adoption Rate`) como un **badge informativo adosado a la base del Paso 3 (Active Digital Customers)**.
- **Indicador Doble en Tarjetas de la Jerarquía:**
  - Se actualizó Renglón 3 en todas las tarjetas de la jerarquía (VPs, Regiones, Mercados y Vendedores) en [ProgressiveHierarchy.jsx](file:///c:/Users/jtatto/Claude/Projects/Dashboard%20Adopcion%20CX/src/components/ProgressiveHierarchy.jsx) para mostrar la doble métrica densa: `Onb: XX.X%` | `Adop: XX.X%`.
---

## 🎯 Versión 2.34 - Implementación Fila Unificada Ribbon-Funnel (ADDENDUM.md)

- **Consolidación en 1 Sola Fila de 4 Columnas:**
  - Se fusionaron los KPIs y el embudo en una única fila de 4 columnas en [ExecutiveRibbon.jsx](file:///c:/Users/jtatto/Claude/Projects/Dashboard%20Adopcion%20CX/src/components/ExecutiveRibbon.jsx):
    1. **Universo asignado:** Primario `# clientes` | Secundario `# órdenes totales`.
    2. **Onboarded:** Primario `# clientes onboardeados` + `▲+N este mes` | Secundario `# órdenes`.
    3. **Activos:** Primario `# clientes activos` + delta | Secundario `# órdenes digitales`.
    4. **Adopción digital:** Primario `% pedidos digitales` (mayor peso visual) | Secundario `# digitales / # totales`.
  - Se eliminó la fila secundaria de `VerticalFunnelCard` en [App.jsx](file:///c:/Users/jtatto/Claude/Projects/Dashboard%20Adopcion%20CX/src/App.jsx).
- **Identificación Dinámica del Cuello de Botella:**
  - Entre cada etapa se calcula dinámicamente el % de caída. La transición con mayor pérdida se destaca automáticamente en rojo/ámbar (`animate-pulse border-rose-500/30`).
- **Formato Headline + Conteo en Jerarquía:**
  - Se formateó Renglón 3 en las tarjetas de [ProgressiveHierarchy.jsx](file:///c:/Users/jtatto/Claude/Projects/Dashboard%20Adopcion%20CX/src/components/ProgressiveHierarchy.jsx) con la estructura especificada: `Onb 75% (21/28 cli)` y `Adop 61% (126 ord)`.
---

## 🎯 Versión 2.35 - Conectores Circulares & Poda de Ruido en Tabla de Jerarquía

- **Conectores Circulares de Transición (Funnel Ribbon):**
  - Se estilizaron los nodos intermedios de transición en [ExecutiveRibbon.jsx](file:///c:/Users/jtatto/Claude/Projects/Dashboard%20Adopcion%20CX/src/components/ExecutiveRibbon.jsx) como insignias circulares flotantes (`w-11 h-11 rounded-full border-2 shadow-md`), destacando en rojo animado (`bg-rose-500 text-white animate-pulse`) la transición del cuello de botella.
- **Poda Confirmada de Ruido en Encabezado de Tabla:**
  - Se eliminaron los textos secundarios redundantes (*"Interactive Organizational Hierarchy"*, *"Order-based adoption breakdown with instant visual channel badges"*, *"Selected Scope:"*) en [ProgressiveHierarchy.jsx](file:///c:/Users/jtatto/Claude/Projects/Dashboard%20Adopcion%20CX/src/components/ProgressiveHierarchy.jsx), manteniendo únicamente la insignia limpia con el alcance activo.
---

## 🎯 Versión 2.36 - Tabla de Ranking Comercial & Gamificación Benchmark (LeaderboardCard)

- **Nuevo Componente `LeaderboardCard.jsx`:**
  - Se creó el componente [LeaderboardCard.jsx](file:///c:/Users/jtatto/Claude/Projects/Dashboard%20Adopcion%20CX/src/components/LeaderboardCard.jsx) para clasificación y benchmarking entre entidades comerciales (Mercado & Línea, Vendedores, Mercados y Regiones).
- **Enfoque Exclusivo en Porcentajes:**
  - Clasificación y ordenamiento exclusivo por métricas de porcentaje: **`Order Adoption %`** y **`Onboarding %`** (sin métricas de volumen ni velocidad para mantener máxima claridad).
- **Gamificación Comercial & Alertas:**
  - **Medallas de Podio (🥇  🥈 🥉):** Destacan visualmente el Top 3 de cada dimensión.
  - **Alerta de Rezagados (⚠️ Lagging):** Marca en rojo/rosa sutil el **Bottom 20%** para enfocar la acción comercial directiva.
  - **Bullet Graph Benchmark:** Muestra la comparación visual respecto al objetivo global del 90.0%.
- **Integración con Action Drawer:**
  - Al hacer clic en cualquier fila del ranking, se abre el [ActionDrawer.jsx](file:///c:/Users/jtatto/Claude/Projects/Dashboard%20Adopcion%20CX/src/components/ActionDrawer.jsx) con la cartera de clientes pendientes de esa entidad específica.
- **Generación de Datos en Repositorio:**
  - Se agregó el método `getLeaderboard()` en [adopcionRepo.js](file:///c:/Users/jtatto/Claude/Projects/Dashboard%20Adopcion%20CX/src/domain/adopcionRepo.js) para calcular los datos del ranking en tiempo real según los filtros activos.
---

## 🎯 Versión 2.37 - Disposición Side-by-Side en Fila 2 & Formato Densa de Tarjetas

- **Rediseño Side-by-Side de la Fila 2:**
  - En [App.jsx](file:///c:/Users/jtatto/Claude/Projects/Dashboard%20Adopcion%20CX/src/App.jsx) se colocó la Gráfica de Tendencia ([AdoptionTrendCard.jsx](file:///c:/Users/jtatto/Claude/Projects/Dashboard%20Adopcion%20CX/src/components/AdoptionTrendCard.jsx)) a la **izquierda** (6 cols) y el Leaderboard ([LeaderboardCard.jsx](file:///c:/Users/jtatto/Claude/Projects/Dashboard%20Adopcion%20CX/src/components/LeaderboardCard.jsx)) a la **derecha** (6 cols), manteniendo **misma altura pareja**.
  - La tabla del Leaderboard se ajustó a `max-h-[195px]` para mostrar exactamente **~4 filas visibles** con scroll interno, permitiendo ver la Jerarquía directamente debajo sin hacer scroll vertical en la página.
- **Formato Limpio de 2 Renglones en Tarjetas de Jerarquía:**
  - En [ProgressiveHierarchy.jsx](file:///c:/Users/jtatto/Claude/Projects/Dashboard%20Adopcion%20CX/src/components/ProgressiveHierarchy.jsx) (VPs, Regiones, Mercados y Vendedores), Renglón 3 se formateó en 2 líneas limpias sin desbordes:
    - **Línea 1:** `28 cli` (izq) | `67.2% onboarded` (der).
    - **Línea 2:** `1,260 ord` (izq) | `54.1% adopted` (der).
---

## 🎯 Versión 2.38 - Reordenamiento de Filas (Jerarquía en Medio) & Simplificación de Ranking

- **Reordenamiento de Filas en la Pantalla (`App.jsx`):**
  - **Fila 1:** Ribbon Ejecutivo 4 Columnas Unificado ([ExecutiveRibbon.jsx](file:///c:/Users/jtatto/Claude/Projects/Dashboard%20Adopcion%20CX/src/components/ExecutiveRibbon.jsx)).
  - **Fila 2:** Navegabilidad de Jerarquía + Tabla de Cartera ([ProgressiveHierarchy.jsx](file:///c:/Users/jtatto/Claude/Projects/Dashboard%20Adopcion%20CX/src/components/ProgressiveHierarchy.jsx)) — ahora al centro del flujo de trabajo.
  - **Fila 3:** Disposición Doble en Par: Tendencia de Adopción ([AdoptionTrendCard.jsx](file:///c:/Users/jtatto/Claude/Projects/Dashboard%20Adopcion%20CX/src/components/AdoptionTrendCard.jsx)) a la izquierda (6 cols) + Ranking ([LeaderboardCard.jsx](file:///c:/Users/jtatto/Claude/Projects/Dashboard%20Adopcion%20CX/src/components/LeaderboardCard.jsx)) a la derecha (6 cols).
- **Simplificación del Ranking (`LeaderboardCard.jsx`):**
  - **Título Simplificado:** Renombrado simplemente a **`Ranking`**.
  - **Eliminación de Subtítulo y Buscador:** Se removió el subtítulo redundante y el cuadro de búsqueda para máxima limpieza.
  - **Eliminación de Columna Benchmark:** Se retiró la barra gráfica de benchmark, dejando una tabla ligera de 5 columnas (Rank, Entity, Line, Onboarded, Adopted).
  - **Control de Altura (`max-h-[175px]`):** Mantiene exactamente ~4 filas visibles con scroll interno, garantizando 0 scroll vertical innecesario.
- **Expansión de Tarjeta de Tendencia (`AdoptionTrendCard.jsx`):**
  - Reconvertida en una tarjeta completa con gráfico de área extendido, gradiente y ejes para ocupar la misma altura que la tarjeta de Ranking a su derecha.
---

## 🎯 Versión 2.39 - Sidebar Angosto en 2 Columnas, Renombrado a "BL" y Poda de Totales

- **Sidebar Más Angosto con Layout de 2 Columnas (`Sidebar.jsx`):**
  - Se redujo el ancho desplegado a `w-48` (192px).
  - Se colocaron los filtros de **Onboarded** y **Active** en un contenedor de 2 columnas lado a lado (`grid grid-cols-2 gap-2`).
  - Se renombró la etiqueta del filtro de "Activo" a **`Active`** en inglés.
- **Encabezado de Tabla de Ranking (`LeaderboardCard.jsx`):**
  - Se cambió el encabezado de la columna de línea de negocio de "Line" a **`BL`** (Business Line).
- **Poda de Fila de Totales en Cartera (`ProgressiveHierarchy.jsx`):**
  - Se redujo el padding vertical de la fila inferior de totales en la tabla de cartera (`py-1.5 px-2`), eliminando la línea redundante de `Onboarding Rate: XX%` para dejar un pie de tabla compacto y de baja altura.
---

## 🎯 Versión 2.40 - Conector Estático en Funnel, Meses en 2 Columnas y Ajuste para Cero-Scroll Vertical

- **Conector de Cuello de Botella Estático (`ExecutiveRibbon.jsx`):**
  - Se removió la animación de parpadeo (`animate-pulse`). El conector de caída es ahora una cápsula horizontal estática en rojo sólido (`bg-rose-500 text-white`) con la flecha alineada horizontalmente (`➔ -28%`).
- **Disposición de Filtros en Sidebar (`Sidebar.jsx`):**
  - El filtro de **Meses** se configuró en **2 columnas** (`gridCols={2}`).
  - Los filtros de **Onboarded** y **Active** se apilaron verticalmente (uno arriba del otro).
- **Optimización de Altura para Cero Scroll Vertical:**
  - Se compactó la altura del Ribbon (`py-1`, `text-lg`).
  - Se estableció un límite de altura `max-h-[190px]` en la tabla de cartera ([ProgressiveHierarchy.jsx](file:///c:/Users/jtatto/Claude/Projects/Dashboard%20Adopcion%20CX/src/components/ProgressiveHierarchy.jsx)), logrando que todo el tablero encaje perfectamente en la pantalla sin necesidad de scroll vertical.
---

## 🎯 Versión 2.41 - Reducción Extra de Ancho del Sidebar (w-[168px])

- **Ajuste Fino de Ancho del Sidebar (`Sidebar.jsx`):**
  - Se ajustó el ancho del sidebar lateral a `w-[168px]` (168px) desplegado y `w-11` (44px) colapsado, otorgando mayor espacio horizontal al área principal de trabajo.
  - Se formateó la tipografía y paddings del encabezado del sidebar (`text-[10px]`, `px-2 py-2`) para un encuadre ultra limpio sin desbordes.
---

## 🎯 Versión 2.42 - Iluminación de Pestañas de Ranking, Eliminación de Lag en Jerarquía e Inglés Corporativo 100%

- **Iluminación Destacada de Pestañas de Ranking (`LeaderboardCard.jsx`):**
  - Se corrigió el estilo del selector de dimensión y ordenamiento para que la pestaña activa se ilumine de forma vistosa en **Azul Primario con texto blanco en negrita (`bg-primary text-primary-foreground font-black shadow-xs`)**.
- **Eliminación de Lag al Hacer Clic en la Jerarquía (`ProgressiveHierarchy.jsx`):**
  - Se reemplazaron los manejadores de selección por arrastre (`onMouseDown` / `onMouseEnter`) con manejadores síncronos limpios de `onClick`, eliminando la latencia en las tarjetas de VPs, Regiones, Mercados y Vendedores.
- **Traducción 100% a Inglés Corporativo en Ribbon (`ExecutiveRibbon.jsx`):**
  - Se renombraron los títulos del embudo: **`Total Customers`**, **`Onboarded`**, **`Active`** y **`Digital Adoption`**.
  - Se tradujeron todas las etiquetas y deltas secundarios (`accounts`, `total orders`, `onboarded orders`, `active orders`, `digital orders`, `this month`, `vs 90.0% Goal`).
- **Limpieza de Encabezado en Sidebar (`Sidebar.jsx`):**
  - Se eliminó el texto redundante `"Time Context"` y el ícono de filtro en la cabecera del sidebar.
---

## 🎯 Versión 2.43 - Caché Ultra Rápida de Métricas Jerárquicas (`adopcionRepo.js`)

- **Caché en Memoria `_jerarquiaCache`:**
  - Se implementó una caché en memoria en `AdopcionRepository.getJerarquia()` que guarda instantáneamente el resultado de agregación de métricas de nodos por nivel y filtro.
  - **Resultado:** Elimina el recálculo pesado de arrays al seleccionar tarjetas en el navegador de jerarquía, acelerando la respuesta a **<1ms** sin pantallazos blancos ni retardos.
---

## 🎯 Versión 2.44 - Rediseño Unificado del Ribbon Ejecutivo (0 Botones Flotantes)

- **Panel Ejecutivo Unificado (`ExecutiveRibbon.jsx`):**
  - Se eliminaron por completo las insignias/botones flotantes externos que desalineaban las tarjetas.
  - Se convirtió el ribbon en **un único panel ejecutivo contenedor continuo** con divisores verticales limpios (`divide-x`).
  - Las métricas de caída (`➔ -28%` / `➔ -15%`) se integraron limpiamente como micro-insignias en la cabecera superior derecha de cada etapa.
---

## 🎯 Versión 2.45 - Conectores Inter-Tarjetas de Embudo en Layout Flex Propio (`ExecutiveRibbon.jsx`)

- **Canal de Conector Inter-Tarjetas Dedicado (`ExecutiveRibbon.jsx`):**
  - Se restauró la presencia visual del conector de transición **ENTRE cada tarjeta**, eliminando la posición absoluta que encimaba los bordes.
  - Se ubicaron como elementos Flex dedicados (`shrink-0 flex items-center justify-center`), logrando una alineación perfecta en altura y centrado exacto entre las 4 tarjetas independientes.
---

## 🎯 Versión 2.46 - Adición del 3er Conector Inter-Tarjetas (Active ➔ Digital Adoption)

- **3er Conector de Transición en Embudo (`ExecutiveRibbon.jsx`):**
  - Se agregó el tercer conector de transición entre la Etapa 3 (**Active**) y la Etapa 4 (**Digital Adoption**), mostrando la brecha de ordenes analógicas respecto al 100% de la adopción digital.
  - Ahora las 3 transiciones intermedias (`Total Customers ➔ Onboarded ➔ Active ➔ Digital Adoption`) cuentan con sus 3 conectores visibles y perfectamente alineados entre tarjetas.
---

## 🎯 Versión 2.47 - Deltas de Crecimiento en Números Enteros (`ExecutiveRibbon.jsx`)

- **Deltas en Números Enteros para Etapa 2 y 3 (`ExecutiveRibbon.jsx`):**
  - Se cambió el formato del delta de crecimiento mensual en la tarjeta 2 (**Onboarded**) y tarjeta 3 (**Active**) de porcentaje (`%`) a **números enteros netos de cuentas** (`▲+48 this month` y `▲+18 this month`).
---

## 🎯 Versión 2.48 - Recálculo Dinámico de Deltas con Filtros de Contexto (`adopcionRepo.js`)

- **Recálculo Dinámico de `clientesMoMNetos` y `activosMoMNetos`:**
  - Se reemplazaron las propiedades estáticas por un cálculo dinámico en `AdopcionRepository.getMetricasGlobales(filtros)`.
  - **Resultado:** Al filtrar por cualquier dimensión (sidebar, VPs, Regiones, Mercados, Vendedores), los deltas enteros del ribbon se recalculan inmediatamente en tiempo real para reflejar exactamente el segmento seleccionado.
---

## 🎯 Versión 2.49 - Filtrado Real del Universo de Cuentas por Año y Mes (`adopcionRepo.js`)

- **Encuadre de Cuentas por Periodo Temporal (`_filtrar` en `adopcionRepo.js`):**
  - Se implementó la intersección del universo de cuentas con las transacciones activas del periodo seleccionado (`hasTimeFilter`).
  - **Resultado:** Al seleccionar un año específico (ej. 2024 o 2025) o mes(es) específico(s) en el sidebar, **todas las métricas del Ribbon (Total Customers, Onboarded, Active, Digital Adoption y sus 3 conectores de porcentaje)** se recalculan verdaderamente al universo de cuentas y transacciones del periodo elegido.
---

## 🎯 Versión 2.50 - Agregación Dinámica de Clientes Activos y Asignados por Periodo (`aggregation.js`)

- **Conteo Dinámico de Cuentas Activas y Asignadas en `calculateAggregations` (`aggregation.js`):**
  - Se corrigió el cálculo de `totalActivos`, `totalOnboarded` y `totalAsignados` para que compute las cuentas con transacciones digitales reales en las transacciones del periodo filtrado (`digitalClientIds`).
  - **Resultado:** Al filtrar por cualquier Año, Mes, Onboarded o Activos en el sidebar, las tarjetas del Ribbon actualizan en tiempo real tanto el conteo de clientes como el número de órdenes y la tasa de adopción digital del periodo.
---

## 🎯 Versión 2.51 - Auditoría y Centralización Pura de Filtrado Reactivo en Toda la Capa de Datos (`adopcionRepo.js` & `aggregation.js`)

- **Eliminación Total de `_jerarquiaCache`:**
  - Se removió por completo la caché estática de niveles jerárquicos que retenía valores anteriores al alternar filtros del sidebar.
- **Armonización de Universo de Cuentas vs Transacciones por Periodo:**
  - `clientes` mantiene la cartera asignada según la estructura seleccionada (VPs, Regiones, Mercados, Vendedores, Líneas, Onboarded, Active).
  - `transacciones` se filtra por las claves exactas de años y meses seleccionados.
  - `totalActivos` determina las cuentas con compras digitales en el periodo (`digitalClientIds`), logrando una reactividad 100% precisa y libre de inconsistencias en todo el tablero.
---

## 🎯 Versión 2.52 - Eliminación de Salto de Layout y Traslape de Etiquetas en Sidebar (`Sidebar.jsx` & `FilterListbox.jsx`)

- **Bloqueo de Altura en Barra de Estado de Filtros (`Sidebar.jsx`):**
  - Se fijó la altura de la barra superior de estado a `h-7 shrink-0` de forma permanente.
  - **Resultado:** Seleccionar o deseleccionar filtros ya no inserta elementos dinámicos que empujen el contenido hacia abajo (0 desfasamiento vertical / 0 layout shift).
- **Prevención de Traslape de Textos en Etiquetas (`FilterListbox.jsx`):**
  - Se simplificó la cabecera de cada bloque de filtro a un enlace compacto `Clear (N)` a la derecha.
  - **Resultado:** Las palabras de las etiquetas (`Year`, `Month`, `Onboarded`, `Active`) ya no son tapadas ni encimadas por insignias o botones redundantes.
---

## 🎯 Versión 2.53 - Eliminación de Columna "Country" y Estandarización 100% Inglés ("customers" / "orders") (`ProgressiveHierarchy.jsx`)

- **Eliminación de la Columna "Country" / "USA National Scope":**
  - Se removió la referencia a nivel de país en la cabecera de la jerarquía progresiva (`All Divisions`).
- **Estandarización de Términos al Inglés ("customers" / "orders"):**
  - Se reemplazaron todas las palabras en español (`cuentas`, `órdenes`, `cli`, `ord`) por **`customers`** y **`orders`** en los 4 niveles de tarjetas (VP, Region, Market, Sales Rep) y en los totales del pie de la tabla (`TOTALS (N CUSTOMERS)`).
---

## 🎯 Versión 2.54 - Remoción Definitiva de Columna "Country" y Diseño Chevron para el Ribbon (`ProgressiveHierarchy.jsx` & `ExecutiveRibbon.jsx`)

- **Eliminación Total de la 1ra Columna "COUNTRY" (`ProgressiveHierarchy.jsx`):**
  - Se removió por completo el nodo `<motion.div key="country-col">` que renderizaba la columna `🌐 COUNTRY` con la tarjeta `USA National`.
  - **Resultado:** La navegación jerárquica ahora inicia directamente con la 1ra columna **`🌐 VP DIVISION`**, seguida de **`Director Region`**, **`Manager Market`**, **`Sales Rep`** y la tabla de cartera.
- **Diseño Chevron Estético para las 4 Tarjetas del Ribbon (`ExecutiveRibbon.jsx`):**
  - Se rediseñó el ribbon ejecutivo incorporando insignias de etapa numeradas (`01`, `02`, `03`, `04`) y conectores de flujo `ChevronRight` entre tarjetas para una geometría de embudo ejecutivo altamente pulida.
---

## 🎯 Versión 2.55 - Título de Cabecera Estandarizado a "USA" (`ProgressiveHierarchy.jsx`)

- **Actualización del Título de Nivel Superior (`ProgressiveHierarchy.jsx`):**
  - Se cambió el nombre por defecto en el encabezado de `All Divisions` a **`USA`**.
  - **Resultado:** La cabecera muestra limpiamente **`USA 2164 customers · 536,785 orders`**.
---

## 🎯 Versión 2.56 - Extensión Vertical 100% de la Tabla de Cartera (`ProgressiveHierarchy.jsx`)

- **Eliminación de la Restricción `max-h-[190px]` (`ProgressiveHierarchy.jsx`):**
  - Se removió la cota rígida de 190px que dejaba un hueco blanco en la parte inferior del panel derecho.
  - **Resultado:** La tabla de cartera se estira verticalmente al 100% de la altura disponible del contenedor (`flex-1 min-h-0`), con el encabezado fijo arriba, filas intermedias distribuidas y la fila de totales (`TOTALS CUSTOMERS`) anclada perfectamente al pie.
---

## 🎯 Versión 2.57 - Alto Contraste en Píldoras RMX/CEM/AGG y Micro-píldora para Sales Reps (`ProgressiveHierarchy.jsx`)

- **Contraste de Alto Nivel para Píldoras Seleccionadas (`ProgressiveHierarchy.jsx`):**
  - Se actualizaron las píldoras de línea de negocio (`RMX`, `CEM`, `AGG`) en tarjetas seleccionadas a fondos de alto brillo con texto en negro profundo (`bg-sky-300 text-slate-950`, `bg-purple-300 text-slate-950`, `bg-amber-300 text-slate-950`).
- **Diseño de Micro-píldora Real para Sales Reps (`ProgressiveHierarchy.jsx`):**
  - Se transformó el texto plano de línea en las tarjetas de vendedores en una micro-píldora estilizada con borde y sombra (`shadow-2xs`), alineada perfectamente a la derecha.
---

## 🎯 Versión 2.58 - Recorte de Textos a "onboard" y "adopt" en Tarjetas Jerárquicas (`ProgressiveHierarchy.jsx`)

- **Recorte de Sufijos en Métricas de Tarjetas (`ProgressiveHierarchy.jsx`):**
  - Se recortó `onboarded` a **`onboard`** y `adopted` a **`adopt`** en los 4 niveles de tarjetas de navegación (VP, Director Region, Manager Market, Sales Rep).
  - **Resultado:** Etiquetas ultracompactas (`XX.X% onboard` y `XX.X% adopt`) para un ajuste visual perfecto.
---

## 🎯 Versión 2.59 - Unidad "customers" en Ribbon y Formateo Compacto en "K" con Tooltip Exacto (`ExecutiveRibbon.jsx`, `ProgressiveHierarchy.jsx`, `utils.js`)

- **Cambio de Unidad en Ribbon (`ExecutiveRibbon.jsx`):**
  - Se cambió `accounts` por **`customers`** en las unidades primarias del Ribbon.
- **Formateo Compacto en "K" con 1 Decimal para Órdenes > 1,000 (`utils.js`):**
  - Se implementó `formatCompactNumber(num)` (ej. 178,684 $\rightarrow$ **`178.7k orders`**).
  - Se aplicó al Ribbon y a los 4 niveles de tarjetas (VP, Region, Market, Sales Rep).
  - Se agregó atributo `title` con cursor de ayuda (`cursor-help`) para mostrar el conteo exacto de órdenes formateado con comas al posar el cursor (`title="178,684 total orders"`).
---

## 🎯 Versión 2.60 - Títulos Estandarizados en Tarjetas del Ribbon (`ExecutiveRibbon.jsx`)

- **Actualización de Títulos de Etapa (`ExecutiveRibbon.jsx`):**
  - **Tarjeta 2:** `Onboarded` $\rightarrow$ **`Onboarded Customers`**.
  - **Tarjeta 3:** `Active` $\rightarrow$ **`Active Customers`**.
  - **Tarjeta 4:** `Digital Adoption` $\rightarrow$ **`Orders Adoption`**.
  - **Resultado:** Nombres de tarjetas 100% claros y corporativos en el Ribbon superior.
---

## 🎯 Versión 2.61 - Simplificación de Subtítulos de Órdenes a "orders" (`ExecutiveRibbon.jsx`)

- **Simplificación de Etiquetas Secundarias (`ExecutiveRibbon.jsx`):**
  - **Tarjeta 2 (Onboarded Customers):** `XXk onboarded orders` $\rightarrow$ **`XXk orders`**.
  - **Tarjeta 3 (Active Customers):** `XXk active orders` $\rightarrow$ **`XXk orders`**.
  - **Resultado:** Subtítulos ultracompactos y limpios sin redundancias de calificadores.
---

## 🎯 Versión 2.62 - Conteo de Órdenes Totales de Clientes Activos (`aggregation.js` & `ExecutiveRibbon.jsx`)

- **Cálculo de Órdenes Totales de Clientes Activos (`aggregation.js`):**
  - Se agregó `pedidos.activosTotales` en `calculateAggregations`, sumando todas las órdenes (digitales + analógicas) de los clientes que han realizado al menos una compra digital (`digitalClientIds`).
- **Subtítulo de Tarjeta 3 (`ExecutiveRibbon.jsx`):**
  - La tarjeta **Active Customers** muestra ahora las **órdenes totales** generadas por esos clientes activos (ej. **`426.7k orders`** en lugar de solo las digitales), respetando su comportamiento híbrido.
  - El tooltip desplegable informa: `426,744 total orders of active customers`.
---

## 🎯 Versión 2.63 - Homogeneización de Subtítulo en Tarjeta 4 y Remoción de "vs 90% Goal" (`ExecutiveRibbon.jsx`)

- **Subtítulo Limpio en Tarjeta 4 (Orders Adoption):**
  - Muestra ahora **`XXk orders`** (órdenes digitales transaccionadas) con tooltip desplegable de detalle exacto (`title="276,444 adopted digital orders (out of 536,785 total)"`).
- **Remoción de Insignia Redundante (`ExecutiveRibbon.jsx`):**
  - Se eliminó el texto `vs 90% Goal` del pie de la tarjeta 4.
  - **Resultado:** Las 4 tarjetas del Ribbon mantienen una alineación y formato de subtítulo perfectamente uniforme.
---

## 🎯 Versión 2.64 - División de Rankings en 2 Tablas Paralelas (Onboarding & Orders Adoption) (`LeaderboardCard.jsx`)

- **Reestructuración de Módulo de Rankings (`LeaderboardCard.jsx`):**
  - Se dividió el panel de ranking en **2 tablas simultáneas lado a lado** dentro del mismo espacio disponible (`grid grid-cols-2`):
    1. **Tabla 1 (Izquierda):** **Onboarding Ranking** (ordenado por tasa de incorporación % + conteo de clientes `X/Y cust`).
    2. **Tabla 2 (Derecha):** **Orders Adoption Ranking** (ordenado por tasa de adopción de órdenes % + conteo de pedidos `X/Y ord`).
  - **Pestañas de Dimensión Compartidas:** Ambas tablas recalculan sus posiciones en paralelo al alternar las pestañas `Line`, `Reps`, `Markets`, `Regions`.
---

## 🎯 Versión 2.65 - Anclaje Rígido de Altura a 255px en Módulo de Rankings (`LeaderboardCard.jsx`)

- **Restricción de Altura Máxima (`LeaderboardCard.jsx`):**
  - Se aplicó `h-[255px] max-h-[255px]` al contenedor principal del Card de Rankings para alinearlo al milímetro con la tarjeta de Tendencia Histórica a la izquierda.
  - Se asignó `max-h-[160px]` a las 2 mini-tablas internas con scroll suave (`scrollbar-thin`), evitando cualquier desbordamiento o estiramiento vertical infinito.
---

## 🎯 Versión 2.66 - Palabras Completas "customers" y "orders" en Subtítulos de Rankings (`LeaderboardCard.jsx`)

- **Expansión de Abreviaturas (`LeaderboardCard.jsx`):**
  - Se reemplazó `cust` por **`customers`** en el subtítulo gris del Ranking de Onboarding.
  - Se reemplazó `ord` por **`orders`** en el subtítulo gris del Ranking de Adopción de Pedidos.
  - **Resultado:** Textos completos (`X/Y customers` y `Xk/Yk orders`) con legibilidad corporativa perfecta.
---

## 🎯 Versión 2.67 - Renombrado de Encabezado a "Main Channel" en Tabla de Cartera (`ProgressiveHierarchy.jsx`)

- **Actualización de Encabezado de Columna (`ProgressiveHierarchy.jsx`):**
  - Se renombró la columna `Channel` a **`Main Channel`** en la tabla de cartera de clientes (*Account Portfolio*).
  - **Resultado:** Claridad explícita sobre el canal transaccional predominante del cliente (Web, App, EDI, Phone).
---

## 🎯 Versión 2.68 - Desglose de Órdenes en Columnas "Online", "Offline" y "Total" (`ProgressiveHierarchy.jsx`)

- **Partición de Columna de Órdenes (`ProgressiveHierarchy.jsx`):**
  - Se sustituyó la columna única `Total Orders` por 3 columnas claras y estilizadas de 1 solo renglón en el encabezado (`h-8`):
    1. **`Online`** (texto azul `text-sky-700 dark:text-sky-400` para transacciones digitales Web/App/EDI).
    2. **`Offline`** (texto gris `text-slate-500` para compras telefónicas/analógicas).
    3. **`Total`** (texto en negrita para la suma total).
  - **Pie de Tabla Sincronizado:** La fila de totales inferiores (`TOTALS CUSTOMERS`) suma independientemente las órdenes `Online`, `Offline` y `Total`.
---

## 🎯 Versión 2.69 - Remoción Completa de FTTV y Códigos Sintéticos "CLI" (`ProgressiveHierarchy.jsx`, `ActionDrawer.jsx`, `App.jsx`)

- **Limpieza de Identificadores Sintéticos y Métrica FTTV:**
  - Se removió el código inventado `CLI-XXXXX` de los nombres de clientes en la tabla de cartera (`ProgressiveHierarchy.jsx`), ActionDrawer (`ActionDrawer.jsx`) y reporte CSV (`App.jsx`).
  - Se eliminaron las insignias y referencias a la métrica **FTTV** (días a la primera compra) de todo el tablero.
---

## 🎯 Versión 2.70 - Eliminación de la Columna "Main Channel" en la Tabla Principal (`ProgressiveHierarchy.jsx`)

- **Remoción de Columna Redundante (`ProgressiveHierarchy.jsx`):**
  - Se eliminó la columna `Main Channel` de la vista principal de la tabla de cartera de clientes.
  - **Resultado:** El detalle de canales transaccionales (Web, App, EDI, Phone) se consulta al hacer clic para desplegar el drawer de la fila, permitiendo que las columnas principales de pedidos (**Online**, **Offline**, **Total**, **Adoption %**) aprovechen el 100% del ancho del contenedor.
---

## 🎯 Versión 2.71 - Estatus de Cartera Alineados al Embudo (Pending, Onboarded, Active) (`ProgressiveHierarchy.jsx`)

- **Alineación de Estatus de Clientes al Embudo (`ProgressiveHierarchy.jsx`):**
  - Se reemplazaron los badges binarios por 3 estatus acordes al embudo ejecutivo:
    1. **`Pending`** (Insignia Roja): Cliente aún no registrado en la plataforma CX.
    2. **`Onboarded`** (Insignia Azul): Cliente registrado en la plataforma pero con 0 compras digitales en el periodo (100% compras telefónicas).
    3. **`Active`** (Insignia Verde): Cliente registrado con transacciones digitales activas en el periodo.