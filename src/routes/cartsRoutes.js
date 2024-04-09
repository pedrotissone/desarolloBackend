import { Router } from "express"
import CartManager from "../dao/CartManager.js" //Me traigo mi clase que tiene todas las funciones para manejar el carrito
import { middleware3 } from "../middlewares/generales.js"

const Carts = new CartManager() //Instancio mi clase

const router = Router()

// router.use((req, res, next) => {
//     console.log("Soy un middleware a nivel router") //Middleware en linea a nivel router (No es recomendable usarlo así)
//     next()
// })

router.get("/:cid", middleware3, async (req, res) => { //Middleware a nivel endpoint

    try {
            await Carts.getCarts()
        

        let id = parseInt(req.params.cid)
        let carrito = await Carts.getCartById(id)
        res.setHeader("Content-Type", "application/json")
        return res.status(200).json(carrito)
        
    } catch (error) {
        res.setHeader("Content-Type", "application/json")
        return res.status(500).json("Error inesperado en el servidor")                        
    }
})

router.post("/", async (req, res) => {

    try {
        await Carts.getCarts() //Primero me traigo a memoria los carritos de mi DB
         

        let nuevoCarrito = await Carts.createCart()
        res.setHeader("Content-Type", "application/json")
        return res.json(nuevoCarrito)   
        
    } catch (error) {
        res.setHeader("Content-Type", "application/json")
        return res.status(500).json("Error inesperado en el servidor")          
    }
})

router.post("/:cid/products/:pid", async (req, res) => {

    try {
        await Carts.getCarts()

        let cid = req.params.cid
        let pid = req.params.pid

        let carrito = await Carts.getCartById(cid)
        if(carrito == undefined) {
            res.setHeader("Content-Type", "application/json")
            return res.json("No existe el carrito en el que desea agregar productos") 
        }

        await Carts.addToCart(carrito, pid)         

        let dbActualizada = await Carts.getCarts()
        res.setHeader("Content-Type", "application/json")
        return res.json(dbActualizada) 

        
    } catch (error) {
        res.setHeader("Content-Type", "application/json")
        return res.status(500).json("Error inesperado en el servidor")        
    }

})

export {router}
