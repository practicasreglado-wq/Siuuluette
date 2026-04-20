# Siuuluette Brand — Frontend Template

> Plantilla ecommerce Vue 3 + Vite para marca de moda deportiva premium.

---

## Estructura del proyecto

```
siuuluette/
├── index.html                  # Entrada HTML, carga fuentes Google
├── vite.config.js              # Config de Vite
├── package.json
└── src/
    ├── main.js                 # Monta la app Vue
    ├── App.vue                 # Raíz: estado global del carrito, toast, navbar sticky
    ├── assets/
    │   └── isotipo.jpeg        # Logo de marca
    ├── data/
    │   └── products.js         # Datos mock: 8 productos + 6 categorías
    ├── styles/
    │   └── main.css            # Design tokens, reset, tipografía, componentes base
    └── components/
        ├── Navbar.vue          # Header sticky con carrito y menú mobile
        ├── HeroSection.vue     # Hero full-screen con isotipo de fondo
        ├── CategoryGrid.vue    # Grid de 6 categorías con hover animado
        ├── ProductCard.vue     # Tarjeta de producto reutilizable
        ├── FeaturedProducts.vue# Grid de productos con filtros por categoría
        ├── LimitedDrop.vue     # Sección drop exclusivo con stock meter
        ├── BrandValues.vue     # 4 valores de marca con iconos
        ├── NewsletterSection.vue # Captura de email con validación
        ├── CartSidebar.vue     # Carrito lateral con qty controls
        └── FooterSection.vue   # Footer completo con marquee y links
```

---

## Instalación y ejecución

### Requisitos previos
- Node.js >= 18
- npm >= 9

### Pasos

```bash
# 1. Instalar dependencias
cd siuuluette
npm install

# 2. Arrancar el servidor de desarrollo
npm run dev
# → Abre http://localhost:5173

# 3. Build para producción
npm run build

# 4. Preview del build
npm run preview
```

---

## Funcionalidades implementadas

| Feature | Estado |
|---|---|
| Navbar sticky con scroll detection | ✅ |
| Menú mobile hamburger animado | ✅ |
| Carrito con contador global | ✅ |
| Añadir/quitar/actualizar cantidades | ✅ |
| Toast de confirmación | ✅ |
| Hero cinematic con isotipo | ✅ |
| Grid de categorías con hover | ✅ |
| Filtros de productos por categoría | ✅ |
| Drop limitado con stock meter | ✅ |
| Newsletter con validación de email | ✅ |
| Footer con marquee animado | ✅ |
| Diseño responsive móvil/tablet/desktop | ✅ |
| Announcement bar descartable | ✅ |

---

## Paleta de colores

| Variable | Valor | Uso |
|---|---|---|
| `--c-black` | `#080808` | Fondo principal |
| `--c-dark` | `#111111` | Fondo de secciones |
| `--c-gold` | `#c9a96e` | Acento principal |
| `--c-gold-light` | `#e4c99a` | Hover del dorado |
| `--c-white` | `#f5f3ef` | Texto principal |
| `--c-off-white` | `#e8e5e0` | Texto secundario |

---

## Tipografías

- **Display / Titulares**: Bebas Neue (Google Fonts)
- **Cuerpo / UI**: DM Sans (Google Fonts)

---

## Próximos pasos sugeridos

- [ ] Conectar con Shopify Storefront API o backend propio
- [ ] Página de producto individual (`/producto/:id`)
- [ ] Página de categoría con filtros avanzados
- [ ] Página de checkout
- [ ] Sistema de autenticación (cuenta de usuario)
- [ ] Internacionalización (i18n) para múltiples mercados
- [ ] Modo oscuro / claro toggle
- [ ] PWA con service worker
- [ ] Animaciones de scroll con Intersection Observer

---

## Tecnologías utilizadas

- **Vue 3** (Composition API + Options API)
- **Vite 5** (bundler de desarrollo ultrarrápido)
- **CSS puro** con Custom Properties (sin Tailwind ni frameworks CSS)
- **Google Fonts**: Bebas Neue + DM Sans

---

*Siuuluette Brand · Make It Real · 2025*
