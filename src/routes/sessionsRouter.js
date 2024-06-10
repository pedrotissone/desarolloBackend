import { Router } from "express";
import { SECRET, passportCall } from "../utils/utils.js";
import jwt from "jsonwebtoken";
import passport from "passport";


export const router = Router()

//                                  PASSPORT HACE DE MI CONTROLLER EN ESTE ROUTER
router.get("/error", (req, res) => {
    res.setHeader("Content-Type", "application/json")
    res.status(500).json("Error en la autenticación")
})

// 3er paso de passport, agrego middleware a la ruta y le indico el nombre de la estrategia elegida
router.post("/signUp", passport.authenticate("signUp", { failureRedirect: "/api/sessions/error", session: false }), async (req, res) => { // registro para un nuevo usuario

    //Si sale todo bien passport crea un req.user y nos deja los datos ahi
    res.setHeader("Content-Type", "application/json")
    return res.status(201).json({ nuevoUsuario: req.user })
})

// 3er paso de passport, agrego middleware a la ruta y le indico el nombre de la estrategia elegida
router.post("/login", passport.authenticate("login", { failureRedirect: "/api/sessions/error", session: false }), async (req, res) => { //Me logeo con usuario ya registrado

    let { web } = req.body

    if (web) { //Si sale todo OK en passport, este crea un req.user
        let usuario = { ...req.user } //spread operator
        delete usuario.password

        //Aca creo una session para el usuario
        // req.session.usuario = usuario

        //Tambien creo token (No debería convivir con sessions, si se rompe borrar y tambien en la .res el token)
        let token = jwt.sign(usuario, SECRET, { expiresIn: "1h" })// Creo token
        res.cookie("codercookie", token, { httpOnly: true })//Creo cookie desde el servidor y guardo el token
        
        return res.redirect("/handlebars/")
    } else {
        //Rompo la referencia usando el spread (para que no me elimine la password del usuario de la DB) y le borro la contraseña para no devolverla en la response
        let usuario = { ...req.user }//No es necesario xq es un usuario en memoria no el de la DB
        delete usuario.password

        //creo una session para el usuario!
        // req.session.usuario = usuario

        //Tambien creo token (No debería convivir con sessions, si se rompe borrar y tambien en la .res el token)
        let token = jwt.sign(usuario, SECRET, { expiresIn: "1h" })// Creo token
        res.cookie("codercookie", token, { httpOnly: true })//Creo cookie desde el servidor y guardo el token


        res.setHeader("Content-Type", "application/json")
        res.status(200).json({ payload: "login correcto", usuario, token })
    }
})


router.get("/github", passport.authenticate("github", {}), (req, res) => {//peticion de login vía github (Github va a preguntarme si autorizo a x programa a tener acceso a mis datos)

})

router.get("/callbackGithub", passport.authenticate("github", { failureRedirect: "/api/sessions/error", session: false }), (req, res) => {//callbackURL github (Si todo sale bien github devuelve los datos a esta ruta)

    //Creo la session
    // req.session.usuario = req.user

    // Achico los datos que me devuelve github sino no voy a poder guardarlo como cookie para JWT
    let datosToken = {
        nombre: req.user.nombre,
        email: req.user.email,
        rol: req.user.rol,
        carrito: req.user.carrito
    }   
    //Tambien creo token (No debería convivir con sessions, si se rompe borrar y tambien en la .res el token)
    let token = jwt.sign(datosToken, SECRET, { expiresIn: "1h" })// Creo token y defino que será valido por 1 hora
    res.cookie("codercookie", token, { httpOnly: true})//Creo cookie desde el servidor y guardo el token

    //Aca devuelvo todos los datos
    // res.setHeader("Content-Type", "application/json")
    // res.status(200).json({ payload: req.user})

    //O Aca redirecciono al home!
    return res.redirect("/handlebars/")
})

router.get("/logout", (req, res) => {//Destruyo la session o JWT cookie para el logout
    //Destruyo session
    // req.session.destroy((error) => {
    //     if (error) {
    //         res.setHeader("Content-Type", "application/json")
    //         return res.status(500).json("Error en el servidor al querer destruir la session")
    //     }
    // })

    //Destruyo cookie de JWT
    res.clearCookie("codercookie", { httpOnly: true})

    res.setHeader("Content-Type", "text/html")
    return res.redirect("/handlebars/login")
})

//Ruta para probar JWT (Le indico sessions:false para que sepa que no estoy manejando sessiones)
router.get("/current", passport.authenticate("current", {session: false}), (req, res) => {
    res.setHeader("Content-Type", "application/json")
    return res.status(200).json(req.user)
})


//                                      PASSPORT  CALL (No la voy a usar de momento)
//Ruta para probar current con la funcion de callback de passport para mayor control (Yo la llamé passportCall)
// router.get("/current", passportCall("current"), (req, res) => {
//     res.setHeader("Content-Type", "application/json")
//     return res.status(200).json(req.user)
// })


