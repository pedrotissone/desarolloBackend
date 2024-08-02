import express from "express"
import mongoose from "mongoose"
import sessions from "express-session" //Las sessiones viven en memoria
import FileStore from "session-file-store"//Con esto las sessiones vivian en un archivo local
import MongoStore from "connect-mongo" //Con esto las sessiones viven en mongo
import cluster from "cluster" //Con este modulo nativo puedo escalar horizontalmente mi servidor
import os from "os"// Con este modulo nativo puedo ver la capacidad que tengo para escalar horizontalmente con un cluster
import { config } from "./config/config.js"
import cookieParser from "cookie-parser"
import passport from "passport"
import { initPassport } from "./config/passport.config.js" //importo mi funcion de config de passport
import { Server } from "socket.io"
import { engine } from "express-handlebars"
import {router as productsRouter} from "./routes/productsRouter.js"
import {router as cartsRouter} from "./routes/cartsRouter.js"
import { router as viewsRouter } from "./routes/viewsRouter.js"
import { router as sessionsRouter } from "./routes/sessionsRouter.js"
import {router as usersRouter} from "./routes/usersRouter.js"
import { errorHandler } from "./middlewares/errorHandler.js"
import { middLogger } from "./middlewares/middLogger.js"
import { chatModel } from "./dao/models/chatModel.js"
import { logger, verifyJWT } from "./utils/utils.js"
import cors from "cors"
import compression from "express-compression"
import swaggerJSDoc from "swagger-jsdoc"
import swaggerUi from "swagger-ui-express"


const PORT = config.PORT
const app = express()

// console.log(os.cpus())
// console.log("Cantidad de procesadores o nucleos: "+ os.cpus().length)

//                EN  PRODUCCION  EL  PUERTO  ES  EL  3000!!!!!!!!

//Coneccíon a la base de datos (indicar URL y el nombre de la DB)
const conectionDB = async () => {
    try {
        await mongoose.connect(config.MONGO_URL, {dbName: config.DB_NAME}
    )
    logger.debug("DB online..")
    console.log(config.DB_NAME)
        
    } catch (error) {
        logger.debug("Error al conectar a la DB")        
    }
}
conectionDB()

//Estas 2 líneas son para que nuestro servidor interprete automaticamente msjes tipo JSON (CLAVE, son middlewares)
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
//Esta linea es mi middleware logger, lo agrego a la req para poder llamarlo cuando quiera
app.use(middLogger)
//Esta linea es para comprimir en gzip el contenido de la response que no este comprimido previamente (jpg es un formato que ya viene comprimido)
app.use(compression({}))//Falta parametrizar con brotli
//Esta línea permite la realizacion de peticiones cruzadas a nuestra aplicación, desde cualquier origen, con eso podemos trabajar con un front externo como React (Acceder de un dominio diferente al de tu servidor)
app.use(cors())

//Estas 3 lineas son para configurar handlebars
app.engine("handlebars", engine())
app.set("view engine", "handlebars")
app.set("views", "./src/views")

//Esta linea me permite mostrar TODO lo que haya dentro de la carpeta public, indicando DIRECTAMENTE en el navegador la ruta correspondiente a cada archivo desde public
app.use(express.static("./src/public"))

//Esta dependencia es un middleware que me maneja las cookies, también se puede hacer sin dependencia por headers
app.use(cookieParser("coderCoder"))

//Utilizo la dependencia express-sessions, para obtener UNA session por cada usuario que se conecte al servidor (lo realiza a traves de una cookie de session)
// app.use(sessions({ //le paso un objeto de configuracion como argumento
//     secret: config.SECRET_SESSION,
//     resave: true,
//     saveUninitialized: true,
//     //Configuracion del FileStore para las sessiones (lo cambié por mongo)
//     // store: new fileStore({
//     //     ttl: 3600, retries: 0,
//     //     path: "./src/sessions"
//     // })
//     store: MongoStore.create({
//         ttl: 3600,
//         mongoUrl: "mongodb+srv://pedrotissone:2ennu3dL@codercluster.bk90trh.mongodb.net/?retryWrites=true&w=majority&appName=coderCluster&dbName=ecommerce"
//     })
// }))

//2do paso de configuracion de passport (Siempre debajo de sessiones y antes de las rutas)
initPassport()
app.use(passport.initialize())
//Con este middleware paso a las rutas siempre un req.user en caso de existir token valido
app.use(verifyJWT)
// app.use(passport.session()) //1er paso B)(Solo si uso sessiones y tiene que ir debajo del middleware de sessions, sino esta linea no va)


//Configuración de Swagger
const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "productos",
            version: "1.0.0",
            description: "documentacion products"
        },
        info: {
            title: "carrito",
            version: "1.0.0",
            description: "documentacion carrito"
        },
    },
    apis: ["./src/docs/*.yaml"]
}

const specification = swaggerJSDoc(options)
//Uso middleware para mostrar la documentación
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specification))


//                                          RUTAS CON ROUTER
app.use("/", viewsRouter) //Truco para que el home sea mi archivo de handlebars
app.use("/api/products", productsRouter)
app.use("/api/carts", cartsRouter)
app.use("/handlebars", viewsRouter)
app.use("/api/sessions", sessionsRouter)
app.use("/api/users", usersRouter)
//                                          RUTAS CON ROUTER



                             
//Comodín: Si la peticion no coincide con ninguna ruta especificada se ejecuta (Va siempre al final)
app.get("*", (req, res) => {
    res.setHeader("Content-Type", "application/json")
    res.status(404).json({
        message: "Error 404 - page not found!"
    })
})

                  
//Middleware para menjar errores a nivel aplicación, se escribe al final de todas las rutas para captar toda la aplicación, de esta forma le das un formato diferente el manejador de errores que tiene por defecto Express
app.use(errorHandler)

let usuarios = []
let mensajes = []

const serverHTTP = app.listen(PORT, () => logger.debug(`Servidor escuchando en el puerto ${PORT}`))

//                                                    W E B  S O C K E T
const io = new Server(serverHTTP)


io.on("connection", (socket) => { //2) Va a estar esuchando si llega una conexion
    logger.debug(`Se conecto al servidor el cliente ${socket.id}`)
//                          L O G I C A  D E L  C H A T
    socket.on("id", async (nombre) => {
        //configuro los usuarios como un objeto y los pusheo a un array
        // usuarios.push({id: socket.id, nombre})
        //Envio al usuario que se conectó los mensajes existentes en MEMORIA!!!
        // socket.emit("mensajesPrevios", mensajes)

        //Envio al usuario que se conectó los mensajes existentes en MONGODB!!!
        let mensajesEnMongo = await chatModel.find()
        socket.emit("mensajesPrevios", mensajesEnMongo)
        //Envio a todos los demás clientes notificación de conexion de nuevo usuario
        socket.broadcast.emit("nuevoUsuario", nombre)
    })

    socket.on("mensaje", async (nombre, mensaje) => {
        //configuro los mensajes como objeto y los pusheo a un array
        // mensajes.push({user: nombre, message: mensaje})

        //Creo documento en MongoDB!!!!
       await chatModel.create({user: nombre, message: mensaje})
        //Reenvío a todos los clientes con io.emit
        io.emit("nuevoMensaje", nombre, mensaje)
    })

    socket.on("disconnect", ()=> {//El evento "disconnect" lo detecta directamente la librería, es como el "connection"
        let usuario = usuarios.find(u => u.id == socket.id)
        if (usuario) {
            io.emit("saleUsuario", usuario.nombre)
        }
    })   
})

export {io}

//01:40:30
//NOTAS:
//CUSTOM ROUTER: VER CLASE 24 SEGUNDA PRACTICA INTEGRADORA
//DESARROLLO SERVER COMPLETO EN CAPAS 01:00:00

//CONFIGURACION DE MULTER PARA ENVIO DE EMAIL!!! 01:37:00



