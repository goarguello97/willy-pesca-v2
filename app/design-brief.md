# Willy Pesca: dirección deportiva (design brief)

**Design read:** el pescador que compara antes de comprar: quiere ver el equipo, sus números y preguntar stock en un toque. Registro: catálogo de marca de pesca deportiva, enérgico y preciso, sin perder que atrás hay un comercio de pueblo.

**Concept spine:** "la ficha técnica". Cada equipo se presenta como en un catálogo de marca: producto grande, etiquetas que señalan sus datos y una tabla para compararlos. Todo termina en la misma acción: consultar stock por WhatsApp con el equipo ya nombrado.

**Delivery tier:** editorial (tipografía y fotos reales, micro-motion motivado).

Animation mode: non-animated — user picked Non-animated at intake ("Sin animar") y pidió no generar recursos

**Asset constraint (user):** cero generación con IA (0,55 créditos y el usuario eligió "Sin generar"). Fotos reales del Instagram del negocio; marca, favicon e íconos en SVG a mano; WhatsApp/Instagram desde `simple-icons` (CC0); OG e íconos PNG rasterizados localmente desde el sitio.

**Tier-1 technique (custom, non-catalog):** "Vitrina con lectura técnica". El hero muestra un equipo grande con dos etiquetas técnicas (tipo y rulemanes o largo); debajo, una tira con los 10 equipos. Pasar el mouse, tocar o navegar con teclado cambia el equipo de la vitrina con un barrido diagonal, actualiza las etiquetas y el CTA "Consultá stock" pasa a nombrar ese equipo en el mensaje. Responde al input del usuario (no es un loop). Mobile: la tira es un carrusel horizontal con scroll-snap y se elige por toque. Reduced motion: cambio instantáneo sin barrido.

**Locked palette** (Cobalto + blanco, de la gama de las cajas de reels Spinit/Albatros):
- `--blanco` `#f3f4f6` fondo
- `--tarjeta` `#ffffff` superficies
- `--tinta` `#0c1424` texto, barra de navegación, pie y banda de parrillas
- `--gris` `#4b5568` texto secundario
- `--filete` `#d5d9e0` filetes
- `--cobalto` `#2340c8` único acento (CTA, estados activos, bandas inclinadas)
Defensa: fondo claro con cobalto saturado (no es negro + neón azul); sale de los envases reales de los productos.

**Locked type:** Barlow Condensed 800 itálica (display, mayúsculas) + Barlow (cuerpo) + JetBrains Mono (datos). Justificación: condensada itálica es el idioma visual de catálogos de pesca deportiva y entra en columnas angostas; sin serif.

**Corner language:** recto. Los CTA principales son paralelogramos (corte a 12px); las bandas de fondo, inclinadas -14°. Nada redondeado salvo el nudo de las etiquetas.

**Section plan:**
1. Barra de navegación tinta (una línea, 64px).
2. Hero: split con vitrina interactiva (texto izquierda, producto + tira derecha).
3. Comparador: pestañas Reels/Cañas + tabla (en celular, filas apiladas).
4. Taller: foto vertical + panel "Orden de taller" con formulario a WhatsApp.
5. Parrillas: banda tinta a sangre, foto a la derecha.
6. Ubicación: mapa + ficha de datos en lista mono.
7. Pie tinta.
Familias: split-vitrina, tabla, split+panel formulario, banda oscura, mapa+lista, pie. Eyebrows: 0.

**CTA inventory:**
- `CtaEncabezado` "Escribinos": texto blanco con subrayado cobalto que crece.
- `CtaStock` "Consultá stock": paralelogramo cobalto, condensada itálica; hover avanza 4px.
- `EnlaceComparar` "Comparar equipos": mono subrayado.
- `ConsultarFila` "Consultar": cobalto con flecha que corre.
- `BotonArreglo` "Pedir arreglo": barra tinta con bloque cobalto y flecha a la derecha.
- `CtaParrilla` "Pedir parrilla": texto blanco con barra cobalto inclinada debajo que se llena en hover.
- `EnlaceComoLlegar` "Cómo llegar": mono con flecha diagonal.

**Anti-convergence vs build anterior (sitio "la línea"):** paleta (agua+fluo → blanco+cobalto), tipo (Outfit → Barlow Condensed), hero (tanza colgante → vitrina con tira), técnica (física de péndulo → selector con barrido), garments (bloque con sombra → paralelogramos), esquinas (etiqueta recortada → paralelogramo/inclinado). Difiere en 6/6.
