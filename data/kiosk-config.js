// Ajustes del tótem sobre el menú crudo de Clickeame.
// build-catalog.js los aplica al generar frontend/src/data/catalog.json,
// así el JSON se puede regenerar sin perder las correcciones.

module.exports = {
  // Los precios del menú ya incluyen IVA (15 % en Ecuador).
  tax: { rate: 0.15, pricesIncludeTax: true },

  // Los 9 botones de la pantalla "Menú". Cada grupo junta una o más
  // categorías del menú original; si tiene varias se muestran como pestañas.
  // title: palabra grande del botón; caption: texto debajo del recuadro.
  // image: foto cuadrada del botón; cover: banner del encabezado.
  groups: [
    { slug: 'desayunos', name: 'Desayunos', title: 'Desayunos', caption: 'Desayunos y pancakes', image: 'desayuno-costeno', cover: 'desayunos', categories: ['desayunos', 'pancakes'] },
    { slug: 'sanduches-y-snacks', name: 'Sánduches y Snacks', title: 'Sánduches', caption: 'Sánduches, empanadas y tartas', image: 'club', cover: 'sanduches', categories: ['sanduches', 'nueva-linea-de-sal'] },
    { slug: 'pizzas-y-lasana', name: 'Pizzas y Lasaña', title: 'Pizzas', caption: 'Pizzas y lasaña', image: 'hawayana', cover: 'pizza', categories: ['pizza', 'lasana'] },
    { slug: 'alitas-y-ensaladas', name: 'Alitas y Ensaladas', title: 'Alitas', caption: 'Alitas BBQ y ensaladas', image: 'alitas', cover: 'alitas-bbq', categories: ['alitas-bbq', 'ensaladas'] },
    { slug: 'crepes', name: 'Crepes', title: 'Crepes', caption: 'Crepes de sal y de dulce', image: 'nutella', cover: 'crepes-de-dulce', categories: ['crepes-de-sal', 'crepes-de-dulce'] },
    { slug: 'helados', name: 'Helados', title: 'Helados', caption: 'Helado artesanal y soft', image: 'mantecado-oreo', cover: 'helados', categories: ['helados', 'helados-soft'] },
    { slug: 'postres-y-tortas', name: 'Postres y Tortas', title: 'Postres', caption: 'Postres y tortas', image: 'tiramisu', cover: 'postres', categories: ['postres', 'tortas'] },
    { slug: 'bebidas', name: 'Bebidas', title: 'Bebidas', caption: 'Jugos, limonadas, tés y más', image: 'limonada-de-frutos-rojos-y-rosas', cover: 'bebidas-frias', categories: ['bebidas-frias'] },
    { slug: 'combos', name: 'Combos', title: 'Combos', caption: 'Combos familiares', image: 'combo-cumpleanero', cover: 'combos-familiares', categories: ['combos-familiares'] },
  ],

  // Nombres de pestaña más cortos cuando la categoría vive dentro de un grupo.
  categoryLabels: {
    'helados': 'Helado artesanal',
    'helados-soft': 'Helado soft',
    'nueva-linea-de-sal': 'Empanadas y tartas',
    'bebidas-frias': 'Bebidas frías',
    'combos-familiares': 'Combos familiares',
  },

  // Sugerencia en el carrito: casi siempre se pide bebida con la comida.
  upsell: { group: 'bebidas', title: '¿Algo para tomar?' },

  // Nombres repetidos en el menú original (se ven iguales en el carrito).
  renameItems: {
    '62545ac7-cea3-47f7-ae2d-e3788a1dd52a': 'Pancakes Americanos', // vs. desayuno "Americano"
    'd1f5d4b2-d080-49d6-92f6-8df487e01146': 'Torta Selva Negra', // vs. porción "Selva negra"
  },

  // Litro, medio litro y combo: se elige exactamente un sabor.
  requiredOptionGroups: ['Sabores de helado'],
};
