# 🎮 RUTA 9 | ARCADE HUB

Esta es la colección oficial de juegos de **Ruta 9**, diseñada para funcionar como un despliegue independiente de alto impacto visual.

## 🚀 Arquitectura
El proyecto utiliza una estructura de **Master Hub** basada en Vite + React:
-   **Root**: Contiene el lanzador central con una estética "Premium Arcade".
-   **Games**: 6 experiencias interactivas independientes alojadas en subcarpetas.

## 🛠️ Cómo Desarrollar
1.  **Instalar dependencias**: `npm install` (en la raíz).
2.  **Lanzar servidor de desarrollo**: `npm run dev` (abre el Arcade en el puerto 3333).
3.  **Compilar todo para producción**: `npm run build`.

## 📦 Despliegue
Este repositorio está optimizado para **Vercel** o **GitHub Pages**:
-   El comando `npm run build` ejecutará automáticamente el script `build-all-games.sh`, compilará cada uno de los 6 juegos, los moverá a `public/games/` y finalmente construirá el Hub principal.

## 🕹️ Juegos Incluidos
1.  **Ruta Millonaria**: Trivia interactiva.
2.  **Calza Burger**: Simulador de armado.
3.  **Detén el 9**: Desafío de reflejos.
4.  **Ruleta Ruta 9**: Selección de azar.
5.  **Ruta del Fuego**: Juego de habilidad.
6.  **Punto Perfecto**: Cooking challenge.

---
*Diseñado por Agencia Patagoniacoach — Nivel Arquitecto.*
