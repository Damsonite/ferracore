# Ferracore

Ferracore es una plantilla para un e-commerce basado en una ferretería. Es un proyecto académico que está pensado para practicar la construcción de un catálogo de productos, navegación por categorías y un panel de administración sencillo con Astro.

## Requisitos

- Node.js 22.12 o superior
- pnpm

## Ejecución

Instala las dependencias desde la raíz del proyecto:

```sh
pnpm install
```

Inicia el entorno de desarrollo:

```sh
pnpm dev
```

Astro levantará la aplicación en `http://localhost:4321`.

## Comandos útiles

```sh
pnpm build
```

Genera la versión de producción en `./dist/`.

```sh
pnpm preview
```

Previsualiza la versión generada antes de desplegar.

```sh
pnpm astro -- --help
```

Muestra la ayuda de la CLI de Astro.

## Estructura general

- `src/pages/`: rutas y páginas del sitio.
- `src/components/`: componentes reutilizables.
- `src/layouts/`: plantillas de página.
- `public/`: recursos estáticos.

## Nota del proyecto

Este repositorio se usa como base para un proyecto académico, por lo que el enfoque está en la presentación del catálogo, la experiencia de navegación y la simulación de funcionalidades propias de una tienda de ferretería.
