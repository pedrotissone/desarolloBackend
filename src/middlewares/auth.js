//                          VIEJO AUTH
// export const auth = (req, res, next) => {
//     if(!req.session.usuario) {
//         res.setHeader("Content-Type", "application/json")
//        return res.status(400).json("Error, No existen usuarios autenticados") 
//     }
//     next()
// }

export const auth = (permisos=[]) => { //auth(["admin", "premium"])
    return (req, res, next) => {
        permisos = permisos.map(p => p.toLowerCase()) //Paso todos los permisos a minuscula por las dudas
    
        // if (permisos.includes("public")) { //Si la ruta es publica puede ingresar cualquier usuario, no la voy a usar
        //     return next()
        // }

        if (!req.user?.rol) { //Hay user? si hay entonces hay user.rol?
            res.setHeader("Content-Type", "application/json")
            return res.status(401).json("No hay usuarios autenticados")
        }       

        if (!permisos.includes(req.user.rol.toLowerCase())) { //Pregunto si el array de permisos incluye el rol del usuario
            res.setHeader("Content-Type", "application/json")
            return res.status(403).json("El usuario no tiene acceso a esta ruta")
        }
        
        next()
    }
}