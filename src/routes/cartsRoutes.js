import e, {Router} from "express"
import CartManager from "../dao/CartManager.js" //Me traigo mi clase que tiene todas las funciones para manejar el carrito

const Carts = new CartManager() //Instancio mi clase

const router = Router()

router.get("/:cid", async (req, res) => {

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

router.post("/:cid/products/:pid", (req, res) => {

    let cid = req.params.cid
    let pid = req.params.pid
    res.setHeader("Content-Type", "application/json")
    return res.json(`Agregamos al carrito ${cid}, el producto con id ${pid}`)

})

export {router}
