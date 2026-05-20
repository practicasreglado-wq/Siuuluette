// ============================================================
//  server.js — Punto de entrada para el despliegue en Hostinger
// ============================================================
//
// Hostinger usa LiteSpeed (lsnode.js) para cargar este archivo, y lo
// hace mediante un require() de CommonJS. Eso significa que aunque
// el package.json tenga "type": "module", lsnode hace
// require('./server.js'), no import.
//
// PROBLEMA CON ESM + top-level await:
// Desde Node 22, require() puede cargar módulos ESM... siempre que
// el grafo de módulos NO contenga top-level await. Si lo contiene,
// lanza ERR_REQUIRE_ASYNC_MODULE y la app no arranca.
//
// El backend Fastify (siuuluette/backend/src/server.js) sí usa
// top-level await (await fastify.register(...)). Si lo importáramos
// aquí con `import` estático, lsnode se ahogaría.
//
// SOLUCIÓN:
// Usar `import()` DINÁMICO (la función, no la declaración).
//   - `import` estático → propaga el top-level await al wrapper → CRASH.
//   - `import()` dinámico → devuelve una Promise, el wrapper se evalúa
//     síncronamente y el backend se carga después de forma asíncrona.
//
// lsnode hace require() del wrapper, ve que no hay top-level await
// directo, lo evalúa síncronamente y queda contento. La Promise del
// import() resuelve a los pocos ms y Fastify arranca normalmente.
//
// Si el backend lanza cualquier error al arrancar, lo capturamos
// con .catch() y matamos el proceso con un código de error para que
// los logs de Hostinger lo recojan.
// ============================================================

import('./siuuluette/backend/src/server.js').catch((err) => {
  console.error('[server.js] Error al iniciar el backend Fastify:', err)
  process.exit(1)
})
