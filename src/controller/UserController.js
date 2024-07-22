import { userService } from "../services/UserService.js"
import jwt from "jsonwebtoken"
import { SECRET, enviarEmail, generateHash, logger, validaPassword } from "../utils/utils.js"


export class UserController {

    static getRestablecerClave = async (req, res) => {
        let { email } = req.body

        try {
            //1) Comprobar que el email pertenezca a un usuario registrado en la DB
            let usuario = await userService.checkEmail({ email: email })
            if (usuario) {    
                //2) Creo token con los datos del usuario
                let token = jwt.sign(usuario, SECRET, { expiresIn: "1h" })//Creo token
                res.cookie("usercookie", token, { httpOnly: true })//Creo cookie desde el servidor y guardo el token

                //3) Creo estructura HTML del cuerpo del email
                let estructuraHTML = `<h2>Hága click en el siguiente link para reestablecer su contraseña</h2>
                                        <a href="http://localhost:8080/handlebars/crearNuevaClave/${token}">Restablecer contraseña</a>`

                //4) Enviar email
                await enviarEmail(usuario.email, "Restablecimiento de contraseña CODER", estructuraHTML)

                res.setHeader("Content-Type", "text/html")
                res.status(200).json(`Recibirá un correo en ${usuario.email} para restablecer su contraseña`)
            } else {
                res.setHeader("Content-Type", "text/html")
                res.status(200).json("No existe el email requerido en nuestra DB")
            }
        } catch (error) {
            res.setHeader("Content-Type", "application/json")
            res.status(500).json({ Error: "Error 500 - Error inesperado en el servidor al buscar el email del usuario" })
        }
    }

    static getCorroborarNuevaClave = async (req, res) => {

        if (!req.cookies.usercookie) {
            res.setHeader("Content-Type", "application/json")
            return res.status(400).json({ error: "Ya fue realizada la modificación de la clave con exito" })
        }


        let {password} = req.body
        let token = req.params.token
        //Decodifico el token para obtener los datos de usuario
        let decoded = jwt.verify(token, SECRET)
        console.log(password)
        console.log(decoded)

        //Guardo el Id del usuario
        let id = decoded._id       

        try {
            //1) Valido si la nueva contraseña es igual a la registrada en la DB
            if (!validaPassword(password, decoded.password)) {
                logger.debug("Bien la contraseña es diferente a la anterior, ahora la hasheamos y la acualizamos")
                let hashedPassword = generateHash(password)
                let resultado = await userService.updatePassword(id, hashedPassword)
                res.clearCookie("usercookie")
                res.setHeader("Content-Type", "text/html")
                res.status(200).json(resultado)
            } else {
                res.setHeader("Content-Type", "text/html")
                res.status(400).json("La nueva constraseña no puede ser igual a la registrada en nuestra DB")
            }            
        } catch (error) {
            res.setHeader("Content-Type", "application/json")
            return res.status(500).json({ error: "Error en el Servidor al querer actualizar la clave del usuario" })            
        }
    }

}