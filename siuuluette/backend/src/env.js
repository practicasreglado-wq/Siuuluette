import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
// Fuerza a dotenv a buscar el archivo .env exactamente en la carpeta backend
dotenv.config({ path: path.join(__dirname, '../.env') })
