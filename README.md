# Demo tótem de pago — Tutto Freddo

Kiosko de autopedido con el menú real de Tutto Freddo Challuabamba (81 productos, fotos y precios).

La app está hecha en **React 18 + Vite** y vive en `frontend/src/`:

```
frontend/src/
├── App.jsx            # navegación entre pantallas, carrito, inactividad
├── screens/           # Attract, Menu, Group, Cart, Payment, PayTerminal, Done
├── components/        # ProductSheet, ProductCard, Dialog, ui (TopBar, CartBar…)
├── lib/               # catálogo, carrito, validación de cédula/RUC
└── data/catalog.json  # generado desde data/
```

`Untitled.html` (wireframe) y `design/kiosko-tuttofredo.html` (prototipo previo) son solo referencia de diseño.

## Correr el demo

Requiere Node 18 o superior.

```bash
cd frontend
npm install
npm run dev
```

Abre la URL que aparece (por defecto http://localhost:5173). Para usarlo como tótem, abre Chrome en pantalla completa (F11) o en modo kiosko:

```bash
chrome --kiosk http://localhost:5173
```

Funciona en vertical (tótem 1080×1920) y en horizontal (laptop).

## Publicado en GitHub Pages

Cada push a la rama `claude/tuttofredo-payment-totem-16yzp8` se publica solo con `.github/workflows/pages.yml` en:

https://jarrin-kevin.github.io/Demo-TUTTOFREDO/

Solo hace falta configurarlo una vez: **Settings → Pages → Build and deployment → Source: GitHub Actions**.

## Flujo

1. **Inicio**: fotos del menú rotando, "Toca para ordenar".
2. **Menú**: los 9 grupos.
3. **Grupo**: barra lateral con los grupos y pestañas si hay subcategorías (ej. Helado artesanal / Helado soft). El botón `+` agrega directo los productos sin opciones.
4. **Personalizar**: opciones obligatorias marcadas (sabor, jugo, bebida caliente, tamaño…). No deja agregar hasta completarlas.
5. **Tu pedido**: editar, cambiar cantidades, sugerencia de bebida (o de postre si ya hay bebida) y desglose de IVA 15 % (los precios ya lo incluyen).
6. **Pago**: tarjeta, Deuna/QR o efectivo en caja, más datos de facturación SRI (cédula, RUC o consumidor final hasta $50).
7. **Cobro simulado**: barra "MODO DEMO" para aprobar o rechazar.
8. **Confirmación**: número de pedido y reinicio automático.

Si nadie toca la pantalla durante 75 s, pregunta "¿Sigues ahí?" y a los 15 s vuelve al inicio.

## Datos

- `data/catalog-raw.json`: menú crudo bajado de Clickeame (solo menú y datos públicos del local).
- `data/kiosk-config.js`: ajustes del tótem (9 grupos, IVA, sugerencia de bebidas, nombres corregidos, sabor obligatorio).
- `frontend/src/data/catalog.json`: catálogo que usa la app. **No se edita a mano**; se genera así:

```bash
node data/build-catalog.js --skip-images   # regenera el JSON sin volver a bajar fotos
node data/build-markdown.js                # regenera CATALOGO.md
```

## Pendiente para producción

- Integración real del datáfono (Datafast) y de Deuna. Hoy el cobro está simulado en `frontend/src/screens/PayTerminal.jsx`.
- Envío del pedido a cocina/POS y emisión de la factura electrónica. Hoy el pedido solo se registra en la consola del navegador (`finishOrder` en `App.jsx`).
