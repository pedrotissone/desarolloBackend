import {fileURLToPath} from "url"
import {dirname, join} from "path"

//__DIRNAME CASERO
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default __dirname;

//__dirname 01:05:00 Express Avanzado