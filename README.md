# Demo tótem de pago — Tutto Freddo

Kiosko de autopedido con el menú real de Tutto Freddo Challuabamba (81 productos, fotos y precios).

**Demo:** https://jarrin-kevin.github.io/Demo-TUTTOFREDO/

Funciona en vertical (tótem 1080×1920) y en horizontal.

## Flujo

1. **Inicio**: video de invitación en bucle (brownie + helado), "Toca para ordenar".
2. **Menú**: los 9 grupos.
3. **Grupo**: barra lateral con los grupos y pestañas si hay subcategorías (ej. Helado artesanal / Helado soft). El botón `+` agrega directo los productos sin opciones.
4. **Personalizar**: opciones obligatorias marcadas (sabor, jugo, bebida caliente, tamaño…). No deja agregar hasta completarlas.
5. **Tu pedido**: editar, cambiar cantidades, sugerencia de bebida (o de postre si ya hay bebida) y desglose de IVA 15 % (los precios ya lo incluyen).
6. **Pago**: tarjeta, Deuna/QR o efectivo en caja, más datos de facturación SRI (cédula, RUC o consumidor final hasta $50).
7. **Cobro simulado**: barra "MODO DEMO" para aprobar o rechazar.
8. **Confirmación**: número de pedido y reinicio automático.

Si nadie toca la pantalla durante 75 s, pregunta "¿Sigues ahí?" y a los 15 s vuelve al inicio.

## Código

Hecho en **React 18 + Vite**, en `frontend/src/`:

```
frontend/src/
├── App.jsx            # navegación entre pantallas, carrito, inactividad
├── screens/           # Attract, Menu, Group, Cart, Payment, PayTerminal, Done
├── components/        # ProductSheet, ProductCard, Dialog, ui (TopBar, CartBar…)
├── lib/               # catálogo, carrito, validación de cédula/RUC
└── data/catalog.json  # generado desde data/
```

`Untitled.html` (wireframe) y `design/kiosko-tuttofredo.html` (prototipo previo) son solo referencia de diseño.

## Datos

- `data/catalog-raw.json`: menú crudo bajado de Clickeame.
- `data/kiosk-config.js`: ajustes del tótem (9 grupos, IVA, sugerencia de bebidas, nombres corregidos, sabor obligatorio).
- `frontend/src/data/catalog.json`: catálogo que usa la app, generado a partir de los dos anteriores.

## Pendiente para producción

- Integración real del datáfono (Datafast) y de Deuna. Hoy el cobro está simulado.
- Envío del pedido a cocina/POS y emisión de la factura electrónica.
