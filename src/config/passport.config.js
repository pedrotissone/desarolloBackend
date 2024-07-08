import passport from "passport"; //Importo el nucleo (Core)
import local from "passport-local" //Importo la estrategia de autenticación que quiero (Hay como 500)
import github from "passport-github2" //estrategia
import passportJWT from "passport-jwt"// estrategia
import { config } from "./config.js"
import { SECRET, generateHash, validaPassword } from "../utils/utils.js";
import { UsersManagerMongo as UsersManager } from "../dao/UsersManagerMongo.js";//Importo mi manager para crear los usuarios
import { CartManagerMongo as CartManager } from "../dao/CartManagerMongo.js";

//PASSPORT NOS PERMITE ENCAPSULAR TODA NUESTRA LOGICA DE AUTENTICACION DENTRO DE UN SOLO SCRIPT CON UNA ESTRUCTURA DETERMINADA.

const usersManager = new UsersManager()
const cartManager = new CartManager()

const buscaToken = (req) => {
    let token = null
    if (req.cookies["codercookie"]) {
        token = req.cookies["codercookie"]   
    }
    return token    
}

//1er paso de configuracion de passport
export const initPassport = () => {
    //SignUp Local
    passport.use(
        "signUp",//Nombre que le doy a la estrategia
        new local.Strategy(// Instancio la estrategia elegida y la configuro a través de 2 argumentos, 1ro: un objeto donde parametrizo la estrategia, 2do: una async () => que lleva parametros segun la estrategia elegida y en donde va a ir mi logica
            {
                usernameField: "email", //El usernameField va a ser el email en este caso
                passReqToCallback: true
            },
            async (req, username, password, done) => { //Los parametros de la async ()=> van a cambiar segun cada estrategia, aca son estos
                
                try {                    
                    //OJO recordar que el username en mi caso va a ser el email
                    let { nombre, apellido, edad } = req.body

                    //Validacion
                    if (!nombre || !apellido || !edad) { //los return de passport son con su formato de callback "done"                        
                        return done(null, false) //No hay error, pero algo esta mal en la peticion
                    }
                    //CONEXION A MI DAO/MANAGER - Paso a la capa que interactua con mi DB
                    let existe = await usersManager.getBy({ email: username }) //email es el username
                    if (existe) {
                        return done(null, false)// No hay error, pero el email ya fue registrado por otro usuario en la DB
                    }
                    
                    //Creo un carrito para el usuario
                    let nuevoCarrito = await cartManager.createCart()

                    //Hasheo la contraseña antes de subirla a la DB
                    password = generateHash(password)

                    //Creo nuevo usuario y le agrego el campo carrito con su _id
                    let nuevoUsuario = await usersManager.create({ nombre, apellido, edad, email:username, password, rol: "usuario", carrito: nuevoCarrito._id })//Por defecto los usuarios van a tener siempre ese rol
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
            async (username, password, done) => { //passport valida automaticamente si se envió usuario y contraseña
                try {                    
                    //CONEXION A MI DAO/MANAGER - Paso a la capa que interactua con mi DB
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
                clientID: config.CLIENT_ID,
                clientSecret: config.CLIENT_SECRET,
                callbackURL: `http://localhost:${config.PORT}/api/sessions/callbackGithub`
            },
            async (tokenAcceso, tokenRefresh, profile, done) => {
                try {
                    // console.log(profile)//Aca veo los datos que me trae y extraigo los que necesito
                    let email = profile._json.email
                    let nombre = profile._json.name

                    //Si el usuario de github no tiene consfigurado su email en el profile, devuelvo error
                    if(!email) {
                        return done(null, false)
                    }                    

                    //Compruebo si el usuario ya existe o no en mi DB
                    //CONEXION A MI DAO/MANAGER - Paso a la capa que interactua con mi DB
                    let usuario = await usersManager.getBy({email}) //Crear funcion getByPopulate para ver el carrito (after passport 01:39)
                    if(!usuario) {
                        let nuevoCarrito = await cartManager.createCart()
                        
                        usuario = await usersManager.create({
                            nombre, email, profile, carrito: nuevoCarrito._id
                        })
                    }

                    return done(null, usuario) //Devuelvo el usuario que encontre o que cree

                } catch (error) {
                    done(error)                    
                }
            }
        )
    )

    //ESTRATEGIA DE AUTENTICACION CON JSON WEB TOKEN
    passport.use(
        "current",
        new passportJWT.Strategy(
            {
                secretOrKey: SECRET, //Una clave secreta, la tengo en utils.js
                jwtFromRequest: new passportJWT.ExtractJwt.fromExtractors([buscaToken]) //El argumento es una funcion y la tengo definida arriba
            },
            async (usuario, done) => { //Se lo suele llamar usuario xq el token suele tener datos del usuario
                try {                    
                    return done(null, usuario) //contenidoToken será null o la token                    
                } catch (error) {
                    return done(error)                    
                }
            }
        )
    )


    //                            SERIALIZE  DE  SESSIONS (Las deje de usar por JWT)
    //1er paso B), Solo en caso de usar sessiones, debo además configurar la serializacion y deserializacion
    // passport.serializeUser((usuario, done) => {//Esto es para guardar el usuario para la session creo
    //     return done(null, usuario._id)
    // })

    // passport.deserializeUser(async (id, done) => {
    //     let usuario = await usersManager.getBy({ _id: id })
    //     return done(null, usuario) //No hay error y hay un usuario!
    // })
}
