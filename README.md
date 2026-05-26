# Le Siuuluette — Guía para desarrolladores

Cosas importantes a tener en cuenta si vas a tocar este proyecto.

> **El nombre se escribe "Le Siuuluette" (separado).** En la carpeta y en el código aparece como `siuuluette` todo junto — esa forma es solo interna, en cualquier texto visible al usuario va con espacio.

---

## Estado actual (mayo 2026)

Foto de dónde está el proyecto ahora mismo, para no perder tiempo averiguándolo:

- **Web desplegada** en `https://lesiuuluette.com` (Hostinger, hosting Node.js). Frontend y backend funcionando.
- **Dominio:** `lesiuuluette.com` está registrado y gestionado en Hostinger, dentro de la cuenta de Le Siuuluette. SSL/HTTPS activo.
- **Despliegue:** Hostinger está conectado a GitHub y despliega automáticamente la rama **`diego`**. Hacer `push` a `diego` publica en producción (ver sección "Despliegue en Hostinger").
- **Resend (envío de emails):** la cuenta de Resend se accede con la cuenta de Google `webregladoac1@gmail.com`. Desde esa cuenta se dio de alta el dominio `lesiuuluette.com` en Resend, sus registros DNS (DKIM, SPF/MX, DMARC) están añadidos en el panel DNS de Hostinger y el dominio está verificado. El envío de emails transaccionales está operativo.
- **Buzón de correo:** `pedidos@lesiuuluette.com` creado en Hostinger (plan de email gratuito incluido con el hosting, prueba de 12 meses; pasado ese plazo se renueva como plan de pago). Sirve para *recibir*; el *envío* automático lo hace Resend.
- **Stripe:** la cuenta está en **modo TEST** — no se mueve dinero real. Pendiente de activar la cuenta definitiva de Stripe a nombre de la sociedad (LE SIUULUETTE TRADEMARK, S.L.).
- **Base de datos (Supabase):** el proyecto de Supabase que aloja la base de datos se creó accediendo con una **cuenta personal de Diego**. Esto es un riesgo de continuidad — ver "Pendientes críticos": hay que dar acceso a la empresa para que la base de datos no dependa de una persona.
- **Cuentas de servicio:** hay dos correos distintos en juego. A **Resend** se accede con la cuenta de Google `webregladoac1@gmail.com`, y ese correo se usa únicamente para iniciar sesión en Resend. A **Hostinger** y a **Stripe** se accede con el correo `lesiuuluette@gmail.com`. Ojo a esta separación para no buscar cada servicio en la cuenta equivocada.

---

## ⚠️ PENDIENTES — LEER PRIMERO

> La app está desplegada en `https://lesiuuluette.com` (Hostinger) pero **aún NO está lista para aceptar pagos reales**. Lo que queda por hacer, ordenado por urgencia.

### Bloqueantes (impiden vender de forma segura)

- [ ] **Webhook de Stripe no configurado.** Si un cliente paga y cierra el navegador antes de terminar, Stripe cobra pero la orden NO se crea en Supabase. Hay que crear el endpoint en el dashboard de Stripe (`https://lesiuuluette.com/api/checkout/webhook`), escuchar `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`, y poner el `whsec_...` resultante en la variable `STRIPE_WEBHOOK_SECRET` de Hostinger.
- [ ] **Rotar claves filtradas.** Durante el desarrollo se compartieron por chat valores reales de `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_KEY`, `STRIPE_SECRET_KEY` (test) y `RESEND_API_KEY`. Rotarlas todas desde sus dashboards.
- [ ] **Stripe sigue en modo TEST.** No se mueve dinero real. Al activar la cuenta, cambiar `STRIPE_SECRET_KEY` y `VITE_STRIPE_PUBLISHABLE_KEY` a las claves `live`.

### Importantes (resolver pronto)

- [ ] **El PaymentIntent no se ata al usuario.** `/checkout/attach` y `/confirm` no comprueban que el `paymentIntentId` pertenezca al usuario de la sesión. El id de Stripe no es adivinable, pero la propiedad debería estar fijada. Solución: fijar `user_id` en la metadata del PaymentIntent desde `/intent` (que pasará a exigir login) y validar coincidencia en `/attach` y `/confirm`.
- [ ] **El webhook de Stripe no descarta reentregas.** Stripe puede entregar el mismo evento dos veces; hoy la idempotencia depende del estado del pedido. Crear una tabla `stripe_events(event_id pk, processed_at)` y comprobar antes de procesar.
- [ ] **`/checkout/intent` está abierto sin login y no valida la variante.** Tres cosas que cerrar de golpe: exigir `authenticate` (el checkout ya requiere login para `attach`/`confirm`), poner un tope sensato a la cantidad por línea, y rechazar variantes con `is_active=false`.
- [ ] **Preorders sin validación de duplicados.** Un usuario puede reservar el mismo drop N veces. Añadir `UNIQUE(user_id, product_name)` en la tabla `preorders`.
- [ ] **Sin plan para el día del drop (julio 2026):** no hay automatización para notificar a quienes reservaron. Habrá que exportar el CSV del panel admin y avisar a mano, o implementar un cron.
- [ ] **La base de datos de Supabase está en una cuenta personal.** El proyecto de Supabase se creó con una cuenta personal de Diego. Si Diego deja el proyecto, la empresa puede quedarse sin acceso. Acción: como mínimo, invitar a una persona de la empresa a la organización de Supabase con rol de Owner/Admin; e idealmente, **transferir el proyecto a una organización de Supabase propiedad de la empresa**.

### Hardening de base de datos (avisos del linter de Supabase)

- [ ] **Activar "Leaked Password Protection"** en Supabase → Authentication → Providers → Email. Comprueba contraseñas contra HaveIBeenPwned. **Requiere plan Pro de Supabase** (ver nota más abajo); en plan Free, como mitigación, dejar `Minimum password length = 12` y `Password requirements = Lowercase, uppercase letters, digits and symbols`.
- [ ] **Configurar SMTP propio (Resend) en Supabase** → Authentication → SMTP Settings. **Urgente**: "Confirm email" ya está activado, así que los correos de confirmación se envían con el SMTP por defecto de Supabase, que en plan Free tiene un límite muy bajo (≈3-4 emails/hora). En cuanto haya un poco de tráfico, los registros nuevos no recibirán el correo de confirmación y no podrán entrar. Hay que meter las credenciales SMTP de Resend para que esos correos se envíen por ahí.
- [ ] **Verificar la whitelist de Redirect URLs** en Supabase → Authentication → URL Configuration: solo debe estar `https://lesiuuluette.com/*`. El endpoint `/api/auth/recover` usa la cabecera `Origin` del cliente para construir el enlace del email; sin la whitelist bien puesta, un atacante podría provocar phishing por correo de recuperación.
- [ ] **Configurar backups automáticos** en Supabase desde el dashboard. **Requiere plan Pro** para backups diarios y point-in-time recovery; en plan Free no hay backups automáticos.
- [ ] **Crear índices**: `cart_items(user_id, product_id, size)`, `orders(user_id, created_at DESC)`, `favorites(user_id)`, `order_items(order_id)`, `invoices(order_id)`, `preorders(user_id, product_name)`. Mejoran el rendimiento de RLS y de consultas con FK.

### Mejoras a medio plazo (no bloquean)

- [ ] **Plan Pro de Supabase (opcional, a valorar):** el proyecto está hoy en el plan Free. Subir al plan **Pro** (~25 €/mes) desbloquea de un golpe tres cosas que aparecen como pendientes en este README: backups diarios automáticos + point-in-time recovery, protección contra contraseñas filtradas (Leaked Password Protection), y límites de email/auth más altos. Cuando se active Stripe en vivo y empiece a haber clientes reales, es razonable subir a Pro por la tranquilidad de los backups solos.
- [ ] **Paginar `/api/products`:** ahora hace N+1 (carga todos los productos, luego variantes, luego imágenes). Escala mal a partir de ~1000 productos.
- [ ] **GDPR mínimo:** no hay "derecho al olvido". Añadir borrado de cuenta con cascade de datos personales.
- [ ] **Pulir `cart.js`:** `/add` puede guardar `size = null` mientras `/merge` y `/update` asumen `'M'` por defecto, lo que deja líneas que no casan al borrar/actualizar.

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

Requisitos: **Node 22** (el wrapper de despliegue depende de comportamiento de Node 22+; ver "Despliegue en Hostinger") y `npm`.

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

En **producción no hay archivo `.env`**: las variables se configuran en el panel de Hostinger (ver sección siguiente).

---

## Despliegue en Hostinger

La web está alojada en **Hostinger** con hosting de **Node.js** (servidor LiteSpeed). Entender cómo funciona el despliegue es imprescindible antes de publicar nada.

### Cómo se publica un cambio

Hostinger está conectado al repositorio de GitHub y **despliega automáticamente la rama `diego`**. Es decir: **hacer `git push` a la rama `diego` publica directamente en producción**. No es un "guardar" más — conviene revisar y probar en local antes de subir.

Tras recibir el push, Hostinger:

1. Ejecuta `npm install` en la raíz del repositorio.
2. El hook `postinstall` del `package.json` raíz dispara `npm run build`.
3. `build` entra en `siuuluette/backend` y ejecuta `build:all`: instala el frontend (con `--include=dev`, necesario para que Vite esté disponible aunque el deploy corra con `NODE_ENV=production`), lo construye con Vite (genera `siuuluette/frontend/dist/`) y después instala el backend.
4. Arranca la app con `npm start` → `node server.js`.

### Por qué hay un wrapper en la raíz

El código real vive en `siuuluette/backend` y `siuuluette/frontend`, pero Hostinger espera el punto de entrada en la raíz del repo. Por eso la raíz contiene un `server.js` y un `package.json` "wrapper" que **solo orquestan arranque y build**; no tienen lógica de negocio.

El `server.js` raíz usa **`import()` dinámico** (la función, no el `import` estático) a propósito. LiteSpeed carga el archivo con `require()` de CommonJS, y el backend Fastify usa top-level await; un `import` estático propagaría ese await al wrapper y el arranque fallaría con `ERR_REQUIRE_ASYNC_MODULE`. **No lo cambies a `import` estático.**

### Variables de entorno en producción

En producción no se sube ningún `.env`. Las variables se definen en el panel de Hostinger, en la sección "Variables de entorno". Ahí van tanto las del backend como las `VITE_*` del frontend. Ojo: las `VITE_*` se incrustan en el bundle al construir, así que cambiar una exige volver a desplegar para que tenga efecto.

Detalle no obvio: Hostinger no permite guardar variables con valor vacío. Por eso `VITE_API_URL` se configura con la URL absoluta (`https://lesiuuluette.com`) en lugar de vacía; el código de `siuuluette/frontend/src/api/index.js` ya limpia una posible barra final por robustez.

### Node

El despliegue asume **Node 22**. El comportamiento de `require()` sobre módulos ESM del que depende el wrapper raíz es propio de Node 22 en adelante; con versiones anteriores el arranque puede romperse.

---

## Cosas no obvias que debes saber

### Autenticación

- El JWT se guarda en **cookie HttpOnly**, no en `localStorage`. Si abres devtools y no ves token, es normal.
- Hay protección **CSRF** activa: cualquier llamada que modifique datos necesita el header `x-csrf-token`. Se obtiene en `/api/auth/csrf`.
- Hay rol `admin` que da acceso a las rutas `/api/admin/*` y al panel `/admin/*` del frontend. **El rol admin se concede EXCLUSIVAMENTE desde el editor SQL de Supabase** (`update profiles set role='admin' where id = (select id from auth.users where email = 'CORREO')`). No hay forma de auto-asignárselo desde la web: un trigger en la BD lo impide y el backend verifica el rol contra la tabla `profiles` en cada petición de admin (no se fía del JWT).

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
- **Rate limiting**: 200 req/min global, `/checkout/intent` 20/min, login y registro 5/min
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
| Credenciales del email `lesiuuluette@gmail.com` | Es el correo con el que se accede a Hostinger y a Stripe: sin él se pierde el acceso de recuperación a ambos | Recuperación de Google |
| Credenciales del email `webregladoac1@gmail.com` | Es la cuenta de Google con la que se accede a Resend: sin ella se pierde el control de la cuenta de Resend y del envío de emails | Recuperación de Google |

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
4. **Revocar el acceso del exempleado** al gestor de contraseñas, al dashboard de Supabase, Stripe, Resend, Hostinger, GitHub/GitLab, y a los correos `lesiuuluette@gmail.com` y `webregladoac1@gmail.com`.
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

### Configuración de producción (backend)

- [ ] **Generar un `JWT_SECRET` nuevo y fuerte** (mínimo 32 caracteres, aleatorio). NO usar el de dev.
- [ ] Confirmar todas las variables reales en el panel de Hostinger (Stripe live cuando llegue, Resend prod, dominio real, Supabase prod, `COMPANY_*`).
- [ ] **Comprobar que `NODE_ENV=production`** está fijada en Hostinger. Eso activa automáticamente CORS estricto (sin localhost), logger JSON y otros valores de producción que el código ya tiene preparados.
- [ ] Pasar una revisión final para confirmar que **no quedan `console.log` de debug** ni datos sensibles en logs.

### Supabase

- [ ] Confirmar admin en la tabla `profiles`: `select email, role from profiles join auth.users using (id) order by role desc`. Solo deberías ver `admin` en tu(s) cuenta(s) de desarrollador. Para conceder admin, ver "Cómo se concede admin" en la sección de Autenticación.
- [ ] Configurar **backups automáticos** desde el dashboard de Supabase (depende del plan).
- [ ] Resolver los avisos del linter de seguridad (ver "Hardening de base de datos" arriba).

### Día del lanzamiento

- [ ] Probar el flujo completo en producción con tarjeta real de 1 €:
  1. El pago entra.
  2. El webhook dispara correctamente.
  3. La orden se crea en Supabase.
  4. La factura PDF se genera con los datos fiscales correctos.
  5. El email de confirmación llega al cliente.
- [ ] Probar también la reserva de un drop (preorder) end-to-end.
- [ ] Tener un canal de comunicación abierto (Stripe dashboard, logs del servidor, email) las primeras 24h para detectar problemas.

---

## Autoría y contexto histórico

La primera versión de la web —desde cero hasta el despliegue inicial en producción en `lesiuuluette.com`— la desarrollaron **Diego y Miguel**. Si necesitas contexto sobre decisiones de diseño, de producto o de negocio tomadas en esa etapa inicial, Diego y Miguel son las personas de referencia.
