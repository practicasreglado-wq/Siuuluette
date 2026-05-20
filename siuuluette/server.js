// ============================================================
//  server.js — Punto de entrada para el despliegue en Hostinger
// ============================================================
//
// Hostinger está configurado con "Directorio raíz: siuuluette",
// es decir, trabaja DENTRO de esta carpeta. Ejecuta `node server.js`
// desde aquí, así que este archivo es el punto de entrada de la app
// en producción.
//
// El código real del backend Fastify vive en backend/src/server.js
// (relativo a esta carpeta). Este wrapper simplemente lo importa y
// lo lanza. No tiene lógica propia.
//
// Estructura efectiva en producción (lo que Hostinger ve):
//
//   siuuluette/                       ← Directorio raíz en Hostinger
//   ├── server.js                     ← ESTE ARCHIVO (wrapper de entrada)
//   ├── package.json                  ← Wrapper, orquesta build e inicio
//   ├── backend/
//   │   ├── package.json              ← Dependencias reales del backend
//   │   └── src/server.js             ← Servidor Fastify real
//   └── frontend/
//       ├── package.json              ← Dependencias del frontend
//       └── dist/                     ← Build de Vue que Fastify sirve
//
// Al importar el módulo del backend, este se autoejecuta (la última
// línea de backend/src/server.js es `start()`), así que no hace falta
// llamar a nada más desde aquí.
// ============================================================

import './backend/src/server.js'
