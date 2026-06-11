# Longeia — Centro de Bienestar

Rediseño de la landing page de **Longeia**, una marca de bienestar. Sitio estático de una sola página construido con Vite, HTML escrito a mano, TypeScript vanilla y un sistema de CSS por capas — **sin framework**.

> ⚠️ **Este proyecto es un borrador de diseño con fines de presentación.** No es un sitio en producción: el contenido, las imágenes y los datos de contacto son de muestra, y el color de marca definitivo todavía no está aplicado (los tokens de acento usan valores neutros provisorios).

## Stack

| Tecnología | Uso |
|---|---|
| [Vite](https://vitejs.dev/) | Dev server con HMR y build de producción |
| TypeScript | Interacciones (sin framework, DOM directo) |
| CSS por capas | Tokens de diseño + primitivas + un archivo por sección |
| [Lenis](https://github.com/darkroomengineering/lenis) | Smooth scrolling |

Tipografías (Google Fonts): **Fraunces** para títulos, **Roboto** para cuerpo y **Great Vibes** para acentos manuscritos.

## Cómo correrlo

Requiere Node.js y [pnpm](https://pnpm.io/).

```bash
pnpm install
pnpm dev        # servidor de desarrollo con HMR
pnpm build      # type-check con tsc + build de producción → dist/
pnpm preview    # sirve el build de producción
```

No hay test runner ni linter: `pnpm build` es la única validación (corre `tsc` en modo estricto antes de bundlear, así que un error de tipos frena el build).

## Estructura

```
index.html              # Todo el markup — el HTML es la fuente de verdad
src/
├── main.ts             # Punto de entrada: Lenis + inicialización de scripts
├── scripts/            # Una función init*() por comportamiento
│   ├── hero-carousel.ts    # Carrusel del hero (por índice, CSS custom property)
│   ├── carousel.ts         # Carrusel genérico scroll-snap (Productos, Viandas)
│   ├── reveal.ts           # Animaciones de entrada/salida con IntersectionObserver
│   ├── scroll-link.ts      # Movimiento ligado al scroll (About, mosaico Comunidad)
│   ├── header.ts           # Comportamiento del header
│   └── community-modal.ts  # Modal de la sección Comunidad
├── styles/
│   ├── main.css            # Manifiesto de @imports en orden de cascada
│   ├── base/               # variables (tokens), reset, global
│   ├── layout/             # primitivas reutilizables (.container, .btn, .reveal…)
│   └── sections/           # un archivo CSS por sección
└── assets/             # imágenes e íconos
```

### Secciones de la página

Hero · About · Video · Eventos · Marcas · Productos · Viandas · Testimonios · Comunidad · Join · Slider — cada una con su archivo en `src/styles/sections/`.

## Arquitectura

- **Sin framework ni estado compartido.** Cada script de `src/scripts/` exporta una función `init*()` idempotente que busca sus elementos por atributos `data-*` y se retira si no los encuentra. El contrato JS↔HTML son los atributos (`data-carousel*`, `data-scroll-from`, etc.), no clases ni IDs.
- **Dos carruseles distintos.** El del hero funciona por índice (mueve el track con la custom property `--carousel-index`); los de Productos y Viandas usan scroll-snap nativo y `scrollBy`. Son implementaciones independientes.
- **Tokens de diseño.** `src/styles/base/variables.css` separa la paleta cruda de los tokens semánticos (`--color-accent`, `--color-surface`, `--spacing-*`, `--radius-*`, `--motion-*`…). El estilo nuevo usa tokens semánticos; cambiar los tres `--color-accent*` re-tematiza todo el sitio. El Hero es legacy y conserva las variables `--terra*` originales.
- **Accesibilidad de movimiento.** Todo el sistema de animación respeta `prefers-reduced-motion`: Lenis se omite por completo y las animaciones de reveal muestran el contenido de inmediato.

## Idioma

Todo el copy de la interfaz está en **español**; el contenido nuevo debe mantenerse en español.
