// ============================================================
//  server.js — Punto de entrada para el despliegue en Hostinger
// ============================================================
//
// Hostinger ejecuta `node server.js` desde la raíz del repositorio.
// Como el código real del backend Fastify vive en una subcarpeta
// (siuuluette/backend/src/), este archivo simplemente lo importa
// y lo lanza. No tiene lógica propia.
//
// Estructura del repositorio:
//
//   siuuluette-brand/
//   ├── server.js                       ← ESTE ARCHIVO (wrapper de entrada)
//   ├── package.json                    ← Wrapper, solo orquesta el deploy
//   ├── siuuluette/
//   │   ├── backend/
//   │   │   ├── package.json            ← Dependencias reales del backend
//   │   │   └── src/server.js           ← Servidor Fastify real
//   │   └── frontend/
//   │       ├── package.json            ← Dependencias del frontend
//   │       └── dist/                   ← Build de Vue que Fastify sirve
//   └── ...
//
// ¿Por qué este archivo y no apuntar Hostinger directamente al server.js
// del backend? Porque Hostinger asume estructura "plana" (entry file en
// la raíz). En lugar de pelearnos con sus rutas, hacemos este wrapper
// y todos contentos.
//
// Al importar el módulo del backend, este se autoejecuta (su última
// línea es `start()`), así que no hace falta llamar a nada más.
// ============================================================

import './siuuluette/backend/src/server.js'
