# Demo tótem de pago — Tutto Freddo

Kiosko de autopedido con el menú real de Tutto Freddo Challuabamba (81 productos, fotos y precios).

**Demo:** https://jarrin-kevin.github.io/Demo-TUTTOFREDO/

Funciona en vertical (tótem 1080×1920) y en horizontal.

## Flujo

1. **Inicio**: video de invitación en bucle y el botón "Toca para ordenar".
2. **Menú**: 9 recuadros con el nombre grande en los colores de Tutto Freddo.
3. **Grupo**: productos en filas grandes (foto, nombre, descripción, precio). Toda la fila se toca y queda resaltada si ya está en el pedido. Pestañas si hay subcategorías (ej. Helado artesanal / Helado soft).
4. **Personalizar**: opciones obligatorias marcadas (sabor, jugo, bebida caliente, tamaño…). No deja agregar hasta completarlas.
5. **Tu pedido**: editar, cambiar cantidades, sugerencia de bebida (o de postre si ya hay bebida) y desglose de IVA 15 % (los precios ya lo incluyen).
6. **Datos de facturación**: siempre, sin importar cómo se pague (cédula, RUC o consumidor final hasta $50).
7. **Método de pago**: tarjeta, Deuna (código único de 6 dígitos) o efectivo en caja.
8. **Cobro**: con Deuna el tótem muestra un código único de 6 dígitos; el cliente lo digita en su app, ve el monto, paga y el tótem muestra "¡Pago aceptado!". En el demo se simula con la barra "MODO DEMO".
9. **Confirmación**: número de pedido, impresión automática del ticket (80 mm, con logo; con datos del cliente o "CONSUMIDOR FINAL") y reinicio automático.

Si nadie toca la pantalla durante 75 s, pregunta "¿Sigues ahí?" y a los 15 s vuelve al inicio.

## Usar en el tótem

1. En Windows, deja la impresora térmica de 80 mm como **impresora predeterminada**.
2. Abre `kiosko/abrir-tutto-freddo.bat`: abre el tótem en pantalla completa e imprime el ticket directo, sin diálogo (`--kiosk --kiosk-printing`). Para salir: Alt+F4.

El ticket se imprime con el alto exacto de su contenido, así la impresora corta al ras.

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
