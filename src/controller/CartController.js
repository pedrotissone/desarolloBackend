import { isValidObjectId } from "mongoose"
import { CartManagerMongo as CartManager } from "../dao/CartManagerMongo.js"
import { ProductManagerMongo as ProductManager } from "../dao/ProductManagerMongo.js"
import { cartService } from "../services/CartService.js"
import { productService } from "../services/ProductService.js"
import { ticketService } from "../services/TicketService.js"
import { enviarEmail } from "../utils/utils.js"
import stripe from "stripe"
import {MercadoPagoConfig, Preference} from "mercadopago"


const Carts = new CartManager()
const Producto = new ProductManager()

//3) Conectar stripe con mi backend
const stripeInstance = stripe("sk_test_51Pvx99I4zZn1LBXUuIxpriRc80qOGACzSTrXVSYvaOYBGDrNRnAiKdxvCiqcJI4M6orvvDB0SoUiKDOi2ZiwMiNj00sYHtIm04") //Clave Secreta


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
            let resultado = await cartService.createCart(newCart)
            res.setHeader("Content-Type", "application/json")
            return res.status(200).json(resultado)
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
        let userEmail = req.user.email

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
                req.logger.debug(carrito)
                req.logger.debug("lo de abajo son los productos que contiene")
                req.logger.debug(productos)
            } else {
                res.setHeader("Content-Type", "application/json")
                return res.status(400).json("El id proporcionado no existe en ningun carrito")
            }
            //Valido que el producto exista
            // nuevoProducto = await Producto.getProductsByFiltro({ _id: pid })
            nuevoProducto = await productService.getProductsByFiltro({ _id: pid })
            if (nuevoProducto) {
                req.logger.debug("Esto es nuevoProducto: " + nuevoProducto.owner)
                req.logger.debug("Esto es userEmail: " + userEmail)
            } else {
                res.setHeader("Content-Type", "application/json")
                return res.status(400).json("El producto que se desea agregar no existe")
            }
            //Valido que un usuario premium no compre su propio producto
            if (userEmail == nuevoProducto.owner) {
                res.setHeader("Content-Type", "application/json")
                return res.status(400).json("No se puede agregar al carrito un producto del cual se es owner")
            }
        } catch (error) {
            res.setHeader("Content-Type", "application/json")
            return res.status(500).json("Error inesperado en el servidor al querer agregar un producto al carrito")
        }

        //PASO 1
        let elProductoEsNuevo = false
        //Valido que el ID del Nuevo producto no se encuentre repetido en mi carrito
        let busqueda = productos.find(elem => elem.producto._id.toString() == nuevoProducto._id)
        // console.log("el resultado de la busqueda es lo de abajo")
        // console.log(busqueda)

        if (busqueda == undefined) {
            req.logger.debug("El producto no esta agregado al carrito, lo pusheo")
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
            console.log(resultado)
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
            } else {
                res.setHeader("Content-Type", "application/json")
                return res.status(400).json("El id proporcionado no existe en ningun carrito")
            }
        } catch (error) {
            res.setHeader("Content-Type", "application/json")
            return res.status(500).json("Error inesperado en el servidor al buscar carrito por id")
        }

        let cantidadASumar = req.body
        console.log(`Esta es la cantidad a sumar: ${cantidadASumar.cantidad}`)
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
            // console.log("Existe el producto, seguimos..")
        }
        // console.log(productoABuscar.quantity)
        let nuevaCantidad = cantidadASumar.cantidad + productoABuscar.quantity
        console.log(`Esto es la nueva cantidad:  ${nuevaCantidad}`)

        try {
            // let resultado = await Carts.updateQuantity(cid, pid, nuevaCantidad)
            let resultado = await cartService.updateQuantity(cid, pid, nuevaCantidad)
            res.setHeader("Content-Type", "application/json")
            // return res.status(200).json(resultado)
            return res.status(200).json(nuevaCantidad)

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
                // console.log(productos)

            } else {
                res.setHeader("Content-Type", "application/json")
                return res.status(400).json("El id proporcionado no existe en ningun carrito")
            }

        } catch (error) {
            res.setHeader("Content-Type", "application/json")
            return res.status(500).json("Error inesperado en el servidor al buscar carrito por id")
        }

        productos = []
        // console.log(productos)

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

    //EN DESUSO AL INCORPORAR MEDIOS DE PAGO
    static purchase = async (req, res) => {
        let cid = req.params.cid
        let usuario = req.user
        let productosParaFacturar = []
        let productosRestantes = []

        try {
            const cart = await cartService.getCartById(cid)
            //Valido stock
            for (let i = 0; i < cart.productos.length; i++) {
                let product = await productService.getProductsByFiltro(cart.productos[i].producto._id)//Busco producto      
                console.log(product.stock)
                if (cart.productos[i].quantity <= product.stock) {
                    let nuevoStock = { stock: product.stock - cart.productos[i].quantity }//resto y obtengo nueva cantidad                    
                    await productService.updateProduct(cart.productos[i].producto._id, nuevoStock)//Actualizo stock producto
                    productosParaFacturar.push(cart.productos[i]) //pusheo productosFacturables                   
                } else {
                    productosRestantes.push(cart.productos[i]) //pusheo productos no facturables
                }
            }

            if (productosParaFacturar.length == 0) {
                res.setHeader("Content-Type", "application/json")
                return res.status(400).json("No hay stock de ninguno de los productos que desea comprar!")
            }


            //Obtengo total a pagar
            const total = productosParaFacturar.reduce((accumulator, obj) => {
                return parseInt(accumulator + (obj.producto.price * obj.quantity))
            }, 0)
            // console.log(total)

            //Seteo el cart
            let updatedCart = await cartService.addToCart(cart._id, productosRestantes)


            //Confecciono el objeto para crear el ticket
            const datosDeCompra = {
                code: Math.random() * 100000,
                purchase_datetime: Date.now(),
                amount: total,
                purchaser: usuario.email,
                products: productosParaFacturar
            }

            let ticket = await ticketService.createTicket(datosDeCompra)

            //Por último envio correo electrónico

            // Creo la estructura HTML del cuerpo del email
            let productosHTML = datosDeCompra.products.map(obj => {
                return `<li>Producto: ${obj.producto.title}, Cantidad: ${obj.quantity}, Precio: ${obj.producto.price}`
            }).join("")
            let estructuraHTML = `<h2> Detalle de compra </h2>
                                    <ul>${productosHTML}</ul>
                                    <p>Total: ${datosDeCompra.amount}</p>
                                    <p>Comprador: ${datosDeCompra.purchaser}</p>
                                    <p>Compra realizada el ${datosDeCompra.purchase_datetime}</p>`

            let resultado = await enviarEmail(datosDeCompra.purchaser, "Confirmacion de compra", estructuraHTML)

            res.setHeader("Content-Type", "application/json")
            return res.status(201).json(ticket)

        } catch (error) {
            res.setHeader("Content-Type", "application/json")
            return res.status(500).json("Error inesperado en el servidor al procesar la compra")
        }
    }


    static getObtenerDatosDeCompra = async (req, res) => {
        let cid = req.params.cid
        let usuario = req.user
        let productosParaFacturar = []
        let productosRestantes = []

        try {
            const cart = await cartService.getCartById(cid)

            //Valido stock
            for (let i = 0; i < cart.productos.length; i++) {
                let product = await productService.getProductsByFiltro(cart.productos[i].producto._id)//Busco producto

                if (cart.productos[i].quantity <= product.stock) {
                    let nuevoStock = { stock: product.stock - cart.productos[i].quantity }//resto y obtengo nueva cantidad                    
                    // await productService.updateProduct(cart.productos[i].producto._id, nuevoStock)//Actualizo stock producto (Aun no!)
                    productosParaFacturar.push(cart.productos[i]) //pusheo productosFacturables                   
                } else {
                    productosRestantes.push(cart.productos[i]) //pusheo productos no facturables por no haber stock en DB
                }
            }

            //SACO ESTE IF PARA QUE AVANCE AUNQUE TODOS LOS PRODUCTOS SELECCIONADOS NO TENGAN STOCK (ME PIDIERON ESA LOGICA, PERO ES ABSURDO)
            // if (productosParaFacturar.length == 0) {
            //     res.setHeader("Content-Type", "application/json")
            //     return res.status(400).json("No hay stock de ninguno de los productos que desea comprar!")
            // }


            //Obtengo total a pagar
            const total = productosParaFacturar.reduce((accumulator, obj) => {
                return parseInt(accumulator + (obj.producto.price * obj.quantity))
            }, 0)


            //Confecciono el objeto para crear el ticket
            const datosDeProductos = {
                amount: total,
                purchaser: usuario.email,
                products: productosParaFacturar,
                productosRestantes: productosRestantes
            }

            res.setHeader("Content-Type", "appplication/json")
            res.status(200).json(datosDeProductos)

        } catch (error) {
            res.setHeader("Content-Type", "application/json")
            return res.status(500).json("Error inesperado en el servidor al intentar obtener el monto total de compra")
        }
    }

    static getCreatePaymentIntent = async (req, res) => {
        //OJO hay que multiplicar los importes por 100, porque asi trabaja stripe Ej: 14,90, envias a stripe como monto 1490
        let { importe } = req.body

        // 4) Generar desde mi backend el paymentIntent con stripe
        const paymentIntent = await stripeInstance.paymentIntents.create(
            {
                amount: importe * 100,
                currency: "usd"
            }
        )
        res.setHeader("Content-Type", "application/json")
        res.status(200).json({ paymentIntent })
    }

    static getFinalizarCompra = async (req, res) => {
        let cid = req.params.cid
        let usuario = req.user
        let productosParaFacturar = []
        let productosRestantes = []

        try {
            const cart = await cartService.getCartById(cid)
            //Valido stock
            for (let i = 0; i < cart.productos.length; i++) {
                let product = await productService.getProductsByFiltro(cart.productos[i].producto._id)//Busco producto      
                console.log(product.stock)
                if (cart.productos[i].quantity <= product.stock) {
                    let nuevoStock = { stock: product.stock - cart.productos[i].quantity }//resto y obtengo nueva cantidad                    
                    await productService.updateProduct(cart.productos[i].producto._id, nuevoStock)//Actualizo stock producto
                    productosParaFacturar.push(cart.productos[i]) //pusheo productosFacturables                   
                } else {
                    productosRestantes.push(cart.productos[i]) //pusheo productos no facturables
                }
            }

            // if (productosParaFacturar.length == 0) {
            //     res.setHeader("Content-Type", "application/json")
            //     return res.status(400).json("No hay stock de ninguno de los productos que desea comprar!")
            // }


            //Obtengo total a pagar
            const total = productosParaFacturar.reduce((accumulator, obj) => {
                return parseInt(accumulator + (obj.producto.price * obj.quantity))
            }, 0)
            // console.log(total)

            //Seteo el cart
            let updatedCart = await cartService.addToCart(cart._id, productosRestantes)


            //Confecciono el objeto para crear el ticket
            const datosDeCompra = {
                code: Math.random() * 100000,
                purchase_datetime: Date.now(),
                amount: total,
                purchaser: usuario.email,
                products: productosParaFacturar
            }

            let ticket = await ticketService.createTicket(datosDeCompra)

            //Por último envio correo electrónico

            // Creo la estructura HTML del cuerpo del email
            let productosHTML = datosDeCompra.products.map(obj => {
                return `<li>Producto: ${obj.producto.title}, Cantidad: ${obj.quantity}, Precio: ${obj.producto.price}`
            }).join("")
            let estructuraHTML = `<h2> Detalle de compra </h2>
                                    <ul>${productosHTML}</ul>
                                    <p>Total: ${datosDeCompra.amount}</p>
                                    <p>Comprador: ${datosDeCompra.purchaser}</p>
                                    <p>Compra realizada el ${datosDeCompra.purchase_datetime}</p>`

            let resultado = await enviarEmail(datosDeCompra.purchaser, "Confirmacion de compra", estructuraHTML)

            res.setHeader("Content-Type", "application/json")
            return res.status(201).json(ticket)

        } catch (error) {
            res.setHeader("Content-Type", "application/json")
            return res.status(500).json("Error inesperado en el servidor al procesar la compra")
        }
    }

    static getCrearPreferencia = async (req, res) => {
        let productosFormateados = []
        let productos = req.body.datosDeCompra.products
        
        productos.forEach(elem => {
            let formatProduct = {
                title: elem.producto.title,
                unit_price: elem.producto.price,
                quantity: elem.quantity
            }
            productosFormateados.push(formatProduct)            
        });

        console.log(productosFormateados)

        const client = new MercadoPagoConfig( {accessToken: "APP_USR-4908677735669400-092504-fb17fb45659a24d8bbf059bfb9157346-2003133063"})
        
        const preference=new Preference(client)

        let resultado=await preference.create(
            {
                body:{
                    items: productosFormateados,                                           
                                        
                    back_urls:{
                        success:"http://localhost:8080/handlebars/feedbackMercadoPago",
                        pending:"http://localhost:8080/handlebars/feedbackMercadoPago",
                        failure:"http://localhost:8080/handlebars/feedbackMercadoPago", 
                    },
                    // auto_return: "approved"
                }
            }            
        )
    
        res.setHeader('Content-Type','application/json');
        return res.status(200).json({payload:resultado});
    }


}