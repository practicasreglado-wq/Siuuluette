/**
 * ARCHIVO: env.js
 * DESCRIPCIÓN: Carga y valida las variables de entorno desde el archivo .env ubicado en la raíz del backend.
 * Asegura que estén disponibles para toda la aplicación desde el primer momento de ejecución.
 */
import dotenv from 'dotenv'

import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
// Fuerza a dotenv a buscar el archivo .env exactamente en la carpeta backend
dotenv.config({ path: path.join(__dirname, '../.env') })
