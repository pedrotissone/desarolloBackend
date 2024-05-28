
export const auth = (permisos=[]) => { //auth(["admin", "premium"])
    return (req, res, next) => {

        //Paso todos los permisos a minuscula por las dudas
        permisos = permisos.map(p => p.toLowerCase())

        //Si la ruta es publica puede ingresar cualquier usuario, no la voy a usar
        // if (permisos.includes("public")) { 
        //     return next()
        // }

        //1) Hay usuario?
        if (!req.user?.rol) { //Hay user? si hay entonces hay user.rol?
            res.setHeader("Content-Type", "application/json")
            return res.status(401).json("No hay usuarios autenticados")
        }

        //2) Tiene permiso?
        if (!permisos.includes(req.user.rol.toLowerCase())) { //Pregunto si el array de permisos incluye el rol del usuario
            res.setHeader("Content-Type", "application/json")
            return res.status(403).json("El usuario no tiene acceso a esta ruta")
        }
        
        next()
    }
}