import dotenv from "dotenv"
import { Command, Option } from "commander"

//Esta librería me permite configurar mis propios argumentos(flags) al ejecutar un script
let programa = new Command()
//Peronalizo las opciones posibles con el metodo addOption
programa.addOption( new Option("-m, --mode <modo>", "Mode de ejecucion del script").choices(["dev", "prod"]).default("dev"))
programa.parse() //Tengo que parsear
const argumentos = programa.opts()

const mode = argumentos.mode

dotenv.config(
    {
        path: mode === "prod" ? "./src/.env.production" : "./src/.env.development", //Indico a que archivo .env debe apuntar
        override: true //Sobreescribe valores de variables de entorno que ya existan en mi maquina por las que yo defina en mi .env
    }
)

// Creo un objeto con todas las variables de entorno de mi .env y lo exporto (Para mayor facilidad y mantencion, podria no hacerlo)
export const config = {
    PORT: process.env.PORT || 3000,
    MONGO_URL: process.env.MONGO_URL,
    DB_NAME: process.env.DB_NAME,
    CLIENT_SECRET: process.env.CLIENT_SECRET,
    CLIENT_ID: process.env.CLIENT_ID,
    SECRET: process.env.SECRET,
    SECRET_SESSION: process.env.SECRET_SESSION
}