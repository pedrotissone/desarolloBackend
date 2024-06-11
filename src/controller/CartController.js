import { isValidObjectId } from "mongoose"
import { CartManagerMongo as CartManager } from "../dao/CartManagerMongo.js"
import { ProductManagerMongo as ProductManager } from "../dao/ProductManagerMongo.js"
import { cartService } from "../services/CartService.js"
import { productService } from "../services/ProductService.js"


const Carts = new CartManager()
const Producto = new ProductManager()


export class CartController {

    static getCartById = async (req, res) => {
        //                  F I L E   S Y S T E M
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
    
        //                          M O N G O  DB    
        let id = req.params.cid
        if (!isValidObjectId(id)) {
            res.setHeader("Content-Type", "application/json")
            return res.status(400).json({
                message: "Error, el id requerido no tiene un formato valido de MongoDB"
            })
        }
    
        try {
            //CONEXION A MI DAO/MANAGER - Paso a la capa que interactua con mi DB
            // let resultado = await Carts.getCartById(id)
            let resultado = await cartService.getCartById(id)
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
    }


    static createCart = async (req, res) => {
        //                          F I L E   S Y S T E M
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
    
        //                              M O N G O   DB
        try {
            let newCart = {
                products: []
            }
            //CONEXION A MI DAO/MANAGER - Paso a la capa que interactua con mi DB
            // await Carts.createCart(newCart)
            await cartService.createCart(newCart)
            res.setHeader("Content-Type", "application/json")
            return res.status(200).json(newCart)
        } catch (error) {
            res.setHeader("Content-Type", "application/json")
            return res.status(500).json("Error inesperado en el servidor al crear carrito")
        }
    }


    static addToCart = async (req, res) => { // AGREGAR PRODUCTO AL CARRITO (Nuevo o agrega cantidad)
        //                      F I L E   S Y S T E M
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

        //                          M O N G O  DB    
        let cid = req.params.cid
        let pid = req.params.pid
        // console.log(`El pid es: ${pid}`)
    
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
            // carrito = await Carts.getCartById(cid)
            carrito = await cartService.getCartById(cid)
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
            // nuevoProducto = await Producto.getProductsByFiltro({ _id: pid })
            nuevoProducto = await productService.getProductsByFiltro({ _id: pid })
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
    
        try {
            // let resultado = await Carts.addToCart(cid, productos)
            let resultado = await cartService.addToCart(cid, productos)
            res.setHeader("Content-Type", "application/json")
            return res.status(200).json(resultado)    
        } catch (error) {
            res.setHeader("Content-Type", "application/json")
            return res.status(500).json("Error inesperado en el servidor al realizar addToCart()")
        }
    }

    
    static addQuantity = async (req, res) => { //  AUMENTAR CANTIDAD DEL PRODUCTO
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
            // carrito = await Carts.getCartById(cid)
            carrito = await cartService.getCartById(cid)
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
            // let resultado = await Carts.updateQuantity(cid, pid, nuevaCantidad)
            let resultado = await cartService.updateQuantity(cid, pid, nuevaCantidad)
            res.setHeader("Content-Type", "application/json")
            return res.status(200).json(resultado)
    
        } catch (error) {
            res.setHeader("Content-Type", "application/json")
            return res.status(500).json("Error inesperado en el servidor al realizar addToCart()")
        }
    }


    static deleteProductInCart = async (req, res) => {//    ELIMINAR PRODUCTO DEL CARRITO
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
            // carrito = await Carts.getCartById(cid)
            carrito = await cartService.getCartById(cid)
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
        // console.log(productoABuscar)
    
        if (productoABuscar == undefined) {
            res.setHeader("Content-Type", "application/json")
            return res.status(400).json("No existe el producto que se desea eliminar")
    
        } else {
            console.log("Existe el producto, seguimos..")
        }
    
        try {
            // let resultado = await Carts.deleteProductInCart(cid, pid)
            let resultado = await cartService.deleteProductInCart(cid, pid)
            res.setHeader("Content-Type", "application/json")
            return res.status(200).json(resultado)
        } catch (error) {
            res.setHeader("Content-Type", "application/json")
            return res.status(500).json("Error inesperado en el servidor al realizar deleteProductInCart()")
        }
    }


    static clearCart = async (req, res) => {//  ELIMINAR TODOS LOS PRODUCTOS DEL CARRITO
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
            // carrito = await Carts.getCartById(cid)
            carrito = await cartService.getCartById(cid)
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
            // let resultado = await Carts.addToCart(cid, productos)
            let resultado = await cartService.addToCart(cid, productos)
            res.setHeader("Content-Type", "application/json")
            return res.status(200).json(resultado)
    
        } catch (error) {
            res.setHeader("Content-Type", "application/json")
            return res.status(500).json("Error inesperado en el servidor al realizar addToCart()")
        }
    }


}