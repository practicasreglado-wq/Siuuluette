# Le Siuuluette — Guía para desarrolladores

Información imprescindible para el desarrollo y despliegue del proyecto **Le Siuuluette**.

> **Nota de marca:** El nombre se escribe **"Le Siuuluette"** (separado). En código y carpetas aparece como `siuuluette` de forma interna; en cualquier texto de cara al usuario final debe ir separado.

---

## 🚀 Estado del proyecto (Mayo 2026)

*   **Producción**: Desplegado en `https://lesiuuluette.com` (Hostinger Node.js).
*   **Despliegue automático**: Hostinger está conectado a GitHub y despliega automáticamente la rama **`diego`** al recibir un `push`.
*   **Emails transaccionales**: Verificados y operativos en producción mediante **Resend** (cuenta `webregladoac1@gmail.com`). Remitente: `pedidos@lesiuuluette.com`.
*   **Stripe**: La cuenta de la SL (*LE SIUULUETTE TRADEMARK, S.L.*) está **activada** e implementada en producción con claves `live` en Hostinger. Los pagos reales han sido verificados y funcionan correctamente, mientras que el entorno local (`localhost`) sigue usando las claves `test` para pruebas seguras.
*   **Base de datos**: Alojada en **Supabase**. La organización del proyecto tiene como Owner principal a `lesiuuluette@gmail.com` (cuenta corporativa), lo que garantiza que toda la base de datos e infraestructura pertenecen de forma íntegra a la empresa. Diego utiliza su correo `disago2002@gmail.com` únicamente para pruebas de pedidos y desarrollo en el entorno test local (donde posee rol de administrador). Las cuentas personales adicionales de los propietarios de Supabase (como la de Diego y de un compañero anterior) se pueden retirar con total seguridad de la organización de Supabase; la base de datos no sufrirá ningún impacto y el control completo quedará en la cuenta corporativa `lesiuuluette@gmail.com`.

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

El sistema cuenta con un modelo de seguridad estricto. **El rol de administrador no se puede solicitar desde el frontend ni manipular con peticiones HTTP públicas en la API por seguridad**. Para otorgar permisos de administrador de manera totalmente segura a un desarrollador o persona del equipo, se debe proceder de forma excepcional y manual directamente en la base de datos:

1.  **Registro del usuario**: El desarrollador debe registrarse normalmente desde la web `https://lesiuuluette.com` con su correo y contraseña elegida. Por defecto, su cuenta se creará con el rol de cliente `'user'`.
2.  **Acceso a la DB**: Un propietario del proyecto debe iniciar sesión en el panel de **Supabase** (`https://supabase.com`) con la cuenta de Gmail corporativa `lesiuuluette@gmail.com`.
3.  **Localizar la tabla**: En la barra lateral izquierda, entrar en el **Table Editor** (Editor de tablas) y seleccionar la tabla `profiles`.
4.  **Otorgar rol**:
    *   Buscar la fila correspondiente al correo del desarrollador recién registrado.
    *   Hacer doble clic sobre el valor de la columna `role` (que inicialmente contendrá `'user'`).
    *   Escribir el valor **`'admin'`** de manera exacta (todo en minúsculas y sin espacios).
    *   Confirmar y pulsar en guardar cambios en la base de datos.
5.  **Resultado**: Al volver a iniciar sesión, el desarrollador tendrá acceso inmediato al panel exclusivo `/admin` en la web.

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
