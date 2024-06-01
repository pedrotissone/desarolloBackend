import express from "express"
import mongoose from "mongoose"
import { config } from "./config/config.js"
import cookieParser from "cookie-parser"
import sessions from "express-session" //Las sessiones viven en memoria
import FileStore from "session-file-store"//Con esto las sessiones vivian en un archivo local
import MongoStore from "connect-mongo" //Con esto las sessiones viven en mongo
import passport from "passport"
import { initPassport } from "./config/passport.config.js" //importo mi funcion de config de passport
import { Server } from "socket.io"
import { engine } from "express-handlebars"
import {router as productsRouter} from "./routes/productsRoutes.js"
import {router as cartsRouter} from "./routes/cartsRoutes.js"
import { router as viewsRouter } from "./routes/viewsRouter.js"
import { router as sessionsRouter } from "./routes/sessionsRouter.js"
import { errorHandler } from "./middlewares/errorHandler.js"
import { chatModel } from "./dao/models/chatModel.js"


const PORT = config.PORT
const app = express()

//Coneccíon a la base de datos (indicar URL y el nombre de la DB)
const conectionDB = async () => {
    try {
        await mongoose.connect(config.MONGO_URL, {dbName: config.DB_NAME}
    )
    console.log("DB online..")
        
    } catch (error) {
        console.log("Error al conectar a la DB")        
    }
}
conectionDB()

//Estas 2 líneas son para que nuestro servidor interprete automaticamente msjes tipo JSON (CLAVE, son middlewares)
app.use(express.json())
app.use(express.urlencoded({ extended: true }));

//Estas 3 lineas son para configurar handlebars
app.engine("handlebars", engine())
app.set("view engine", "handlebars")
app.set("views", "./src/views")

//Esta linea me permite mostrar TODO lo que haya dentro de la carpeta public, indicando DIRECTAMENTE en el navegador la ruta correspondiente a cada archivo desde public
app.use(express.static("./src/public"))

//Esta dependencia es un middleware que me maneja las cookies, también se puede hacer sin dependencia por headers
app.use(cookieParser("coderCoder"))

//Utilizo la dependencia express-sessions, para obtener UNA session por cada usuario que se conecte al servidor (lo realiza a traves de una cookie de session)
app.use(sessions({ //le paso un objeto de configuracion como argumento
    secret: "coderCoder",
    resave: true,
    saveUninitialized: true,
    //Configuracion del FileStore para las sessiones (lo cambié por mongo)
    // store: new fileStore({
    //     ttl: 3600, retries: 0,
    //     path: "./src/sessions"
    // })
    store: MongoStore.create({
        ttl: 3600,
        mongoUrl: "mongodb+srv://pedrotissone:2ennu3dL@codercluster.bk90trh.mongodb.net/?retryWrites=true&w=majority&appName=coderCluster&dbName=ecommerce"
    })
}))
//2do paso de configuracion de passport (Siempre debajo de sessiones y antes de las rutas)
initPassport()
app.use(passport.initialize())
app.use(passport.session()) //1er paso B)(Solo si uso sessiones y tiene que ir debajo del middleware de sessions, sino esta linea no va)

//                                          RUTAS CON ROUTER
app.use("/", viewsRouter) //Truco para que el home sea mi archivo de handlebars
app.use("/api/products", productsRouter)
app.use("/api/carts", cartsRouter)
app.use("/handlebars", viewsRouter)
app.use("/api/sessions", sessionsRouter)

//                                          RUTAS CON ROUTER



                             
//Comodín: Si la peticion no coincide con ninguna ruta especificada se ejecuta (Va siempre al final)
app.get("*", (req, res) => {
    res.setHeader("Content-Type", "application/json")
    res.status(404).json({
        message: "Error 404 - page not found!"
    })
})

                  
//Middleware para menjar errores a nivel aplicación, se escribe al final de todo para captar toda la aplicación, de esta forma le das un formato diferente el manejador de errores que tiene por defecto Express
app.use(errorHandler)

let usuarios = []
let mensajes = []

const serverHTTP = app.listen(PORT, () => console.log(`Servidor escuchando en el puerto ${PORT}`))
//                                                    W E B  S O C K E T
const io = new Server(serverHTTP)


io.on("connection", (socket) => { //2) Va a estar esuchando si llega una conexion
    console.log(`Se conecto al servidor el cliente ${socket.id}`)
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

//01:52:00

//NOTAS:
//Variables de entorno: estan configuradas en el OS y uno puede acceder a ellas atraves de una aplicacion
//CUSTOM ROUTER: VER CLASE 24 SEGUNDA PRACTICA INTEGRADORA

