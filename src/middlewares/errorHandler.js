import { TIPOS_ERROR } from "../utils/EError.js"

//Middleware para manejar errores (Va a nivel aplicación y escrito debajo de todas las rutas o al final)
const errorHandler = (error, req, res, next) => {
    // if (error) {
    //     res.setHeader("Content-Type", "application/json")
    //     return res.status(500).json(
    //         {
    //             error: "Error inesperado en el Servidor - (Middleware - handleError)"
    //         }
    //     )
    // }
    // next()
    console.log(`${error.cause ? error.cause : "No hay causa de error especifica"}`)

    switch (error.code) {
        //Este caso deberia eliminarlo porque nunca llega, ya que lo manejo con el middleware auth.js
        case TIPOS_ERROR.AUTORIZACION:                       
            res.setHeader("Content-Type", "application/json")
            return res.status(403).json({ error: "Credenciales incorrectas (Custom Error)" })
            
        case TIPOS_ERROR.ARGUMENTOS_INVALIDOS:
            //Agrego logger para guardar en un archivo los errores
            req.logger.error(`Peticion ${req.method} hacia ${req.originalUrl} provoco el siguiente error: ${error.message}`)           
            res.setHeader("Content-Type", "application/json")
            return res.status(400).json({ error: error.message })
            
        default:
            //Agrego logger para guardar en un archivo los errores
            req.logger.error("No hay causa de error especifica "+ error.stack)
            res.setHeader("Content-Type", "application/json")
            return res.status(500).json({ error: " Error inesperado en el Servidor - Contacte al Administrador (Custom Error)" })            
    }
}

export { errorHandler }