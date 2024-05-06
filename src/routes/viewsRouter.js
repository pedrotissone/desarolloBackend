import { Router } from "express"
// import ProductManager from "../dao/ProductManager.js"
import { ProductManagerMongo as ProductManager } from "../dao/ProductManagerMongo.js"



const Producto = new ProductManager()
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

    // let {pagina} = req.query

    // if(!pagina) {
    //     pagina = 1
    // }
   
    // try {
    //     //Uso desestructuring para obtener solo las propiedades que me interesan y ademas renombro docs como payload
    //     let {docs: payload, totalPages, hasPrevPage ,hasNextPage, prevPage, nextPage} = await Producto.getProductsPaginate(pagina)
    //     res.setHeader("Content-Type", "text/html")
    //     res.status(200).render("products", {payload, totalPages, hasPrevPage ,hasNextPage, prevPage, nextPage }) //Para la vista "products", paso las variables que necesito
    // } catch (error) {
    //     res.setHeader("Content-Type", "application/json")
    //     res.status(500).res.json({ Error: "Error 500 - Error inesperado en el servidor" })        
    // }

    //                                          ACA ESTABA LO DE ANTES!!!
    try {
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
            res.status(200).render("products", {payload, totalPages, hasPrevPage ,hasNextPage, prevPage, nextPage})
    

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


export {router}