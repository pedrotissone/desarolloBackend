import { Router } from "express"
// import ProductManager from "../dao/ProductManager.js"
import { ProductManagerMongo as ProductManager } from "../dao/ProductManagerMongo.js"
import { CartManagerMongo as CartManager } from "../dao/CartManagerMongo.js"



const Producto = new ProductManager()
const Carts = new CartManager()
const router = Router()


router.get("/", async (req, res) => {
    try {
        let productos = await Producto.getProducts()
        res.setHeader("Content-Type", "text/html")
        res.status(200).render("home", {productos}) //Para la vista home, paso la variable products
    } catch (error) {
        res.setHeader("Content-Type", "application/json")
        res.status(500).res.json({ Error: "Error 500 - Error inesperado en el servidor" })        
    }
})

//METODO GET con paginación
router.get("/products", async (req, res) => {

    //Por ahora uso carrito fijo para el desafío
    let carritoId = "663bc0e40a2c511258d8e42f"
    let carrito
    try {
        //Me creo un carrito para agregarle productos
        carrito = await Carts.getCartById(carritoId)
        console.log(JSON.stringify(carrito.productos))//Asi lo veo como string

        

        //              QUERY PARAMS
        let page = parseInt(req.query.page) || 1
        let limit = parseInt(req.query.limit) || 3
        let propiedad = req.query.propiedad
        let valor = req.query.valor
        let sort = req.query.sort || undefined
        let stock = parseInt(req.query.stock) || undefined

        let filtro = {} 

        if (propiedad && valor) {
            filtro[propiedad] = valor
        }
         if (stock) {
            filtro.stock = {$gte: stock}
         }


        let opciones = {
            page: page,
            limit: limit,
            lean: true,
            sort: sort
        }


        const resultado = await Producto.getProductsPaginate(filtro, opciones)
        let {payload, totalPages, hasPrevPage ,hasNextPage, prevPage, nextPage} = resultado
            res.setHeader("Content-Type", "text/html")
            res.status(200).render("products", {payload, totalPages, hasPrevPage ,hasNextPage, prevPage, nextPage, carritoId})
    

    } catch (error) {
        res.setHeader("Content-Type", "application/json")
        res.status(500).res.json({ Error: "Error 500 - Error inesperado en el servidor" })
    }
})

  

router.get("/realtimeproducts", async (req, res) => {
    try {
        let productos = await Producto.getProducts()
        res.setHeader("Content-Type", "text/html")
        res.status(200).render("realTimeProducts", {productos})
    } catch (error) {
        res.setHeader("Content-Type", "application/json")
        res.status(500).res.json({ Error: "Error 500 - Error inesperado en el servidor" })        
    }
})

router.get("/chat", (req, res) => {
    try {
        res.setHeader("Content-Type", "text/html")
        res.status(200).render("chat")        
    } catch (error) {
        res.setHeader("Content-Type", "application/json")
        res.status(500).res.json({ Error: "Error 500 - Error inesperado en el servidor" })        
    }
})

router.get("/carts/:cid", (req, res) => {
    try {
        res.setHeader("Content-Type", "text/html")
        res.status(200).render("cart")
    } catch (error) {
        res.setHeader("Content-Type", "application/json")
        res.status(500).res.json({ Error: "Error 500 - Error inesperado en el servidor" })        
    }

})


export {router}