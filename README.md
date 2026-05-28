# Le Siuuluette — Guía para desarrolladores

Información imprescindible para el desarrollo y despliegue del proyecto **Le Siuuluette**.

> **Nota de marca:** El nombre se escribe **"Le Siuuluette"** (separado). En código y carpetas aparece como `siuuluette` de forma interna; en cualquier texto de cara al usuario final debe ir separado.

---

## 🚀 Estado del proyecto (Mayo 2026)

*   **Producción**: Desplegado en `https://lesiuuluette.com` (Hostinger Node.js).
*   **Despliegue automático**: Hostinger está conectado a GitHub y despliega automáticamente la rama **`diego`** al recibir un `push`.
*   **Emails transaccionales**: Verificados y operativos en producción mediante **Resend** (cuenta `webregladoac1@gmail.com`). Remitente: `pedidos@lesiuuluette.com`.
*   **Stripe**: La cuenta de la SL (*LE SIUULUETTE TRADEMARK, S.L.*) está **activada** y las claves `live` están disponibles. El proyecto desplegado sigue usando las claves `test` (no se mueve dinero real todavía); el cambio a producción se hace siguiendo el primer pendiente más abajo.
*   **Base de datos**: Alojada en **Supabase**. La organización tiene **dos Owners**: la cuenta personal con la que se creó originalmente y `lesiuuluette@gmail.com` (cuenta corporativa). Para máxima continuidad, lo ideal es transferir el proyecto a una organización propiedad únicamente de la empresa (ver pendientes).

---

## ✅ Resueltos e Implementados (Mejoras Recientes)

Se han completado y auditado con éxito las siguientes defensas y optimizaciones en la base de código:

*   **Asociación Segura de Pagos**: Los PaymentIntents de Stripe se atan al `user_id` de la sesión en `/intent` y se validan estrictamente en `/attach` y `/confirm`, evitando el secuestro de transacciones ajenas.
*   **Idempotencia contra Reentregas**: Webhook protegido contra envíos duplicados de Stripe mediante registro atómico en la tabla `stripe_events` (clave única `event_id`).
*   **Hardening del Checkout**: `/checkout/intent` requiere autenticación activa, valida que la variante y producto padre estén activos, rechaza stock insuficiente antes de cobrar y establece un límite máximo de 50 prendas por línea.
*   **Saneamiento de Código del Carrito (`cart.js`)**: Eliminadas rutas zombies redundantes (`POST /remove` y `POST /update`). Toda la lógica del carrito opera de forma limpia bajo los estándares RESTful (`DELETE` y `PATCH` por ID de fila).

---

## ⚠️ Pendientes antes del Lanzamiento (En Producción)

### Bloqueantes (Seguridad y cobros)
- [ ] **Activar Stripe en producción.** Las claves `live` ya están disponibles. Pasos:
  1. Sustituir en el panel de variables de Hostinger `STRIPE_SECRET_KEY` por `sk_live_...` y `VITE_STRIPE_PUBLISHABLE_KEY` por `pk_live_...`.
  2. Crear el webhook en **Stripe live mode** → Developers → Webhooks → Add endpoint, URL `https://lesiuuluette.com/api/checkout/webhook`, eventos `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`.
  3. Copiar el `whsec_...` resultante a `STRIPE_WEBHOOK_SECRET` en Hostinger.
  4. Confirmar el IBAN del payout (a nombre de la SL).
  5. Hacer una compra real de 1 € con tarjeta propia para validar el flujo end-to-end.
- [ ] **Rotar las claves antes del lanzamiento** como higiene de seguridad estándar: `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_KEY`, las nuevas `STRIPE_SECRET_KEY` live y `RESEND_API_KEY`.

### Hardening de Base de Datos (Supabase)
- [ ] **SMTP propio de Resend en Supabase (urgente)**: Authentication → SMTP Settings, meter credenciales de Resend. "Confirm email" está activado y el SMTP por defecto de Supabase tiene un límite de ≈3-4 correos/hora; sin esto, los registros nuevos no recibirán el correo de confirmación cuando haya tráfico.
- [ ] **(Opcional) Transferir el proyecto Supabase** a una organización propiedad únicamente de la empresa. Ya hay dos Owners en la organización actual (la cuenta personal con la que se creó y `lesiuuluette@gmail.com` de la empresa), así que el riesgo de continuidad ya está resuelto: ambas cuentas pueden gestionar todo. La transferencia es polish extra para que la propiedad estructural recaiga 100% en la empresa, pero no es bloqueante.

### Optimización y Código
- [ ] **Paginación de Catálogo**: Modificar `/api/products` para paginar la respuesta de la DB (evita el cuello de botella actual N+1 en catálogos grandes).
- [ ] **GDPR mínimo**: añadir "derecho al olvido" — borrado de cuenta con cascade de datos personales.

### Recomendación a futuro
- [ ] **Plan Pro de Supabase (~25 €/mes)**: opcional pero recomendado para producción. Desbloquea backups diarios + point-in-time recovery, Leaked Password Protection (HaveIBeenPwned) y cuotas más altas de email/auth. Cuando se acerque el lanzamiento real es razonable subirlo solo por los backups.

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
*   **Prevención de Duplicados**: Actualmente no existe restricción a nivel de base de datos; un mismo usuario puede reservar el mismo drop múltiples veces.
    *   **Acción de DB**: Añadir una restricción única en Supabase SQL Editor:
        ```sql
        ALTER TABLE preorders ADD CONSTRAINT unique_user_preorder UNIQUE (user_id, product_name);
        ```
    *   **Acción de Backend**: Capturar el error Postgres `23505` (violación de clave única) en `drops.js` y retornar un `400` con el mensaje: *"Ya has realizado una reserva para este lanzamiento."*
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

---

## 🔒 Seguridad Activa
*   **CSRF**: Requerido (`x-csrf-token`) en todas las peticiones POST, PATCH, PUT y DELETE.
*   **Helmet**: Configurado sin `unsafe-inline` en scripts. El iframe de Stripe está permitido explícitamente.
*   **Rate Limits**: Global de 200 req/min, 20/min en intents de cobro y 5/min en login/registro.
*   **JWT**: Administrado enteramente vía **cookies HttpOnly** (`Secure`, `SameSite=Lax`).
*   **Control Admin**: El rol `admin` se valida en tiempo real en la tabla `profiles` de Supabase en cada consulta del panel interno (`/api/admin/*`), protegiendo el panel ante revocaciones instantáneas.

---
*Siuuluette Brand · Make It Real · 2026*
