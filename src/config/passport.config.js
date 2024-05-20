import passport from "passport"; //Importo el nucleo (Core)
import local from "passport-local" //Importo la estrategia de autenticación que quiero (Hay como 500)
import github from "passport-github2"
import { UsersManagerMongo as UsersManager } from "../dao/UsersManagerMongo.js";//Importo mi manager para crear los usuarios
import { generateHash, validaPassword } from "../../utils.js";

//PASSPORT NOS PERMITE ENCAPSULAR TODA NUESTRA LOGICA DE AUTENTICACION DENTRO DE UN SOLO SCRIPT CON UNA ESTRUCTURA DETERMINADA.


const usersManager = new UsersManager()

//1er paso de configuracion de passport
export const initPassport = () => {
    //SignUp Local
    passport.use(
        "signUp",//Nombre que le doy a la estrategia
        new local.Strategy(// Instancio la estrategia elegida y la configuro a través de 2 argumentos, 1ro: un objeto donde configuro la estrategia, 2do: una async () => que lleva parametros segun la estrategia elegida y en donde va a ir mi logica
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
                    let nuevoUsuario = await usersManager.create({ nombre, email: username, password, rol: "usuario" })//Por defecto los usuarios van a tener siempre ese rol
                    return done(null, nuevoUsuario) //No hay error y se creo correctamente el usuario

                } catch (error) {
                    return done(error)

                }
            }
        )
    )

    //Login Local
    passport.use(
        "login", //Nombre que le doy a la estrategia
        new local.Strategy(
            {
                usernameField: "email"
            },
            async (username, password, done) => {
                try {
                    let usuario = await usersManager.getBy({ email: username })

                    if (!usuario) {
                        return done(null, false)
                    }

                    //2da validacion bcrypt, la password
                    if (!validaPassword(password, usuario.password)) {
                      return done(null,false)
                    }

                    return done(null, usuario)

                } catch (error) {
                    return done(error)
                }
            }
        )
    )

    //Login Github
    passport.use(
        "github",
        new github.Strategy(
            {
                clientID: "",
                clientSecret: "",
                callbackURL: "http://localhost:8080/api/sessions/callbackGithub"
            },
            async (tokenAcceso, tokenRefresh, profile, done) => {
                try {
                    // console.log(profile)//Aca veo los datos que me trae y extraigo los que necesito
                    let email = profile._json.email
                    let nombre = profile._json.name
                    //Compruebo si el usuario ya existe o no en mi DB
                    let usuario = await usersManager.getBy({email})
                    if(!usuario) {
                        usuario = await usersManager.create({
                            nombre, email, profile
                        })
                    }

                    return done(null, usuario) //Devuelvo el usuario que encontre o que cree

                } catch (error) {
                    done(error)                    
                }
            }
        )
    )


    //1er paso B), Solo en caso de usar sessiones, debo además configurar la serializacion y deserializacion
    passport.serializeUser((usuario, done) => {//Esto es para guardar el usuario para la session creo
        return done(null, usuario._id)
    })

    passport.deserializeUser(async (id, done) => {
        let usuario = await usersManager.getBy({ _id: id })
        return done(null, usuario) //No hay error y hay un usuario!
    })
}
