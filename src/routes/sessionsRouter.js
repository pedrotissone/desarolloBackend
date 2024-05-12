import { Router } from "express";
import { UsersManagerMongo as UsersManager } from "../dao/UsersManagerMongo.js";
import { generateHash } from "../../utils.js";



export const router = Router()

const usersManager = new UsersManager() //Instancio mi clase


router.post("/signUp", async (req, res) => { // registro para un nuevo usuario

    let { nombre, email, password } = req.body
    console.log(req.body)

    if (!nombre || !email || !password) {
        res.setHeader("Content-Type", "application/json")
        return res.status(400).json("No se enviaron todos los datos para crear el usuario")
    }

    try {
        let existe = await usersManager.getBy({ email }) //Es igual que poner {email:email}
        if (existe) {
            res.setHeader("Content-Type", "application/json")
            return res.status(400).json("Ya existe registrado un usuario con el mismo email")
        }

        password = generateHash(password) //Hasheo la contraseña antes de subirla a la DB

        let nuevoUsuario = await usersManager.create({ nombre, email, password, rol:"usuario" })//Por defecto los usuarios van a tener siempre ese rol

        res.setHeader("Content-Type", "application/json")
        return res.status(200).json(nuevoUsuario)

    } catch (error) {
        res.setHeader("Content-Type", "application/json")
        res.status(500).json("Error en el servidor al crear el usuario")
    }
})

router.post("/login", async (req, res) => { //Me logeo con usuario ya registrado

    let { email, password, web } = req.body

    if (!email || !password) {
        res.setHeader("Content-Type", "application/json")
        return res.status(400).json("Complete el email y la contraseña!")
    }

    try {
        let usuario = await usersManager.getBy({ email, password: generateHash(password) }) //Valido email y contraseña
        if (!usuario) {
            res.setHeader("Content-Type", "application/json")
            return res.status(400).json("Credenciales inválidas")
        }
        //Si me logeo desde la web me redirijo al home
        if (web) {
            //Por seguridad elimino la contraseña para que no se muestre
            usuario = { ...usuario }//No se para que hago esto..
            delete usuario.password
            //Creo una session para el usuario
            req.session.usuario = usuario
            return res.redirect("/handlebars/")
        } else {

            //Por seguridad elimino la contraseña para que no se muestre
            usuario = { ...usuario }//No se para que hago esto..
            delete usuario.password

            //IMPORTANTE: Aca creo una session para el usuario!!!
            req.session.usuario = usuario
    
            res.setHeader("Content-Type", "application/json")
            res.status(200).json({ payload: "login correcto", usuario })
        }

    } catch (error) {
        res.setHeader("Content-Type", "application/json")
        res.status(500).json("Error en el servidor al logearse")
    }
})

router.get("/logout", (req, res) => {//Destruyo la session para el logout
    req.session.destroy((error) => {//Así es la sintaxis de este metodo..
        if (error) {
            console.log(error)
            res.setHeader("Content-Type", "application/json")
            return res.status(500).json("Error en el servidor al querer destruir la session")
        }
    })

    // return res.status(200).json("Logout exitoso")
    res.setHeader("Content-Type", "text/html")
    return res.redirect("/handlebars/login")
})


