import express from "express"
import mongoose from "mongoose"
import { Server } from "socket.io"
import { engine } from "express-handlebars"
import {router as productsRouter} from "./routes/productsRoutes.js"
import {router as cartsRouter} from "./routes/cartsRoutes.js"
import { router as viewsRouter } from "./routes/viewsRouter.js"
import { middleware1, middleware2, middleware3 } from "./middlewares/generales.js"
import { errorHandler } from "./middlewares/errorHandler.js"
import { chatModel } from "./dao/models/chatModel.js"


const PORT = 8080
const app = express()

//Coneccíon a la base de datos (indicar URL y el nombre de la DB)
const conectionDB = async () => {
    try {
        await mongoose.connect("mongodb+srv://pedrotissone:2ennu3dL@codercluster.bk90trh.mongodb.net/?retryWrites=true&w=majority&appName=coderCluster",
        {
            dbName: "ecommerce"
        }
    )
    console.log("DB online..")
        
    } catch (error) {
        console.log("Error al conectar a la DB")        
    }
}
conectionDB()

//let serverSocket //Primero Lo declaré aca arriba por si tenia que pasarlo como middleware a un router, pero no fue necesario

//Estas 2 líneas son para que nuestro servidor interprete automaticamente msjes tipo JSON (CLAVE, son middlewares)
app.use(express.json())
app.use(express.urlencoded({ extended: true }));

//Estas 3 lineas son para configurar handlebars
app.engine("handlebars", engine())
app.set("view engine", "handlebars")
app.set("views", "./src/views")

 //Esta linea me permite mostrar TODO lo que haya dentro de la carpeta public, indicando DIRECTAMENTE en el navegador la ruta correspondiente a cada archivo desde public
app.use(express.static("./src/public"))

//Esta linea es un ejemplo de middleware a nivel aplicacion. Se ejecutan en cascada y sirven para manipular la request, formatearla y/o realizar validaciones antes de llegar al endpoint
// app.use(middleware1, middleware2, middleware3) //Middlewares a nivel aplicación



//                                          RUTAS CON ROUTER
app.use("/api/products", productsRouter)
app.use("/api/carts", cartsRouter)
app.use("/handlebars", viewsRouter)
//                                          RUTAS CON ROUTER



                             
//Comodín: Si la peticion no coincide con ninguna ruta especificada se ejecuta.
app.get("*", (req, res) => {
    res.setHeader("Content-Type", "application/json")
    res.status(404).json({
        message: "Error 404 - page not found"
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

//01:13:00