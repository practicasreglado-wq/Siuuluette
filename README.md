# Le Siuuluette — Guía para desarrolladores

Cosas importantes a tener en cuenta si vas a tocar este proyecto.

> **El nombre se escribe "Le Siuuluette" (separado).** En la carpeta y en el código aparece como `siuuluette` todo junto — esa forma es solo interna, en cualquier texto visible al usuario va con espacio.

---

## Estructura del repo

```
siuuluette-brand/
└── siuuluette/
    ├── frontend/   → Vue 3 + Vite 5 (SPA)
    └── backend/    → Fastify 5 + Supabase + Stripe
```

Todo el código vive dentro de `siuuluette/`. La raíz solo contiene este README y documentos sueltos.

---

## Cómo arrancar

**Backend** (puerto 3000):

```bash
cd siuuluette/backend
npm install
npm run dev          # nodemon + pino-pretty
```

**Frontend** (puerto 5173):

```bash
cd siuuluette/frontend
npm install
npm run dev
```

Arranca primero el backend, luego el frontend. Si el backend no está vivo, el frontend muestra un banner de error de productos.

---

## Variables de entorno (lo que más cuesta)

El backend **no arranca sin un `.env`** correctamente configurado. No está versionado por seguridad. Pídeselo al equipo o usa los valores de staging.

Variables clave (sin valores aquí):

- **JWT:** `JWT_SECRET` (mínimo 32 caracteres)
- **Supabase:** `SUPABASE_URL`, `SUPABASE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- **Stripe:** `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- **Email (Resend):** `RESEND_API_KEY`, `RESEND_FROM_EMAIL`
- **Datos fiscales** (para las facturas PDF): `COMPANY_LEGAL_NAME`, `COMPANY_TAX_ID`, `COMPANY_ADDRESS_*`
- **Frontend URL:** `FRONTEND_URL` (para CORS y enlaces en emails)
- **Override de emails en dev:** `EMAIL_DEV_RECIPIENT_OVERRIDE` — redirige TODOS los emails a una dirección concreta para no spamear a usuarios reales mientras pruebas.

Frontend solo necesita: `VITE_API_URL` (por defecto `http://localhost:3000`).

**La `SERVICE_ROLE_KEY` de Supabase NUNCA se expone en frontend.** Solo backend.

---

## Cosas no obvias que debes saber

### Autenticación

- El JWT se guarda en **cookie HttpOnly**, no en `localStorage`. Si abres devtools y no ves token, es normal.
- Hay protección **CSRF** activa: cualquier llamada que modifique datos necesita el header `x-csrf-token`. Se obtiene en `/api/auth/csrf`.
- Hay rol `admin` que da acceso a las rutas `/api/admin/*` y al panel `/admin/*` del frontend.

### Pagos

- Los precios **se recalculan siempre en el backend**. No te fíes de lo que mande el cliente.
- El webhook de Stripe necesita el **body crudo (raw buffer)** para verificar la firma, por eso tiene su propio parser. No lo toques sin entenderlo.
- El carrito se "compacta y firma" antes de pagar — luego es inmutable hasta confirmar el pedido.

### Stock y variantes

La base de datos modela:

- `products` (base)
- `product_variants` (color, puede tener precio propio que sobrescribe al del producto)
- `product_images` (galería por variante)
- `variant_stock` (talla + cantidad), con tres modos:
  - `limited` — verifica cantidad antes de añadir al carrito
  - `on_demand` — siempre disponible
  - `preorder` — reserva para drop futuro

Las tallas se ordenan con un `SIZE_ORDER` definido (XXS a XXXL), no alfabético.

### Carrito y favoritos

- Para usuarios logueados: se guardan en backend.
- Para invitados: se guardan en `localStorage` y se **mergean** automáticamente al hacer login.
- Estado compartido en frontend vía composables (`useCart`, `useFavorites`) — no Vuex/Pinia.

### Emails

- Generados con **Resend**, templates HTML en `siuuluette/backend/src/utils/emailTemplates/`.
- En desarrollo usa siempre `EMAIL_DEV_RECIPIENT_OVERRIDE` o vas a mandar correos a personas reales.

### Facturas

- Se generan en PDF con PDFKit.
- Los datos fiscales del emisor vienen del `.env` (variables `COMPANY_*`).
- Se guarda un snapshot de los datos en la orden para que aunque cambies el `.env` mañana, la factura antigua siga siendo correcta.

---

## API y rutas principales

Toda la API cuelga de `/api/`:

- `/api/auth/*` — registro, login, reset password, CSRF
- `/api/products/*` — catálogo
- `/api/collections/*` — colecciones
- `/api/cart/*` — carrito (logueado)
- `/api/favorites/*` — wishlist
- `/api/checkout/*` — PaymentIntents y webhooks Stripe
- `/api/drops/*` — drops bloqueados y reservas
- `/api/admin/*` — panel interno (requiere rol admin)

Hay **Swagger** auto-generado en `/documentation` cuando el backend está corriendo. Es la documentación más actualizada de la API.

---

## Frontend: dónde está cada cosa

```
siuuluette/frontend/src/
├── components/     → componentes reutilizables (HeroSection, Navbar, CartSidebar...)
├── views/          → páginas (HomeView, ProductDetailView, AdminProducts...)
├── composables/    → estado compartido (useCart, useFavorites)
├── api/            → llamadas a la API del backend
├── router/         → rutas, lazy-loading, títulos meta
└── App.vue         → overlays globales (auth, checkout, success, cart)
```

Sin Vuex/Pinia, sin Tailwind. CSS puro y composables para el estado.

---

## Seguridad activa (no la rompas sin querer)

- **CSRF** en todas las mutaciones
- **Helmet** con CSP (no `unsafe-inline` en scripts — el iframe de Stripe está permitido explícitamente)
- **Rate limiting**: 1000 req/min global, algunas rutas con límites más bajos
- **CORS** whitelist: `localhost:5173/5174` + `FRONTEND_URL`. Los webhooks de Stripe son excepción
- **RLS de Supabase** debe estar activo en todas las tablas — si añades una nueva, configúrale políticas
- **Service Role Key** solo backend, jamás frontend

---

## Qué NO subir al repo

- `.env` (credenciales reales)
- `node_modules/` (re-generables con `npm install`)
- `dist/` (build de producción)
- Cualquier archivo con claves o tokens

---

## Documentación adicional

- `siuuluette/frontend/README.md` — estructura del frontend, paleta de color y tipografías
- Swagger en `http://localhost:3000/documentation` (con backend levantado)
- Comentarios en `siuuluette/backend/src/routes/*.js` cuando algo no es obvio

---

## Consejos finales

1. Antes de tocar el flujo de checkout, lee primero cómo funciona el webhook de Stripe.
2. Antes de añadir una tabla nueva en Supabase, configura las políticas RLS.
3. Si vas a probar emails, **activa el override de dev primero**.
4. Si rompes algo del CSP o del CSRF, ningún botón funcionará en producción aunque en dev sí — testea con `npm run build && npm run preview`.
5. El nombre de la marca se escribe **Le Siuuluette** (separado). Cualquier texto nuevo dirigido al usuario debe respetarlo.

---

## Custodia de secretos y traspaso

> Esta sección es crítica. Si la persona que generó los secretos deja el proyecto, esta es la única forma de que el negocio no quede bloqueado.

### Dónde viven los secretos

- **En el servidor de producción**: dentro del `.env` del backend. El servidor los lee al arrancar.
- **Copia de respaldo (obligatoria)**: en un gestor de contraseñas compartido del equipo (recomendado: **Bitwarden** — es gratuito y permite vault de equipo, o **1Password** si se prefiere de pago).

El `.env` no se versiona, no se manda por email, no se pega en chats. Solo vive en el servidor y en el gestor de contraseñas.

### Qué secretos hay que custodiar

Cada uno de estos debe tener una entrada en el gestor con etiqueta clara `Le Siuuluette · Producción · [nombre]`:

| Secreto | Qué pasa si se pierde | Cómo se regenera |
|---|---|---|
| `JWT_SECRET` | Todos los usuarios pierden la sesión al regenerarse | Cualquier comando seguro de generación aleatoria de 48 bytes (`openssl rand -base64 48`) |
| `SUPABASE_SERVICE_ROLE_KEY` | Backend deja de funcionar con la BD | Regenerar desde el dashboard de Supabase (Settings → API) |
| `SUPABASE_KEY` (anon key) | Igual que arriba pero menos crítico | Regenerar desde Supabase |
| `STRIPE_SECRET_KEY` | No se pueden cobrar pagos | Rotar desde Dashboard Stripe → Developers → API keys |
| `STRIPE_WEBHOOK_SECRET` | El webhook de Stripe deja de validarse | Regenerar en Dashboard Stripe → Webhooks → endpoint → Reveal/rotate |
| `RESEND_API_KEY` | No se envían emails | Generar nueva en dashboard de Resend |
| Credenciales de Hostinger (panel + FTP/SSH) | No se puede desplegar ni acceder al servidor | Recuperar contraseña desde Hostinger |
| Credenciales de Supabase (cuenta) | No se puede gestionar la BD | Recuperar contraseña desde Supabase |
| Credenciales de Stripe (cuenta) | No se puede gestionar pagos ni payouts | Recuperar desde Stripe |
| Credenciales de Resend (cuenta) | No se puede gestionar el envío de emails | Recuperar desde Resend |
| Credenciales del dominio (registrador) | No se puede renovar ni cambiar DNS | Recuperar desde el registrador (Hostinger en nuestro caso) |
| Credenciales del email `lesiuuluette@gmail.com` | No se reciben notificaciones de Stripe, Supabase, Resend, etc. | Recuperación de Google |

### Quién debe tener acceso al gestor de contraseñas

Mínimo dos personas:

- El desarrollador principal (uso diario).
- Una persona de respaldo del negocio (custodia de emergencia), idealmente el director del proyecto o el administrador legal de la SL.

La persona de respaldo no necesita usar los secretos día a día — solo debe poder acceder si el desarrollador no está disponible.

### Cuando alguien deja el proyecto

Checklist obligatorio al irse cualquier persona con acceso a secretos:

1. **Rotar TODOS los secretos** listados arriba (no se pueden dejar los antiguos vivos).
2. Actualizar el `.env` del servidor con los nuevos valores.
3. Actualizar el gestor de contraseñas con los nuevos valores.
4. **Revocar el acceso del exempleado** al gestor de contraseñas, al dashboard de Supabase, Stripe, Resend, Hostinger, GitHub/GitLab, y al email `lesiuuluette@gmail.com`.
5. Revisar logs de actividad reciente para detectar accesos anómalos.
6. Si tenía acceso de admin en el panel `/admin/*`, revocar también su rol en la tabla `profiles` de Supabase.

---

## Estado del proyecto y pendientes para producción

Esto es lo que falta antes de poder anunciar el lanzamiento. Los puntos se pueden ir cerrando en paralelo.

### Stripe

- [ ] **Activar la cuenta** (actualmente en modo prueba). Requiere completar datos de la SL, identidad del representante legal y beneficiarios efectivos. Verificación tarda 1-7 días laborables.
- [ ] **Añadir el IBAN** de la cuenta de la SL para los payouts. Debe estar a nombre del titular legal (LE SIUULUETTE TRADEMARK, S.L.).
- [ ] **Sustituir las claves de test por las de live** en el `.env` de producción:
  - `STRIPE_SECRET_KEY` → `sk_live_...`
  - `VITE_STRIPE_PUBLISHABLE_KEY` (frontend) → `pk_live_...`
- [ ] **Crear el webhook de Stripe en live mode**:
  1. Dashboard Stripe → Developers → Webhooks → Add endpoint.
  2. URL: `https://<dominio_definitivo>/api/checkout/webhook`.
  3. Eventos a escuchar: `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded` (revisar los que usa el código en `routes/checkout.js`).
  4. Copiar el `whsec_...` generado a `STRIPE_WEBHOOK_SECRET` en el `.env`.
- [ ] Hacer una **compra real de 1 €** con tarjeta propia para validar el flujo completo end-to-end.

### Resend (emails)

- [ ] **Verificar el dominio** desde el dashboard de Resend. Hay que añadir registros DNS en Hostinger:
  - `SPF` (TXT) — autoriza a Resend a enviar en nombre del dominio.
  - `DKIM` (CNAME o TXT) — firma criptográfica de los emails.
  - `DMARC` (TXT) — política de qué hacer con emails no verificados.

  Sin esto, los emails caen en spam o son rechazados por Gmail/Outlook.
- [ ] **Cambiar `RESEND_FROM_EMAIL`** del valor de pruebas a uno del dominio real (`pedidos@<dominio>` o similar).
- [ ] **Vaciar `EMAIL_DEV_RECIPIENT_OVERRIDE`** en el `.env` de producción (si no, todos los emails se redirigen a una sola dirección y los clientes no reciben nada).
- [ ] Generar `RESEND_API_KEY` específica de producción (no reusar la de dev).
- [ ] Probar el envío real: hacer un pedido y verificar que el email de confirmación llega bien.

### Dominio (Hostinger)

- [ ] **Comprar / confirmar el dominio definitivo** en Hostinger.
- [ ] Configurar los **DNS A / CNAME** apuntando al servidor donde se aloja el backend y al hosting del frontend.
- [ ] Activar **SSL/HTTPS** (Hostinger suele tener Let's Encrypt gratis).
- [ ] Validar que `https://dominio.com` carga el frontend y `https://dominio.com/api/...` responde el backend.

### Configuración de producción (backend)

- [ ] **Generar un `JWT_SECRET` nuevo y fuerte** (mínimo 32 caracteres, aleatorio). NO usar el de dev.
- [ ] **Crear `.env.production`** con todos los valores reales (Stripe live, Resend prod, dominio real, Supabase prod, etc.).
- [ ] **Cambiar `NODE_ENV=production`** — esto activa la lógica más estricta de CORS en `server.js`.
- [ ] **Quitar `localhost:5173/5174` de la whitelist CORS** en `server.js:51-57` (o envolverlo en check `NODE_ENV`).
- [ ] **Bajar `rateLimit.max`** en `server.js:115` de 1000/min a algo más razonable (100-200/min). El comentario en el código indica que se subió temporalmente para problemas de preflight en admin — revisar si todavía aplica.
- [ ] **Ajustar el logger de Fastify** a JSON plano en producción (sin `pino-pretty`, que es solo para desarrollo).
- [ ] Revisar que **no quedan `console.log` de debug** ni datos sensibles en logs.

### Supabase

- [ ] **Verificar RLS activado en todas las tablas** (especialmente `profiles`, `orders`, `invoices`, `cart`, `favorites`).
- [ ] Revisar las **políticas RLS** una a una — el `SERVICE_ROLE_KEY` se las salta, pero cualquier query con la anon key debe estar protegida.
- [ ] Configurar **backups automáticos** desde el dashboard de Supabase (depende del plan).
- [ ] Crear un usuario admin real en la tabla `profiles` (cambiar el rol desde SQL).

### Limpieza pendiente del repo

- [ ] **Eliminar** `siuuluette/frontend/src/views/MotionTestView.vue` (ya quitado del router, pero el archivo sigue en disco).
- [ ] **Eliminar** `siuuluette/backend/src/routes/example.js` (ruta zombie, no registrada en `server.js`).
- [ ] **Eliminar** `siuuluette/backend/src/plugins/example.js` (plugin zombie, no usado).
- [ ] Ejecutar `npm install` en `siuuluette/frontend/` para refrescar el `package-lock.json` tras quitar `motion-v`.
- [ ] Revisar si `@fastify/static` y `fastify-plugin` se pueden quitar del `backend/package.json` (actualmente no se usan tras la limpieza).

### Día del lanzamiento

- [ ] Probar el flujo completo en producción con tarjeta real de 1 €:
  1. El pago entra.
  2. El webhook dispara correctamente.
  3. La orden se crea en Supabase.
  4. La factura PDF se genera con los datos fiscales correctos.
  5. El email de confirmación llega al cliente.
- [ ] Probar también la reserva de un drop (preorder) end-to-end.
- [ ] Tener un canal de comunicación abierto (Stripe dashboard, logs del servidor, email) las primeras 24h para detectar problemas.
