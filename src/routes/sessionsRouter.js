import { Router } from "express";
import { UsersManagerMongo as UsersManager } from "../dao/UsersManagerMongo.js";
import { SECRET } from "../../utils.js";
import jwt from "jsonwebtoken";
import passport from "passport";



export const router = Router()

const usersManager = new UsersManager() //Instancio mi clase

router.get("/error", (req, res) => {
    res.setHeader("Content-Type", "application/json")
    res.status(500).json("Error en la autenticación")
})

// 3er paso de passport, agrego middleware a la ruta y le indico el nombre de la estrategia elegida
router.post("/signUp", passport.authenticate("signUp", { failureRedirect: "/api/sessions/error" }), async (req, res) => { // registro para un nuevo usuario

    //Si sale todo bien passport crea un req.user y nos deja los datos ahi
    res.setHeader("Content-Type", "application/json")
    return res.status(201).json({ nuevoUsuario: req.user })

    //LOGICA PREVIA A IMPLEMENTACIÓN DE PASSPORT
    // let { nombre, email, password } = req.body
    // console.log(req.body)

    // if (!nombre || !email || !password) {
    //     res.setHeader("Content-Type", "application/json")
    //     return res.status(400).json("No se enviaron todos los datos para crear el usuario")
    // }

    // try {
    //     let existe = await usersManager.getBy({ email }) //Es igual que poner {email:email}
    //     if (existe) {
    //         res.setHeader("Content-Type", "application/json")
    //         return res.status(400).json("Ya existe registrado un usuario con el mismo email")
    //     }
    //     //Hasheo la contraseña antes de subirla a la DB
    //     password = generateHash(password)

    //     let nuevoUsuario = await usersManager.create({ nombre, email, password, rol:"usuario" })//Por defecto los usuarios van a tener siempre ese rol

    //     res.setHeader("Content-Type", "application/json")
    //     return res.status(200).json(nuevoUsuario)

    // } catch (error) {
    //     res.setHeader("Content-Type", "application/json")
    //     res.status(500).json("Error en el servidor al crear el usuario")
    // }
})

// 3er paso de passport, agrego middleware a la ruta y le indico el nombre de la estrategia elegida
router.post("/login", passport.authenticate("login", { failureRedirect: "/api/sessions/error" }), async (req, res) => { //Me logeo con usuario ya registrado

    let { web } = req.body

    if (web) { //Si sale todo OK en passport, este crea un req.user
        let usuario = { ...req.user } //spread operator
        delete usuario.password
        //Aca creo una session para el usuario
        req.session.usuario = usuario
        return res.redirect("/handlebars/")
    } else {
        //Rompo la referencia usando el spread (para que no me elimine la password del usuario de la DB) y le borro la contraseña para no devolverla en la response
        let usuario = { ...req.user }//No es necesario xq es un usuario en memoria no el de la DB
        delete usuario.password

        //creo una session para el usuario!
        req.session.usuario = usuario

        //Tambien creo token (No debería convivir con sessions, si se rompe borrar y tambien en la .res el token)
        let token = jwt.sign(usuario, SECRET, {expiresIn: 10})// 30segs
        res.cookie("codercookie", token, {httpOnly: true})//Creo cookie desde el servidor


        res.setHeader("Content-Type", "application/json")
        res.status(200).json({ payload: "login correcto", usuario, token })
    }

    // LOGICA PREVIA A LA IMPLEMENTACION DE PASSPORT

    // // web es un input hidden para modificar comportamiento con respecto a una peticion de postman
    // let { email, password, web } = req.body

    // if (!email || !password) {
    //     res.setHeader("Content-Type", "application/json")
    //     return res.status(400).json("Complete el email y la contraseña!")
    // }

    // try {
    //     // let usuario = await usersManager.getBy({ email, password: generateHash(password) }) //Valido email y contraseña (crypto)

    //     //1ra validacion bcrypt, el email
    //     let usuario = await usersManager.getBy({ email }) //Validación con bcrypt, son 2 etapas

    //     if (!usuario) {
    //         res.setHeader("Content-Type", "application/json")
    //         return res.status(400).json("Credenciales inválidas")
    //     }

    //     //2da validacion bcrypt, la password
    //     if (!validaPassword(password, usuario.password)) {
    //         res.setHeader("Content-Type", "application/json")
    //         return res.status(400).json("Credenciales inválidas")
    //     }

    //     //El usuario existe!, ahora si me logeo desde la web lo redirijo al home
    //     if (web) {
    //         //Por seguridad elimino la contraseña para que no se muestre
    //         usuario = { ...usuario }//No se para que hago esto..
    //         delete usuario.password
    //         //IMPORTANTE: Creo una session para el usuario
    //         req.session.usuario = usuario
    //         return res.redirect("/handlebars/")
    //     } else {
    //         //Por seguridad elimino la contraseña para que no se muestre
    //         usuario = { ...usuario }//No se para que hago esto..
    //         delete usuario.password

    //         //IMPORTANTE: Aca creo una session para el usuario!!!
    //         req.session.usuario = usuario

    //         res.setHeader("Content-Type", "application/json")
    //         res.status(200).json({ payload: "login correcto", usuario })
    //     }

    // } catch (error) {
    //     res.setHeader("Content-Type", "application/json")
    //     res.status(500).json("Error en el servidor al logearse")
    // }
})

 
router.get("/github", passport.authenticate("github", {}), (req, res) => {//peticion de login vía github (Github va a preguntarme si autorizo a x programa a tener acceso a mis datos)

})

router.get("/callbackGithub", passport.authenticate("github", {failureRedirect: "/api/sessions/error"}), (req, res) => {//callbackURL github (Si todo sale bien github devuelve los datos a esta ruta)

    //Creo la session
    req.session.usuario = req.user
    
    res.setHeader("Content-Type", "application/json")
    //Aca devuelvo todos los datos
    // res.status(200).json({ payload: req.user})

    //Aca redirecciono al home
    return res.redirect("/handlebars/")
})

router.get("/logout", (req, res) => {//Destruyo la session para el logout
    req.session.destroy((error) => {//Así es la sintaxis de este metodo..
        if (error) {
            console.log(error)
            res.setHeader("Content-Type", "application/json")
            return res.status(500).json("Error en el servidor al querer destruir la session")
        }
    })

    res.setHeader("Content-Type", "text/html")
    return res.redirect("/handlebars/login")
})

//Ruta para probar JWT (Le indico sessions:false para que sepa que no estoy manejando sessiones)
router.get("/current", passport.authenticate("current", {session: false}), (req, res) => {
    res.setHeader("Content-Type", "application/json")
    return res.status(200).json(req.user)

})


