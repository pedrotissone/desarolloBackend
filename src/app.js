import express from "express"
import { Server } from "socket.io"
import { engine } from "express-handlebars"
import {router as productsRouter} from "./routes/productsRoutes.js"
import {router as cartsRouter} from "./routes/cartsRoutes.js"
import { router as viewsRouter } from "./routes/viewsRouter.js"
import { middleware1, middleware2, middleware3 } from "./middlewares/generales.js"
import { errorHandler } from "./middlewares/errorHandler.js"


const PORT = 8080
const app = express()

let serverSocket

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


const serverHTTP = app.listen(PORT, () => console.log(`Servidor escuchando en el puerto ${PORT}`))

serverSocket = new Server(serverHTTP)

serverSocket.on("connection", (socket) => { //2) Va a estar esuchando si llega una conexion
    // console.log(`Se conecto un cliente con id ${socket.id}`)

    // socket.emit("saludo", `Hola che como te llamas?`)

    // socket.on("nombre", (nombre) => {
    //     `El cliente ${socket.id} se identifico como ${nombre}`
    //     socket.emit("saludoPersonalizado", nombre)
    //     socket.broadcast.emit("nuevoUsuario", nombre)
    // })

    // socket.on("nuevoMensaje", (nombre, mensaje) => {
    //     serverSocket.emit("publicarMensaje", nombre, mensaje)
    // })
    console.log(`Se conecto al servidor el cliente ${socket.id} `)
})

export {serverSocket}

//codigo del chat del lado del cliente
// let nombre = prompt("ingrese su nombre")
// document.title = nombre

// socket.on("saludo", (saludo) => {
//     console.log(saludo)    

//     if (nombre) {
//     socket.emit("nombre", nombre)

//     socket.on("saludoPersonalizado", (nombre) => {
//     console.log(`${nombre} bienvenido al servidor!`)
// })
//     }
// })

// const enviarMensaje = (mensaje) => {
//     socket.emit("nuevoMensaje", nombre, mensaje)
// }

// socket.on("publicarMensaje", (nombre, mensaje) => {
//     console.log(`${nombre} dice: ${mensaje}}`)
// })

// socket.on("nuevoUsuario", (nombre) => {
//     console.log(`${nombre} se ha unido al servidor`)

// })

//01:56:56
