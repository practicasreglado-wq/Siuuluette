# Le Siuuluette — Guía para desarrolladores

Información imprescindible para el desarrollo y despliegue del proyecto **Le Siuuluette**.

> **Nota de marca:** El nombre se escribe **"Le Siuuluette"** (separado). En código y carpetas aparece como `siuuluette` de forma interna; en cualquier texto de cara al usuario final debe ir separado.

---

## 🚀 Estado del proyecto (Mayo 2026)

*   **Producción**: Desplegado en `https://lesiuuluette.com` (Hostinger Node.js).
*   **Despliegue automático**: Hostinger está conectado a GitHub y despliega automáticamente la rama **`diego`** al recibir un `push`.
*   **Emails transaccionales**: Verificados y operativos en producción mediante **Resend** (cuenta `webregladoac1@gmail.com`). Remitente: `pedidos@lesiuuluette.com`.
*   **Stripe**: La cuenta de la SL (*LE SIUULUETTE TRADEMARK, S.L.*) está **activada** e implementada en producción con claves `live` en Hostinger. Los pagos reales han sido verificados y funcionan correctamente, mientras que el entorno local (`localhost`) sigue usando las claves `test` para pruebas seguras.
*   **Base de datos**: Alojada en **Supabase**. La organización del proyecto tiene como Owner principal a `lesiuuluette@gmail.com` (cuenta corporativa), lo que garantiza que toda la base de datos e infraestructura pertenecen de forma íntegra a la empresa. Las cuentas personales adicionales de Owners en la organización de Supabase (la de Diego y la de un compañero anterior) se pueden retirar con total seguridad cuando ya no se necesite su acceso; la base de datos no sufrirá ningún impacto y el control completo quedará en la cuenta corporativa. Para el rol de administrador del panel `/admin` de la web, ver sección "Gestión Segura de Administradores" más abajo.

---

## 🔑 Control y Accesos del Proyecto

Para la administración integral de la infraestructura del proyecto, la empresa debe utilizar las siguientes cuentas oficiales. **Esta lista describe de quién es la propiedad de cada plataforma para garantizar la continuidad del proyecto**:

*   **Servidor y Alojamiento (Hostinger)**: Acceso gestionado mediante la cuenta corporativa `lesiuuluette@gmail.com`. Aquí se configuran las variables de entorno de producción (`STRIPE_SECRET_KEY`, `SUPABASE_URL`, etc.) y se controla el estado del servidor Node.js.
*   **Base de Datos y Almacenamiento (Supabase)**: Acceso mediante el Gmail corporativo `lesiuuluette@gmail.com`.
*   **Pasarela de Pagos (Stripe)**: Acceso mediante el Gmail corporativo `lesiuuluette@gmail.com`.
*   **Emails Transaccionales (Resend)**: Acceso mediante la cuenta `webregladoac1@gmail.com`.
*   **Código Fuente (GitHub)**: El repositorio y el histórico de cambios se encuentran en la cuenta/organización de `practicasreglado` (`practicasreglado-wq/Siuuluette`).
    *   **Rama de Producción (`diego`)**: La rama **`diego`** de GitHub está conectada con el despliegue automático de Hostinger. Cada `git push` en esta rama compilará y actualizará el dominio en producción (`https://lesiuuluette.com`) de manera automática.
    *   **Entorno Local (`localhost`)**: Para hacer pruebas locales completamente aisladas y seguras sin pagos reales (utilizando las tarjetas y claves `test`), se utiliza el entorno local en `localhost` (puertos `3000` y `5173`).

---

## 🛡️ Gestión Segura de Administradores (Desarrolladores)

### Quién tiene rol `admin` ahora mismo en producción

- `practicasreglado@gmail.com` — equipo de desarrollo actual.
- `disago2002@gmail.com` (Diego, desarrollador inicial) — sigue con admin para operar mientras se completa el traspaso; revocárselo el día que ya no necesite operar el panel.

El otro desarrollador inicial (Miguel, `miguelitoqm970@gmail.com`) está registrado en la web pero **no** tiene rol admin.

> Para consultar la lista actualizada en cualquier momento, ejecuta en el SQL Editor de Supabase:
> ```sql
> select u.email, p.role
> from public.profiles p
> join auth.users u on u.id = p.id
> where p.role = 'admin';
> ```

### Cómo otorgar admin a una persona nueva

**El rol admin no se puede solicitar desde el frontend ni manipular con peticiones HTTP públicas** — un trigger en la base de datos lo impide y el backend verifica el rol contra la tabla `profiles` en cada petición de admin. La única forma de concederlo es directamente desde Supabase:

1. **Registro del usuario**: La persona se registra normalmente desde `https://lesiuuluette.com` con su correo y contraseña. Por defecto su cuenta se crea con rol `'user'`.
2. **Acceso a Supabase**: Un Owner del proyecto inicia sesión en `https://supabase.com` con la cuenta corporativa `lesiuuluette@gmail.com`.
3. **Editar `profiles`**: Sidebar → **Table Editor** → tabla `profiles`. Buscar la fila del nuevo usuario (puedes cruzar por `id` con la tabla `auth.users` si no recuerdas el UUID).
4. **Cambiar el rol**: Doble clic sobre la columna `role` (estará en `'user'`), escribir exactamente **`admin`** (minúsculas, sin comillas, sin espacios), guardar.
5. **Resultado**: La próxima vez que esa persona inicie sesión tendrá acceso al panel `/admin/*`.

Alternativa por SQL Editor (más rápido si sabes el correo):

```sql
update public.profiles
set role = 'admin'
where id = (select id from auth.users where email = 'CORREO@AQUI.COM');
```

### Cómo revocar admin

El mismo procedimiento al revés: cambiar `role` de `admin` a `user`. **Hacerlo el mismo día** que la persona deje el proyecto, como parte del checklist de offboarding (ver "Custodia de secretos y traspaso" más abajo).

---

## ✅ Resueltos e Implementados (Mejoras Recientes)

Se han completado y auditado con éxito las siguientes defensas y optimizaciones en la base de código:

*   **Asociación Segura de Pagos**: Los PaymentIntents de Stripe se atan al `user_id` de la sesión en `/intent` y se validan estrictamente en `/attach` y `/confirm`, evitando el secuestro de transacciones ajenas.
*   **Idempotencia contra Reentregas**: Webhook protegido contra envíos duplicados de Stripe mediante registro atómico en la tabla `stripe_events` (clave única `event_id`).
*   **Hardening del Checkout**: `/checkout/intent` requiere autenticación activa, valida que la variante y producto padre estén activos, rechaza stock insuficiente antes de cobrar y establece un límite máximo de 50 prendas por línea.
*   **Saneamiento de Código del Carrito (`cart.js`)**: Eliminadas rutas zombies redundantes (`POST /remove` y `POST /update`). Toda la lógica del carrito opera de forma limpia bajo los estándares RESTful (`DELETE` y `PATCH` por ID de fila).

---

## ⚠️ Pendientes antes del Lanzamiento (En Producción)

### Bloqueantes (Seguridad y configuración)
- [ ] **SMTP propio de Resend en Supabase (urgente)**: Ir a Supabase -> Authentication -> SMTP Settings y meter las credenciales SMTP de tu cuenta de Resend. El SMTP por defecto de Supabase tiene un límite estricto de ≈3-4 correos/hora; sin esto, los registros de nuevos clientes fallarán cuando haya tráfico.
- [ ] **Rotar las claves antes del lanzamiento (opcional)**: Como medida estándar de higiene de seguridad, puedes rotar en el panel de Hostinger y en local: `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_KEY` y `RESEND_API_KEY`.

> ⚠️ **Importante sobre las secret keys de Stripe**: La clave secreta `STRIPE_SECRET_KEY` ya se encuentra configurada en Hostinger y, por seguridad, ya no es visible en el panel de Stripe. Si se pierde o borra de Hostinger, será necesario generar una nueva clave en Stripe y volver a pegarla en el panel de Hostinger. Lo mismo aplica al `STRIPE_WEBHOOK_SECRET` (`whsec_...`) del webhook que procesa facturas y correos transaccionales. Se recomienda archivar copias seguras en un gestor de contraseñas de equipo (ej: Bitwarden/1Password) si en el futuro decides rotarlas o generar nuevas claves.

### Optimización y Código
- [ ] **Paginación de Catálogo**: Modificar `/api/products` para paginar la respuesta de la base de datos (evita el cuello de botella actual N+1 en catálogos grandes).
- [ ] **GDPR mínimo**: Añadir "derecho al olvido" (borrado definitivo de cuenta con eliminación en cascada de los datos personales).

### Recomendación a futuro
- [ ] **Plan Pro de Supabase (~25 €/mes)**: Opcional para producción. Desbloquea copias de seguridad diarias, recuperación punto en el tiempo (PITR) y cuotas de transferencia y base de datos más altas. Recomendado de cara al lanzamiento real.

---

## 📦 Sistema de Reservas (Drops / Preorders)

> **Importante**: el drop que aparece hoy en la home ("DROP BLOQUEADO — 01" con fecha de julio) es **ficticio, un placeholder de ejemplo** escrito a mano en `siuuluette/frontend/src/components/UpcomingReleases.vue`. **No corresponde a un lanzamiento real planificado**. Cuando se quiera anunciar un drop real, hay que configurar la pieza siguiendo lo que viene abajo.

El sistema permite a clientes autenticados pre-reservar prendas de colecciones exclusivas antes del lanzamiento oficial.

### Funcionamiento actual
1. El usuario autenticado pulsa "Reservar" → el frontend llama a `POST /api/drops/preorder` con `product_name`.
2. El backend inserta una fila en la tabla `preorders` de Supabase:
   ```json
   {
     "product_name": "Nombre del drop (texto)",
     "email": "correo@usuario.com",
     "user_id": "uuid-del-usuario",
     "status": "pending"
   }
   ```
3. **No se envía email de confirmación** (el modal ya lo refleja correctamente: "Hemos registrado tu reserva").

### Cómo configurar un drop real (cuando llegue el momento)

1. **Crear el producto del drop en la BD** (tabla `products`) como cualquier otra prenda, con sus variantes de color, imágenes y stock. En las filas de `variant_stock`, marcar `stock_mode = 'preorder'` para que el catálogo lo trate como reservable y no aparezca en el stock disponible normal.
2. **Cambiar `UpcomingReleases.vue`** para que el nombre, precio y fecha del drop se lean de la API en lugar de estar hardcodeados. Así se cambia el drop desde el panel admin sin tocar código.
3. **Implementar `sendPreorderConfirmationEmail`** en `utils/mailer.js` y llamarlo desde `routes/drops.js` tras insertar la reserva. Es paralelo al ya existente `sendOrderConfirmationEmail`.
4. **Enlazar `preorders` con `products` estructuralmente** — añadir una columna `product_id` (FK a `product_variants` o a `products`) a la tabla `preorders`, sustituyendo o complementando el `product_name` actual (que hoy es solo texto sin relación).

### Otras mejoras del sistema de reservas
*   **Prevención de duplicados** ✅ ya hecho. Existe el constraint `preorders_user_product_unique (user_id, product_name)` en Supabase y `drops.js` captura el error `23505` devolviendo *"Ya tienes una reserva activa para este lanzamiento."*
*   **Notificación del día del lanzamiento**: implementar un cron o tarea programada que recorra `preorders` y envíe email vía Resend cuando el producto pase de `preorder` a `limited`. Mientras tanto, se puede exportar el CSV desde el panel admin (`/admin/preorders`) y notificar manualmente.

---

## 🛠️ Cómo arrancar y Despliegue

### Estructura
```
siuuluette-brand/
└── siuuluette/
    ├── frontend/   → Vue 3 + Vite (SPA) - CSS Puro (sin Tailwind)
    └── backend/    → Fastify 5 + Supabase + Stripe
```

### Comandos de desarrollo
1.  **Backend** (Puerto 3000):
    ```bash
    cd siuuluette/backend && npm install && npm run dev
    ```
2.  **Frontend** (Puerto 5173):
    ```bash
    cd siuuluette/frontend && npm install && npm run dev
    ```

### Despliegue en Hostinger (LiteSpeed)
El hosting de Hostinger Node.js espera que los puntos de ejecución residan en la raíz. Por ello:
*   La raíz tiene un `package.json` y un `server.js` que actúan como **Wrapper**.
*   El `server.js` de la raíz utiliza **`import()` dinámico** para evitar colisionar con CommonJS (`require()`) de LiteSpeed. **No modificar este wrapper**.
*   Las variables de entorno se configuran en el Panel de Hostinger (no se sube ningún `.env` al repositorio).

### Variables de entorno necesarias

El backend **no arranca sin un `.env`** correctamente configurado (en local) o sin estas mismas variables en el Panel de Hostinger (en producción):

| Variable | Para qué sirve | Notas |
|---|---|---|
| `JWT_SECRET` | Firma de los JWT de sesión. | Mínimo 32 caracteres, aleatorio. Distinto en cada entorno. |
| `SUPABASE_URL` | URL del proyecto Supabase. | Pública, se puede compartir. |
| `SUPABASE_KEY` | Anon key de Supabase. | Pública por diseño, pero rotable. |
| `SUPABASE_SERVICE_ROLE_KEY` | Service key (bypass RLS). | **Secreta. Solo backend. Jamás frontend.** |
| `STRIPE_SECRET_KEY` | Clave secreta de Stripe. | `sk_test_...` en local, `sk_live_...` en producción. |
| `STRIPE_WEBHOOK_SECRET` | Firma del webhook de Stripe. | `whsec_...`. Distinto por entorno (test vs live). |
| `RESEND_API_KEY` | API key de Resend (envío de emails). | Producción. |
| `RESEND_FROM_EMAIL` | Dirección remitente. | Ej: `pedidos@lesiuuluette.com`. |
| `COMPANY_LEGAL_NAME`, `COMPANY_TAX_ID`, `COMPANY_ADDRESS_*` | Datos fiscales para las facturas PDF. | Los valores por defecto del código son los reales de la S.L. |
| `FRONTEND_URL` | URL del frontend (para CORS y enlaces en emails). | `https://lesiuuluette.com` en producción. |
| `EMAIL_DEV_RECIPIENT_OVERRIDE` | (Solo dev) Redirige todos los emails a una dirección concreta. | Para no spamear a usuarios reales al probar. |
| `NODE_ENV` | Modo de ejecución. | `production` en Hostinger; activa CORS estricto y logger JSON. |

Frontend solo necesita `VITE_STRIPE_PUBLISHABLE_KEY` (clave pública de Stripe, `pk_test_...` en local y `pk_live_...` en producción) y `VITE_API_URL` (URL del backend; en producción es `https://lesiuuluette.com`).

---

## 🔐 Custodia de secretos y traspaso

Cuando alguien deja el equipo (o como práctica periódica), seguir este checklist:

1. **Rotar** en sus dashboards: `JWT_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `RESEND_API_KEY`.
2. **Actualizar** los nuevos valores en el panel de variables de Hostinger.
3. **Guardar** los valores nuevos en un gestor de contraseñas compartido del equipo (Bitwarden gratuito sirve bien). El `.env` no se versiona ni se manda por chat.
4. **Revocar acceso** del ex-miembro a: Supabase, Stripe, Resend, Hostinger, GitHub, y a las cuentas Gmail (`lesiuuluette@gmail.com`, `webregladoac1@gmail.com`).
5. **Revocar rol admin** en la tabla `profiles` de Supabase si lo tenía.
6. **Revisar logs** recientes (Stripe, Supabase, Hostinger) por accesos anómalos.

Acceso mínimo al gestor de contraseñas: **dos personas** (desarrollador principal + responsable de negocio), nunca solo una.

---

## 💳 Guía de Pruebas de Pago (Local vs Producción)

Para garantizar la seguridad de la pasarela y no mezclar entornos, sigue estas directrices para probar el flujo de checkout:

### 1. Pruebas en Entorno Local (Desarrollo)
*   **Estado**: **Modo Test (Prueba)**.
*   **Tarjeta de prueba**: Utiliza siempre el número `4242 4242 4242 4242` con cualquier fecha de caducidad futura y cualquier código CVC.
*   **Verificación**: Las transacciones aparecerán reflejadas únicamente en el apartado "Test Mode" de tu panel de Stripe. No se moverá dinero real.
*   **Cómo probar**: Levanta el backend y frontend locales, añade cualquier artículo del catálogo al carrito y realiza la compra de prueba normal.

### 2. Pruebas en el Dominio Real (Producción)
*   **Estado**: **Modo Live (Real)**.
*   *⚠️ Importante*: La tarjeta de prueba `4242` **NO** funcionará en producción; Stripe la rechazará.
*   **Cómo validar un flujo de dinero real por solo 1 €**:
    1.  **Cambiar precio temporalmente**: Accede al panel de administración en producción (`/admin/products` o directamente en la tabla `products` de Supabase) y edita temporalmente el precio de un producto específico, cambiándolo a exactamente **`1.00` €**.
    2.  **Realizar la Compra**: Accede a `https://lesiuuluette.com`, añade ese producto de 1 € al carrito y completa la compra en el formulario utilizando tu **tarjeta de crédito real**.
    3.  **Comprobaciones de Éxito**:
        *   Verifica que el banco te cargue 1 € correctamente.
        *   Confirma que se ha creado el pedido en Supabase con estado `paid`.
        *   Verifica que el PDF de la factura se ha generado y subido a Supabase Storage.
        *   Comprueba que te ha llegado el email de confirmación transaccional (vía Resend) con el PDF de la factura adjunto.
    4.  **Hacer el Reembolso**: Accede al Dashboard de Stripe en modo Live, busca el cobro real de 1 € y realiza un **Reembolso completo** (Refund) de inmediato para recuperar el dinero.
    5.  **Restaurar el precio**: Vuelve al panel de administración y restablece el precio original del producto específico.

---
*Siuuluette Brand · Make It Real · 2026*
