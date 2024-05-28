import { Router } from "express"
// import ProductManager from "../dao/ProductManager.js" //FILE SYSTEM MANAGER
import { ProductManagerMongo as ProductManager } from "../dao/ProductManagerMongo.js" //MONGO MANAGER
import { upload } from "../../utils.js"
import { io } from "../app.js"
import { isValidObjectId } from "mongoose"
import { productsModel } from "../dao/models/productsModel.js"
import { auth } from "../middlewares/auth.js"


const Producto = new ProductManager()


const router = Router()

router.get("/", async (req, res) => {

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

        let resultado = await Producto.getProductsPaginate(filtro, opciones, sortOptions)
        res.setHeader("Content-Type", "application/json")
        res.status(200).json(resultado)


    } catch (error) {
        res.setHeader("Content-Type", "application/json")
        res.status(500).json("Error en el servidor al paginar productos")
    }
})


router.get("/:pid", async (req, res) => {
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

    //                      G E T  B Y  ID  M O N G O
    //Valido que el id tenga el formato de Mongodb
    let id = req.params.pid
    if (!isValidObjectId(id)) {
        res.setHeader("Content-Type", "application/json")
        return res.status(400).json({
            message: "Error, el id requerido no tiene un formato valido de MongoDB"
        })
    }

    try {
        let resultado = await Producto.getProductsByFiltro({ _id: id })
        if (resultado) {
            res.setHeader("Content-Type", "application/json")
            return res.json(resultado)
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
})


router.post("/", auth(["admin"]), upload.single("thumbnail"), async (req, res) => {

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

    //                    R U T A  P O S T  V E R S I O N  M O N G O
    //Validación de que se cargue alguna imagen
    let thumbnail
    if (req.file) {
        thumbnail = req.file.filename
    } else {
        return res.status(400).json({
            message: "Error 400 - No se adjunto ningun archivo!"
        })
    }

    let { title, description, price, code, stock, category, status } = req.body

    //Validación del request
    if (!title || !description || !price || !thumbnail || !code || !stock || !category || !status) {
        res.setHeader("Content-Type", "application/json")
        return res.status(400).json({
            message: "Error 400 - No se enviaron todos los datos necesarios para crear un nuevo producto"
        })
    }

    let existeFiltro
    try {
        existeFiltro = await Producto.getProductsByFiltro({ code })
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
        let nuevoProducto = await Producto.addProduct({ title, description, price, thumbnail, code, stock, category, status })

        let listadoActualizado = await productsModel.find() //Esta línea es para mongo, con FS envío nuevoProducto
        io.emit("listadoActualizado", listadoActualizado)//Emit para la vista handlebars/realtimeproducts

        res.setHeader("Content-Type", "application/json")
        return res.status(200).json(nuevoProducto)

    } catch (error) {
        res.setHeader("Content-Type", "application/json")
        return res.status(500).json({ message: "Error 500 - Error inesperado en el Servidor" })
    }
})



router.put("/:pid", auth(["admin"]), async (req, res) => {

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

    //                          M E T O D O   P U T   C O N   M O N G O!
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
            existe = await Producto.getProductsByFiltro({ code: aModificar.code })
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
        let productoModificado = await Producto.updateProduct(id, aModificar)
        res.setHeader("Content-Type", "application/json")
        return res.status(200).json(productoModificado)

    } catch (error) {
        res.setHeader("Content-Type", "application/json")
        return res.status(500).json({ error: "Error en el Servidor al querer actualizar el producto" })
    }
})


router.delete("/:pid", auth(["admin"]), async (req, res) => {
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

    //                      D E L E T E   B Y   M O N G O

    //Valido que el id tenga el formato de Mongodb
    let id = req.params.pid
    if (!isValidObjectId(id)) {
        res.setHeader("Content-Type", "application/json")
        return res.status(400).json({
            message: "Error, el id requerido no tiene un formato valido de MongoDB"
        })
    }

    try {
        let resultado = await Producto.deleteProduct(id)
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

})

export { router };