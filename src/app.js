import express from "express"
import {router as productsRouter} from "./routes/productsRoutes.js"
import {router as cartsRouter} from "./routes/cartsRoutes.js"
import { middleware1, middleware2, middleware3 } from "./middlewares/generales.js"
import { errorHandler } from "./middlewares/errorHandler.js"

const PORT = 8080

const app = express()

//Las 2 primeras líneas son para que nuestro servidor interprete automaticamente msjes tipo JSON (CLAVE, son middlewares)
app.use(express.json())
app.use(express.urlencoded({ extended: true }));

//                                  CONTENIDO ESTATICO
app.use(express.static("./src/public")) //Puedo mostrar TODO lo que haya dentro de la carpeta public, indicando DIRECTAMENTE en el navegador la ruta correspondiente a cada archivo desde public.

//                                      MIDDLEWARES (Se ejecutan en cascada) Sirven apra manipular request formatearla y realizar validaciones antes de llegar al endpoint
// app.use(middleware1, middleware2, middleware3) //Middlewares a nivel aplicación





//                                          RUTAS CON ROUTER
app.use("/api/products", productsRouter)
app.use("/api/carts", cartsRouter)
//                                          RUTAS CON ROUTER




//                                  C O M O D I N (Si la peticion no coincide con ninguna ruta especificada se ejecuta)
app.get("*", (req, res) => {
    res.setHeader("Content-Type", "application/json")
    res.status(404).json({
        message: "Error 404 - page not found"
    })
})


//                      MIDDLEWARE PARA MANEJAR ERRORES A NIVEL APLICACION 
//  (Va al final para captar toda la aplicación, de esta forma le das un formato diferente el manejador de errores que tiene por defecto Express)
app.use(errorHandler)


const server = app.listen(PORT, () => console.log(`Servidor escuchando en el puerto ${PORT}`))
