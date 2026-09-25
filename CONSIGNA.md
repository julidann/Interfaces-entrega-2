# Checklist — Entregable Nº2 Interfaces

| Requisito del TP | Estado | Qué tenemos / qué falta |
|---|---|---|
| Landing / planes | ✅ Hecho | `index.html`, planes y navegación |
| Registro | ✅ Base hecha | `register.html` + estilos |
| Login | ✅ Base hecho | `login.html` + estilos |
| Home | ✅ Bastante avanzado | Hero, aventuras, tendencias, juegos, navbar y footer |
| Página del juego | 🟡 En proceso | `game.html` existe; hay que revisar que cumpla todo el diseño/funcionalidad |
| Spider-Peg / Peg Solitaire | 🔴 Falta | Implementar el juego funcional |
| Datos reales de juegos | ✅ | Nombres e imágenes diferentes |
| Diferentes longitudes de títulos | ✅ | Ya ocurre naturalmente |
| Catálogo de juegos | ✅ | Generado desde `all-games.js` |
| Tendencias dinámicas | ✅ | Generadas desde `trending.js` |
| Carrusel animado | 🟡 Probando | Versión experimental en `juli`; falta dejar versión definitiva |
| Transición animada del carrusel | 🟡 | Tiene `transition`; falta terminar de ajustar el comportamiento |
| Flechas del carrusel | ✅ en juli | Anterior / siguiente |
| Movimiento automático | ✅ en juli | Se mueve y vuelve |
| Más imágenes en carrusel | ✅ en juli | Actualmente 13 juegos |
| 3 animaciones diferentes en botones al hover | 🔴 Falta revisar/hacer | Tienen que ser 3 efectos distintos |
| Hamburger cuenta como animación de botón | ❌ No | La consigna dice que no cuenta |
| Menú hamburguesa | ✅ | Funciona con JS |
| Menú de usuario/perfil | ✅ | Funciona con JS |
| Búsqueda | 🟡 Visual | Está el input; falta decidir si debe filtrar juegos realmente |
| Loading obligatorio del Home | 🔴 Falta | Debe aparecer siempre durante 5 segundos |
| Porcentaje de carga | 🔴 Falta | Ej. 0% → 100% durante esos 5 segundos |
| Animación del loading | 🔴 Falta | Spinner/cuadrado/círculo hecho con CSS, no GIF |
| Ocultar Home durante loading | 🔴 Falta | Primero loading y después mostrar Home |
| Animación registro exitoso | 🔴 Falta | Agregar animación al registrarse correctamente |
| Comportamiento Login/Register | 🟡 | Navegación básica; falta completar animaciones/feedback |
| Mobile First del Home | 🔴 Falta importante | Home debe tener versión mobile + desktop |
| Responsive navbar Home | 🔴 Falta revisar | Adaptarla a celular |
| Responsive hero Home | 🔴 Falta | Ajustar textos, botones e imagen |
| Responsive aventuras | 🔴 Falta | Cards para mobile |
| Responsive Tendencias | 🔴 Falta | Carrusel debe funcionar bien en celular |
| Responsive Todos los juegos | 🔴 Falta | Grid/cards para mobile |
| Responsive footer | 🔴 Falta | Adaptarlo |
| Login mobile | ➖ No obligatorio | La consigna solo exige mobile para Home |
| Register mobile | ➖ No obligatorio | Igual |
| Game mobile | ➖ No obligatorio | Igual |
| HTML5 | ✅ | Sí |
| CSS3 | ✅ | Sí |
| JavaScript | ✅ | Sí |
| Sin frameworks | ✅ | HTML/CSS/JS puro |
| `transition` CSS | ✅ | Ya usamos |
| `transform` CSS | ✅ | Ya usamos |
| `@keyframes` | 🔴 Falta aprovechar | Permitido; ideal para loading/registro |
| Spritesheet | ✅ No usamos | La consigna dice que no |
| Footer | ✅ | Implementado |
| Navegación entre páginas | 🟡 | Revisar todos los links/rutas al final |
| Assets organizados | ✅ | `assets/img`, `icons`, `logo` |
| CSS organizado | ✅ | Separado por home/auth/landing/etc. |
| JS separado | ✅ | Varios archivos según funcionalidad |
| GitHub | ✅ | Repo funcionando con ramas |
| Rama de trabajo `juli` | ✅ | Rama de prueba para cambios |
| `main` estable | ✅ | Rama principal |
| GitHub Pages | 🟡 | Revisar publicación final |
| Rama `gh-pages` final | 🔴 Falta | Actualizarla cuando terminemos |
| Prueba final completa | 🔴 Falta | Desktop + mobile + rutas + consola + animaciones |
| Entrega | 🔴 Falta | Deadline: 30/09/2026 23:59:59 |

## Orden recomendado

1. Terminar Tendencias en `juli` y pasar la versión definitiva a `main`.
2. Hacer el loading obligatorio del Home: 5 segundos, porcentaje 0–100% y animación CSS.
3. Completar tres efectos hover diferentes en botones.
4. Agregar animación/feedback de registro exitoso.
5. Hacer la versión mobile del Home: navbar, hero, aventuras, tendencias, juegos y footer.
6. Terminar/revisar Spider-Peg para que sea jugable.
7. Revisar rutas, imágenes, consola y funcionamiento completo.
8. Dejar `gh-pages` con la versión final para la entrega.
