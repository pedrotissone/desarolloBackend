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

//                              ARTILLERY (PARA PROBAR RENDIMIENTO DEL SERVIDOR)
//Comando quick para peticiones get: artillery quick -c 20 -n 5 http://blablabla (-c = usuarios -n = cant de peticiones GET)

//Guardar metricas en un archivo txt con > o en json con -o: artillery quick -c 20 -n 5 https://www.aeginatocados.com.ar/category/Flores%20preservadas > metricas.txt
