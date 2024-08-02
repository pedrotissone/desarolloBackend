// import ProductManager from "../dao/ProductManager.js" //FILE SYSTEM MANAGER
import { ProductManagerMongo as ProductManager } from "../dao/ProductManagerMongo.js"
import { isValidObjectId } from "mongoose"
import { productsModel } from "../dao/models/productsModel.js"
import { io } from "../app.js"
import { productService } from "../services/ProductService.js"
import { faker } from "@faker-js/faker"
import { CustomError } from "../utils/CustomError.js"
import { TIPOS_ERROR } from "../utils/EError.js"
import jwt from "jsonwebtoken"
import { SECRET } from "../utils/utils.js"

//Tengo que instanciar mi clase ProductManager(DAO) para poder realizar la conexion a la DB desde mi controlador (Ahora uso service)
let Producto = new ProductManager()


export class ProductController {
    //static me permite usar los metodos directamente sin necesidad de instanciar previamente la clase
    static getProducts = async (req, res) => {

        try {
            //              QUERY PARAMS
            let page = parseInt(req.query.page) || 1
            let limit = parseInt(req.query.limit) || 10
            let query = req.query.query
            let sort = req.query.sort || "asc"
            let stock = parseInt(req.query.stock) || undefined

            let filtro = {}
            if (query) {
                const parametros = query.split(':');
                const campo = parametros[0];
                const valor = parametros[1];
                filtro[campo] = valor
            }

            if (stock) {
                filtro.stock = { $gte: stock }//sintaxis mongoose
            }


            let opciones = {
                page: page,
                limit: limit,
            }

            const sortOptions = {};

            if (sort === 'asc') {
                sortOptions.price = 1; // Orden ascendente por precio
            } else if (sort === 'desc') {
                sortOptions.price = -1; // Orden descendente por precio
            }
            //CONEXION A MI DAO/MANAGER - Paso a la capa que interactua con mi DB (No habia services)
            // let resultado = await Producto.getProductsPaginate(filtro, opciones, sortOptions)
            //CONEXION A MI CAPA DE SERVICIOS - es la capa intermediaria entre Controller y DAO
            let resultado = await productService.getProductsPaginate(filtro, opciones, sortOptions)
            res.setHeader("Content-Type", "application/json")
            res.status(200).json(resultado)

        } catch (error) {
            res.setHeader("Content-Type", "application/json")
            res.status(500).json("Error en el servidor al paginar productos")
        }
    }


    static getProductById = async (req, res) => {
        //              F I L E    S Y S T E M
        //     try {
        //         await Producto.getProducts()

        //         //          P A R A M S
        //         let id = parseInt(req.params.pid)
        //         let resultado = await Producto.getProductById(id)
        //         res.setHeader("Content-Type", "application/json")
        //         return res.json(resultado)

        //     } catch (error) {
        //         res.setHeader("Content-Type", "application/json")
        //         return res.status(500).json({
        //             message: "Error 500 - Error inesperado en el Servidor"
        //         })
        //     }
        // })

        //                  MONGO DB

        //Valido que el id tenga el formato de Mongodb
        let id = req.params.pid
        if (!isValidObjectId(id)) {
            res.setHeader("Content-Type", "application/json")
            return res.status(400).json({
                message: "Error, el id requerido no tiene un formato valido de MongoDB"
            })
        }

        try {
            //CONEXION A MI DAO/MANAGER - Paso a la capa que interactua con mi DB (No habia services)
            // let resultado = await Producto.getProductsByFiltro({ _id: id })
            //CONEXION A MI CAPA DE SERVICIOS - es la capa intermediaria entre Controller y DAO
            let resultado = await productService.getProductsByFiltro({_id:id})            
            if (resultado) {
                res.setHeader("Content-Type", "application/json")
                return res.status(200).json(resultado)
            } else {
                res.setHeader("Content-Type", "application/json")
                return res.json("No existe producto con el id requerido")
            }

        } catch (error) {
            res.setHeader("Content-Type", "application/json")
            return res.status(400).json({
                message: "Error al realizar la función de filtro por _id"
            })
        }
    }


    static createProduct = async (req, res, next) => {//Le agrego el next para manejar el error asyncrono en esta ruta
        //          F I L E   S Y S T E M
        // try {        
        // await Producto.getProducts()
        //Validación de que se cargue alguna imagen
        // let thumbnail
        // if(req.file) {
        //     thumbnail = req.file.filename
        // } else {
        //     return res.status(400).json({
        //         message: "Error 400 - No se adjunto ningun archivo!"
        //     })
        // }

        // let { title, description, price, code, stock, category, status } = req.body

        // //Validación del request
        // if (!title || !description || !price || !thumbnail || !code || !stock || !category || !status) {
        //     res.setHeader("Content-Type", "application/json")
        //     return res.status(400).json({
        //         message: "Error 400 - No se enviaron todos los datos necesarios para crear un nuevo producto"
        //     })
        // } 

        // let codigoRepetido = Producto.products.some(elem => elem.code == code) //Lineas para FILE SYSTEM
        // if (codigoRepetido) {
        //     res.setHeader("Content-Type", "application/json")
        //     return res.status(400).json({
        //         message: "Error 400 - El código del producto que se quiere agregar ya está repetido en otro producto"
        //     })
        // }

        //         let nuevoProducto = await Producto.addProduct({ title, description, price, thumbnail, code, stock, category, status })

        //         io.emit("listadoActualizado", nuevoProducto)//Emit para la vista handlebars/realtimeproducts

        //         res.setHeader("Content-Type", "application/json")
        //         return res.status(200).json(nuevoProducto)
        //     } catch (error) {
        //         res.setHeader("Content-Type", "application/json")
        //         return res.status(500).json({
        //             message: "Error 500 - Error inesperado en el Servidor"
        //         })
        //     }
        // })

        //                              MONGO  DB

        //Variables globales
        let coderCookie = req.cookies["codercookie"] //Extraigo el valor de la cookie jwt
        let { title, description, price, code, stock, category, status } = req.body
        let thumbnail
        let owner

        //Decodifico valor de la cookie y si el que va a subir un producto es premium le cambio el valor a owner a su ._id
        let decoded = jwt.verify(coderCookie, SECRET)
        console.log(decoded._id)
        if (decoded.rol == "premium") {
            owner = decoded.email
        }        


        //Validación de que se cargue alguna imagen (OJO PROBLEMA CON LOS .HEIC)
        try {
            if (req.file) {                
                thumbnail = req.file.filename
            } else {
                // return res.status(400).json({
                //     message: "Error 400 - No se adjunto ningun archivo!"
                // })
                CustomError.createError("Error","Falta adjuntar archivo de imagen","Deberá adjuntar una imagen", TIPOS_ERROR.ARGUMENTOS_INVALIDOS)                    
            }        

        //Validación del request
        if (!title || !description || !price || !code || !stock || !category || !status) {
            // res.setHeader("Content-Type", "application/json")
            // return res.status(400).json({
            //     message: "Error 400 - No se enviaron todos los datos necesarios para crear un nuevo producto"
            // })
            CustomError.createError("Error","Faltan completar campos del formulario","Deberá completar todos los campos del formulario", TIPOS_ERROR.ARGUMENTOS_INVALIDOS)  
        }        
            
        } catch (error) {
            return next(error)            
        }

        let existeFiltro
        try {
            //CONEXION A MI DAO/MANAGER - Paso a la capa que interactua con mi DB
            // existeFiltro = await Producto.getProductsByFiltro({ code })
            existeFiltro = await productService.getProductsByFiltro({ code })
        } catch (error) {
            res.setHeader("Content-Type", "application/json")
            return res.status(500).json({ message: "Error 500 - Error al realizar la función de filtrado" })
        }

        if (existeFiltro) {
            res.setHeader("Content-Type", "application/json")
            return res.status(400).json({
                message: "Error 400 - El filtro proporcionado (code) se encuentra repetido en otro producto"
            })
        }

        try {
            // let nuevoProducto = await Producto.addProduct({ title, description, price, thumbnail, code, stock, category, status })
            let nuevoProducto = await productService.addProduct({ title, description, price, thumbnail, code, stock, category, status, owner})

            let listadoActualizado = await productsModel.find() //Me traigo todos los productos directamente desde mi modelo, no se porque no usé mi manager/dao
            io.emit("listadoActualizado", listadoActualizado)//Emit para la vista handlebars/realtimeproducts

            res.setHeader("Content-Type", "application/json")
            return res.status(200).json(nuevoProducto)

        } catch (error) {
            res.setHeader("Content-Type", "application/json")
            return res.status(500).json({ message: "Error 500 - Error inesperado en el Servidor" })
        }
    }


    static modifyProduct = async (req, res) => {
        //                      F I L E   S Y S T E M
        //     try {    
        //         await Producto.getProducts()

        //         let id = parseInt(req.params.pid) //El id viene por params
        //         let { title, description, price, thumbnail, code, stock, category, status } = req.body //En el body viene el objeto

        //         //                                          VALIDACIONES
        //         if (!title || !description || !price || !thumbnail || !code || !stock || !category || !status) {
        //             res.setHeader("Content-Type", "application/json")
        //             return res.status(400).json({
        //                 message: "Error 400 - No se enviaron todos los datos necesarios para editar un producto"
        //             })
        //         }

        //         let codigoRepetido = Producto.products.some(elem => elem.code == code)
        //         if (codigoRepetido) {
        //             res.setHeader("Content-Type", "application/json")
        //             return res.status(400).json({
        //                 message: "Error 400 - El código del producto que se quiere agregar ya está repetido en otro producto"
        //             })
        //         }

        //         let nuevoProducto = await Producto.updateProduct(id, { title, description, price, thumbnail, code, stock, category, status })
        //         res.setHeader("Content-Type", "application/json")
        //         return res.status(200).json(nuevoProducto)

        //     } catch (error) {
        //         res.setHeader("Content-Type", "application/json")
        //         return res.status(500).json({ error: "Error en el Servidor al devolver el producto a editar" })
        //     }
        // })

        //                                  M O N G O  DB
        //Valido que el id tenga el formato de Mongodb
        let id = req.params.pid
        if (!isValidObjectId(id)) {
            res.setHeader("Content-Type", "application/json")
            return res.status(400).json({
                message: "Error, el id requerido no tiene un formato valido de MongoDB"
            })
        }

        let aModificar = req.body

        if (aModificar.code) {
            let existe
            try {
                //CONEXION A MI DAO/MANAGER - Paso a la capa que interactua con mi DB
                // existe = await Producto.getProductsByFiltro({ code: aModificar.code })
                existe = await productService.getProductsByFiltro({ code: aModificar.code })
                if (existe) {
                    res.setHeader("Content-Type", "application/json")
                    return res.status(400).json("Ya existe otro producto con el mismo código")
                }
            } catch (error) {
                res.setHeader("Content-Type", "application/json")
                return res.status(500).json({ error: "Error en el Servidor al querer validar otro producto con el mismo codigo" })
            }
        }

        try {
            // let productoModificado = await Producto.updateProduct(id, aModificar)
            let productoModificado = await productService.updateProduct(id, aModificar)
            res.setHeader("Content-Type", "application/json")
            return res.status(200).json(productoModificado)

        } catch (error) {
            res.setHeader("Content-Type", "application/json")
            return res.status(500).json({ error: "Error en el Servidor al querer actualizar el producto" })
        }
    }


    static eraseProduct = async (req, res) => {
        //                      F I L E   S Y S T E M
        //     try {
        //         await Producto.getProducts()
        //         let id = parseInt(req.params.pid)
        //         let producto = await Producto.deleteProduct(id)
        //         res.setHeader("Content-Type", "application/json")
        //         res.status(200).json(producto)
        //     } catch (error) {
        //         res.setHeader("Content-Type", "application/json")
        //         return res.status(500).json({ error: "Error en el Servidor al querer eliminar el producto" })
        //     }
        // })

        //                      M O N G O  DB    
        
        let id = req.params.pid
        let userEmail = req.user.email
        console.log(userEmail)

        //Valido que el id tenga el formato de Mongodb
        if (!isValidObjectId(id)) {
            res.setHeader("Content-Type", "application/json")
            return res.status(400).json({
                message: "Error, el id requerido no tiene un formato valido de MongoDB"
            })
        }

        //Busco el producto por el id y comparo con el email para validar que no se quiera borrar un producto ajeno
        let producto = await productService.getProductsByFiltro({ _id:id })
        console.log(producto.owner)

        if (userEmail !== "adminCoder@coder.com") {
            if (userEmail !== producto.owner) {
                res.setHeader("Content-Type", "application/json")
                return res.status(400).json("No se puede eliminar un producto del cual no se es el owner")
            }
        }


        try {
            //CONEXION A MI DAO/MANAGER - Paso a la capa que interactua con mi DB
            // let resultado = await Producto.deleteProduct(id)
            let resultado = await productService.deleteProduct(id)
            if (resultado.deletedCount > 0) {
                res.setHeader("Content-Type", "application/json")
                return res.status(200).json(`producto con id: ${id} eliminado`)
            } else {
                res.setHeader("Content-Type", "application/json")
                return res.status(404).json("El id del producto a eliminar no existe")
            }
        } catch (error) {
            res.setHeader("Content-Type", "application/json")
            return res.status(500).json({ error: "Error en el Servidor al querer eliminar el producto" })
        }
    }


    static getMockProducts = async (req, res) => {

        const mockProductArr = []
        try {

            function createMockProduct() {                
                let title = faker.commerce.product()
                let description = faker.commerce.productDescription()
                let price = faker.commerce.price({dec: 0})
                let thumbnail = faker.image.url()
                let code = faker.database.mongodbObjectId()
                let stock = Math.floor(Math.random() * 200)
                let category = faker.commerce.productMaterial()
                let status = "ok"

                let product = {
                    title,
                    description,
                    price,
                    thumbnail,
                    code,
                    stock,
                    category,
                    status
                }
               mockProductArr.push(product)            
            }
            
            for(let i = 0; i < 100; i++) {
                createMockProduct()
            }

            res.setHeader("Content-Type", "application/json")
            return res.status(200).json(
                {
                    "status": "success",
                    "payload": mockProductArr
                }
            )

        } catch (error) {
            res.setHeader("Content-Type", "application/json")
            return res.status(500).json({ error: "Error en el Servidor al querer traer los mock products" })
        }
    }

}