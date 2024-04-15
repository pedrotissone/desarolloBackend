import { Router } from "express"
import ProductManager from "../dao/ProductManager.js"



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