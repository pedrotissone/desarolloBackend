import { Router } from "express"
import { auth } from "../middlewares/auth.js"
import { CartController } from "../controller/CartController.js"


const router = Router()

router.get("/:cid", CartController.getCartById)

router.post("/", auth(["admin"]), CartController.createCart)

router.post("/:cid/products/:pid", auth(["usuario", "premium"]), CartController.addToCart)

router.put("/:cid/products/:pid", auth(["usuario", "premium"]), CartController.addQuantity)

router.delete("/:cid/products/:pid", auth(["admin", "usuario", "premium"]), CartController.deleteProductInCart)

router.delete("/:cid", auth(["admin", "usuario", "premium"]), CartController.clearCart)

router.post("/:cid/purchase", auth(["usuario", "premium"]), CartController.purchase) //Será eliminado al incorporar medios de pago

router.get("/:cid/obtenerDatosDeCompra", auth(["usuario", "premium"]), CartController.getObtenerDatosDeCompra)

router.post("/create-payment-intent", auth(["usuario", "premium"]), CartController.getCreatePaymentIntent)







// router.put("/:cid", auth(["admin", "usuario"]), async (req, res) => {// SOLO AGREGABA PRODUCTOS NUEVOS AL CARRITO
//     let cid = req.params.cid    
//     if (!isValidObjectId(cid)) {
//         res.setHeader("Content-Type", "application/json")
//         return res.status(400).json({
//             message: "Error, el id requerido no tiene un formato valido de MongoDB"
//         })
//     }
//     //1) Busco el carrito a actualizar
//     let carrito
//     let productos

//     try {
//         carrito = await Carts.getCartById(cid)
//         if (carrito) {
//             productos = carrito.productos
//             console.log(carrito)

//         } else {
//             res.setHeader("Content-Type", "application/json")
//             return res.status(400).json("El id proporcionado no existe en ningun carrito")
//         }    
//     } catch (error) {
//         res.setHeader("Content-Type", "application/json")
//         return res.status(500).json("Error inesperado en el servidor al buscar carrito por id")
//     }

//     let nuevoProducto = req.body        
//     // console.log(nuevoProducto.producto)

//     // Valido que el ID del Nuevo producto no se encuentre repetido en mi carrito
//     let busqueda = productos.find(elem => elem.producto._id.toString() == nuevoProducto.producto)
    

//     if (busqueda == undefined) {
//         productos.push(nuevoProducto)
//         // console.log("Se agrego producto")
//     } else {
//         res.setHeader("Content-Type", "application/json")
//         return res.status(400).json("No se puede agregar el producto porque ya esta agregado al carrito")
//     }

//     try {
//         let resultado = await Carts.addToCart(cid, productos)
//         res.setHeader("Content-Type", "application/json")
//         return res.status(200).json(resultado)

//     } catch (error) {
//         res.setHeader("Content-Type", "application/json")
//         return res.status(500).json("Error inesperado en el servidor al realizar addToCart()")
//     }
// })

export { router }
