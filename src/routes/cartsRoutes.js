import { Router } from "express"
// import CartManager from "../dao/CartManager.js" //Me traigo mi clase que tiene todas las funciones para manejar el carrito
import { CartManagerMongo as CartManager } from "../dao/CartManagerMongo.js"
import { isValidObjectId } from "mongoose"
import { middleware3 } from "../middlewares/generales.js"

const Carts = new CartManager() //Instancio mi clase

const router = Router()

//Middleware en linea a nivel router. No es recomendable usarlo así, se ejecuta para todas las rutas del router
// router.use((req, res, next) => {
//     console.log("Soy un middleware en linea a nivel router") 
//     next()
// })


//Middleware a nivel endpoint
router.get("/:cid", middleware3, async (req, res) => {
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

//                      G E T   C A R T   B Y   I D   M O N G O

let id = req.params.cid
if (!isValidObjectId(id)) {
    res.setHeader("Content-Type", "application/json")
        return res.status(400).json({
            message: "Error, el id requerido no tiene un formato valido de MongoDB"
        })
}

try {    
    let resultado = await Carts.getCartById(id)
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

})

router.post("/", async (req, res) => {
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

//                   C R E A T E   C A R T   B Y   M O N G O
    try {
        let newCart = {
            products: []
        }
        await Carts.createCart(newCart)
        res.setHeader("Content-Type", "application/json")
        return res.status(200).json(newCart)
    } catch (error) {
        res.setHeader("Content-Type", "application/json")
        return res.status(500).json("Error inesperado en el servidor al crear carrito")         
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
