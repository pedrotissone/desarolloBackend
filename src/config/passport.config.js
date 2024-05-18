import passport from "passport"; //Importo el nucleo (Core)
import local from "passport-local" //Importo la estrategia de autenticación
import { UsersManagerMongo as UsersManager } from "../dao/UsersManagerMongo.js";
import { generateHash } from "../../utils.js";


const usersManager = new UsersManager()

//1er paso de configuracion de passport
export const initPassport = () => {
    passport.use(
        "signUp",//Nombre que le doy a la estrategia
        new local.Strategy(// config de la estrategia elegida a través de 2 argumentos, 1ro: parametros de la estrategia, 2do: una async () => en donde va mi logica
            {
                usernameField: "email", //El usernameField va a ser el email en este caso
                passReqToCallback: true
            },
            async (req, username, password, done) => { //Los parametros de la async ()=> van a cambiar segun cada estrategia, aca son estos
                try { //Aca va nuestra logica del sign up

                    //OJO recordar que el username en mi caso va a ser el email!!!
                    let { nombre } = req.body

                    if (!nombre) { //los return de passport son con su formato de callback "done"
                        return done(null, false) //No hay error, pero algo esta mal en la peticion
                    }

                    let existe = await usersManager.getBy({ email: username }) //email es el username
                    if (existe) {
                        return done(null, false)// No hay error, pero tampoco el usuario requerido
                    }

                    //Hasheo la contraseña antes de subirla a la DB
                    password = generateHash(password)

                    //Recordar que el valor de email lo tengo en username
                    let nuevoUsuario = await usersManager.create({ nombre, email:username, password, rol: "usuario" })//Por defecto los usuarios van a tener siempre ese rol
                    return done(null, nuevoUsuario) //No hay error y se creo correctamente el usuario

                } catch (error) {
                    return done(error)

                }
            }
        )
    )

    //1er paso B), Solo en caso de usar sessiones, debo además configurar la serializacion y deserializacion
    passport.serializeUser( (usuario, done) => {//Esto es para guardar el usuario para la session creo
        return done(null, usuario._id)
    })

    passport.deserializeUser( async (id, done) => {
        let usuario = await usersManager.getBy({_id: id})
        return done(null, usuario) //No hay error y hay un usuario!
    })
}
