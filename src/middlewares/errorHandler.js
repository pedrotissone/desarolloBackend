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
        case TIPOS_ERROR.AUTORIZACION:
            res.setHeader("Content-Type", "application/json")
            return res.status(403).json({ error: "Credenciales incorrectas (Custom Error)" })
            
        case TIPOS_ERROR.ARGUMENTOS_INVALIDOS:
            res.setHeader("Content-Type", "application/json")
            return res.status(400).json({ error: error.message })
            
        default:
            res.setHeader("Content-Type", "application/json")
            return res.status(500).json({ error: " Internal Server Error - Contacte al Administrador (Custom Error)" })            
    }
}

export { errorHandler }