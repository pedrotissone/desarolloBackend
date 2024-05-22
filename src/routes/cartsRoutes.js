import { Router } from "express"
// import CartManager from "../dao/CartManager.js" //Me traigo mi clase que tiene todas las funciones para manejar el carrito
import { CartManagerMongo as CartManager } from "../dao/CartManagerMongo.js"
import { ProductManagerMongo as ProductManager } from "../dao/ProductManagerMongo.js"
import { isValidObjectId } from "mongoose"
import { middleware3 } from "../middlewares/generales.js"
import { auth } from "../middlewares/auth.js"


const Carts = new CartManager() //Instancio mi clase
const Producto = new ProductManager()

const router = Router()

//Middleware en linea a nivel router. No es recomendable usarlo así, se ejecuta para todas las rutas del router
// router.use((req, res, next) => {
//     console.log("Soy un middleware en linea a nivel router") 
//     next()
// })


//Middleware a nivel endpoint
router.get("/:cid", middleware3, async (req, res) => {//    BUSCAR CARRITO POR ID
    //     try {
    //             await Carts.getCarts()


    //         let id = parseInt(req.params.cid)
    //         let carrito = await Carts.getCartById(id)
    //         if(carrito != undefined) {
    //             res.setHeader("Content-Type", "application/json")
    //             return res.status(200).json(carrito)
    //         } else {
    //             res.setHeader("Content-Type", "application/json")
    //             return res.status(400).json("El id proporcionado no existe en ningun carrito")
    //         }

    //     } catch (error) {
    //         res.setHeader("Content-Type", "application/json")
    //         return res.status(500).json("Error inesperado en el servidor")                        
    //     }
    // })

    //                      G E T   C A R T   B Y   I D   M O N G O

    let id = req.params.cid
    if (!isValidObjectId(id)) {
        res.setHeader("Content-Type", "application/json")
        return res.status(400).json({
            message: "Error, el id requerido no tiene un formato valido de MongoDB"
        })
    }

    try {
        let resultado = await Carts.getCartById(id)
        if (resultado) {
            res.setHeader("Content-Type", "application/json")
            return res.status(200).json(resultado)
        } else {
            res.setHeader("Content-Type", "application/json")
            return res.status(400).json("El id proporcionado no existe en ningun carrito")
        }

    } catch (error) {
        res.setHeader("Content-Type", "application/json")
        return res.status(500).json("Error inesperado en el servidor al buscar el carrito")
    }

})

router.post("/", async (req, res) => {//    CREAR NUEVO CARRITO

    //     try {
    //         await Carts.getCarts() //Primero me traigo a memoria los carritos de mi DB


    //         let nuevoCarrito = await Carts.createCart()
    //         res.setHeader("Content-Type", "application/json")
    //         return res.json(nuevoCarrito)   

    //     } catch (error) {
    //         res.setHeader("Content-Type", "application/json")
    //         return res.status(500).json("Error inesperado en el servidor")          
    //     }
    // })

    //                   C R E A T E   C A R T   B Y   M O N G O
    try {
        let newCart = {
            products: []
        }
        await Carts.createCart(newCart)
        res.setHeader("Content-Type", "application/json")
        return res.status(200).json(newCart)
    } catch (error) {
        res.setHeader("Content-Type", "application/json")
        return res.status(500).json("Error inesperado en el servidor al crear carrito")
    }
})



router.put("/:cid", async (req, res) => {//     AGREGAR PRODUCTO AL CARRITO
    let cid = req.params.cid

    if (!isValidObjectId(cid)) {
        res.setHeader("Content-Type", "application/json")
        return res.status(400).json({
            message: "Error, el id requerido no tiene un formato valido de MongoDB"
        })
    }
    //1) Busco el carrito a actualizar
    let carrito
    let productos

    try {
        carrito = await Carts.getCartById(cid)
        if (carrito) {
            productos = carrito.productos
            console.log(carrito)

        } else {
            res.setHeader("Content-Type", "application/json")
            return res.status(400).json("El id proporcionado no existe en ningun carrito")
        }

    } catch (error) {
        res.setHeader("Content-Type", "application/json")
        return res.status(500).json("Error inesperado en el servidor al buscar carrito por id")
    }

    let nuevoProducto = req.body
    // console.log(productos[0].producto._id.toString() == nuevoProducto.producto )
    console.log(nuevoProducto.producto)

    // Valido que el ID del Nuevo producto no se encuentre repetido en mi carrito
    let busqueda = productos.find(elem => elem.producto._id.toString() == nuevoProducto.producto)
    // console.log(busqueda)

    if (busqueda == undefined) {
        productos.push(nuevoProducto)
        console.log("Se agrego producto")
    } else {
        res.setHeader("Content-Type", "application/json")
        return res.status(400).json("No se puede agregar el producto porque ya esta agregado al carrito")
    }

    try {
        let resultado = await Carts.addToCart(cid, productos)
        res.setHeader("Content-Type", "application/json")
        return res.status(200).json(resultado)

    } catch (error) {
        res.setHeader("Content-Type", "application/json")
        return res.status(500).json("Error inesperado en el servidor al realizar addToCart()")
    }
})

router.put("/:cid/products/:pid", async (req, res) => { //  MODIFICAR CANTIDAD DEL PRODUCTO
    let cid = req.params.cid
    let pid = req.params.pid

    if (!isValidObjectId(cid)) {
        res.setHeader("Content-Type", "application/json")
        return res.status(400).json({
            message: "Error, el id requerido no tiene un formato valido de MongoDB"
        })
    }
    //1) Busco el carrito a actualizar
    let carrito
    let productos

    try {
        carrito = await Carts.getCartById(cid)
        if (carrito) {
            productos = carrito.productos
            // console.log(productos)

        } else {
            res.setHeader("Content-Type", "application/json")
            return res.status(400).json("El id proporcionado no existe en ningun carrito")
        }

    } catch (error) {
        res.setHeader("Content-Type", "application/json")
        return res.status(500).json("Error inesperado en el servidor al buscar carrito por id")
    }

    let cantidadASumar = req.body
    // console.log(cantidadASumar.cantidad)
    // console.log(Number.isInteger(cantidadASumar.cantidad))
    if (Number.isInteger(cantidadASumar.cantidad)) {
        console.log("perfecto, la cantidad es numerica y entera")
    } else {
        res.setHeader("Content-Type", "application/json")
        return res.status(400).json("La cantidad que desea agregarle al producto no es numerica o no es un entero")

    }

    // //Valido que exista el producto a la que voy a sumarla la cantidad
    let productoABuscar = productos.find(elem => elem.producto._id.toString() == pid)
    // console.log(productoABuscar)

    if (productoABuscar == undefined) {
        res.setHeader("Content-Type", "application/json")
        return res.status(400).json("No se puede actualizar la cantidad porque el producto no existe en el carrito")

    } else {
        console.log("Existe el producto, seguimos..")
    }
    // console.log(productoABuscar.quantity)
    let nuevaCantidad = cantidadASumar.cantidad + productoABuscar.quantity
    // console.log(nuevaCantidad)



    try {
        let resultado = await Carts.updateQuantity(cid, pid, nuevaCantidad)
        res.setHeader("Content-Type", "application/json")
        return res.status(200).json(resultado)

    } catch (error) {
        res.setHeader("Content-Type", "application/json")
        return res.status(500).json("Error inesperado en el servidor al realizar addToCart()")
    }
})

router.delete("/:cid/products/:pid", async (req, res) => {//    ELIMINAR PRODUCTO DEL CARRITO
    let cid = req.params.cid
    let pid = req.params.pid

    if (!isValidObjectId(cid)) {
        res.setHeader("Content-Type", "application/json")
        return res.status(400).json({
            message: "Error, el id requerido no tiene un formato valido de MongoDB"
        })
    }

    let carrito
    let productos

    try {
        carrito = await Carts.getCartById(cid)
        if (carrito) {
            productos = carrito.productos
            // console.log(productos)

        } else {
            res.setHeader("Content-Type", "application/json")
            return res.status(400).json("El id proporcionado no existe en ningun carrito")
        }

    } catch (error) {
        res.setHeader("Content-Type", "application/json")
        return res.status(500).json("Error inesperado en el servidor al buscar carrito por id")
    }

    let productoABuscar = productos.find(elem => elem.producto._id.toString() == pid)
    console.log(productoABuscar)

    if (productoABuscar == undefined) {
        res.setHeader("Content-Type", "application/json")
        return res.status(400).json("No existe el producto que se desea eliminar")

    } else {
        console.log("Existe el producto, seguimos..")
    }

    try {
        let resultado = await Carts.deleteProductInCart(cid, pid)
        res.setHeader("Content-Type", "application/json")
        return res.status(200).json(resultado)
    } catch (error) {
        res.setHeader("Content-Type", "application/json")
        return res.status(500).json("Error inesperado en el servidor al realizar deleteProductInCart()")
    }
})


router.delete("/:cid", async (req, res) => {//  ELIMINAR TODOS LOS PRODUCTOS DEL CARRITO
    let cid = req.params.cid

    if (!isValidObjectId(cid)) {
        res.setHeader("Content-Type", "application/json")
        return res.status(400).json({
            message: "Error, el id requerido no tiene un formato valido de MongoDB"
        })
    }
    //1) Busco el carrito a actualizar
    let carrito
    let productos

    try {
        carrito = await Carts.getCartById(cid)
        if (carrito) {
            productos = carrito.productos
            console.log(productos)

        } else {
            res.setHeader("Content-Type", "application/json")
            return res.status(400).json("El id proporcionado no existe en ningun carrito")
        }

    } catch (error) {
        res.setHeader("Content-Type", "application/json")
        return res.status(500).json("Error inesperado en el servidor al buscar carrito por id")
    }

    productos = []
    console.log(productos)

    try {
        let resultado = await Carts.addToCart(cid, productos)
        res.setHeader("Content-Type", "application/json")
        return res.status(200).json(resultado)

    } catch (error) {
        res.setHeader("Content-Type", "application/json")
        return res.status(500).json("Error inesperado en el servidor al realizar addToCart()")
    }
})





//          OJO A ESTA RUTA NO SE VA A LLEGAR NUNCA PORQUE ES IGUAL A LA DE ARRIBA!!!
router.delete("/:cid", async (req, res) => {//  ELIMINAR CARRITO
    //Valido que el id tenga el formato de Mongodb
    let id = req.params.cid
    if (!isValidObjectId(id)) {
        res.setHeader("Content-Type", "application/json")
        return res.status(400).json({
            message: "Error, el id requerido no tiene un formato valido de MongoDB"
        })
    }

    try {
        let resultado = await Carts.deleteCart(id)
        if (resultado.deletedCount > 0) {
            res.setHeader("Content-Type", "application/json")
            return res.status(200).json(`producto con id: ${id} eliminado`)
        } else {
            res.setHeader("Content-Type", "application/json")
            return res.status(404).json("El id del producto a eliminar no existe")
        }

    } catch (error) {
        res.setHeader("Content-Type", "application/json")
        return res.status(500).json({ error: "Error en el Servidor al querer eliminar el carrito" })
    }
})



router.post("/:cid/products/:pid", auth, async (req, res) => { //     AGREGAR PRODUCTO AL CARRITO HANDLEBAR
    // try {
    //     await Carts.getCarts()

    //     let cid = req.params.cid
    //     let pid = req.params.pid

    //     let carrito = await Carts.getCartById(cid)
    //     if(carrito == undefined) {
    //         res.setHeader("Content-Type", "application/json")
    //         return res.json("No existe el carrito en el que desea agregar productos") 
    //     }

    //     await Carts.addToCart(carrito, pid)         

    //     let dbActualizada = await Carts.getCarts()
    //     res.setHeader("Content-Type", "application/json")
    //     return res.json(dbActualizada) 


    // } catch (error) {
    //     res.setHeader("Content-Type", "application/json")
    //     return res.status(500).json("Error inesperado en el servidor")        
    // }

    // })
    //              P O S T   P R O D U C T O S   B Y   M O N G O


    let cid = req.params.cid
    let pid = req.params.pid
    console.log(`El pid es: ${pid}`)

    if (!isValidObjectId(cid)) {
        res.setHeader("Content-Type", "application/json")
        return res.status(400).json({
            message: "Error, el id requerido no tiene un formato valido de MongoDB"
        })
    }
    //1) Busco el carrito a actualizar
    let carrito
    let nuevoProducto //Producto a agregar
    let productos//Array de productos del carrito
    try {
        carrito = await Carts.getCartById(cid)
        if (carrito) {
            productos = carrito.productos
            console.log("El carrito de abajo existe seguimos...")
            // console.log(JSON.stringify(carrito))
            console.log("lo de abajo es el carrito")
            console.log(carrito)
            // console.log(productos)
        } else {
            res.setHeader("Content-Type", "application/json")
            return res.status(400).json("El id proporcionado no existe en ningun carrito")
        }
        //Valido que el producto exista
        nuevoProducto = await Producto.getProductsByFiltro({ _id: pid })
        if (nuevoProducto) {
            console.log("El producto de abajo existe seguimos...")
            console.log(nuevoProducto)
        } else {
            res.setHeader("Content-Type", "application/json")
            return res.status(400).json("El producto que se desea agregar no existe")
        }

    } catch (error) {
        res.setHeader("Content-Type", "application/json")
        return res.status(500).json("Error inesperado en el servidor al buscar carrito por id")
    }

    //PASO 1
    let elProductoEsNuevo = false
    //Valido que el ID del Nuevo producto no se encuentre repetido en mi carrito
    let busqueda = productos.find(elem => elem.producto._id.toString() == nuevoProducto._id)
    console.log("el resultado de la busqueda es lo de abajo")
    // console.log(busqueda)

    if (busqueda == undefined) {
        console.log("El producto no esta agregado al carrito, lo pusheo")
        productos.push(
            {
                producto: nuevoProducto,
                quantity: 1
            }
        )
        elProductoEsNuevo = true
    } else {
        busqueda.quantity += 1
    }

    // console.log(carrito)

    try {
        let resultado = await Carts.addToCart(cid, productos)
        res.setHeader("Content-Type", "application/json")
        return res.status(200).json(resultado)

    } catch (error) {
        res.setHeader("Content-Type", "application/json")
        return res.status(500).json("Error inesperado en el servidor al realizar addToCart()")
    }
})




export { router }
