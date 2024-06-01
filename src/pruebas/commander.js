import { Command, Option } from "commander"

let programa = new Command()
//<> eso te marca el tipo de dato esperado, String Number, Boolean
programa.option("-p, --portConn, <port>", "Puerto de conexion del Servidor", 8080) //Le doy valor por defecto 8080

//Opcion obligatoria para ejecucion de script
programa.requiredOption("-u, --usuario <usuario>", "usuario que corre el script") //Si no hay usuario no se ejecuta script

//Peronalizo las opciones posibles
programa.addOption( new Option("-m, --mode <modo>", "Mode de ejecucion del script").choices(["dev", "prod", "test"]).default("dev"))

programa.parse()

const argumentos = programa.opts() //Todas las opciones de argumentos creadas
const port = argumentos.portConn
console.log(argumentos)
