import { Router } from "express"
// import ProductManager from "../dao/ProductManager.js"
import { ProductManagerMongo as ProductManager } from "../dao/ProductManagerMongo.js"
import { CartManagerMongo as CartManager } from "../dao/CartManagerMongo.js"
import { auth } from "../middlewares/auth.js"



const Producto = new ProductManager()
const Carts = new CartManager()
const router = Router()


router.get("/", async (req, res) => {
    // //Prueba de creación de cookies desde el servidor
    // let datos = { nombre: "pepeJefe", rol: "admin" }
    // let datos2 = { nombre: "juanEmpleado", rol: "usuario" }
    // //Le doy una medida de seguraridad a la cookie firmandola, para que no me la puedan modificar
    // res.cookie("user", datos, { signed: true })
    // //El tercer argumento es para indicar vencimiento, si lo dejo así duran solo durante la session
    // res.cookie("user2", datos2, {})

    let usuario = req.session.usuario
    console.log(usuario)
    try {
        let productos = await Producto.getProducts()
        res.setHeader("Content-Type", "text/html")
        res.status(200).render("home", { productos, usuario }) //Para la vista home, paso la variable products
    } catch (error) {
        res.setHeader("Content-Type", "application/json")
        res.status(500).json({ Error: "Error 500 - Error inesperado en el servidor" })
    }
})

//METODO GET con paginación
router.get("/products", async (req, res) => { //Paginacion con Handlebars

    //Por ahora uso carrito fijo para el desafío
    let carritoId = "663bc0e40a2c511258d8e42f"
    let carrito
    try {
        //Me creo un carrito para agregarle productos
        carrito = await Carts.getCartById(carritoId)
        // console.log(JSON.stringify(carrito.productos))//Asi lo veo como string
        

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


        const resultado = await Producto.getProductsPaginate(filtro, opciones, sortOptions)

        //Desestructuro el resultado en las propiedades que necesito
        let { payload, totalPages, hasPrevPage, hasNextPage, prevPage, nextPage } = resultado
        res.setHeader("Content-Type", "text/html")
        res.status(200).render("products", { payload, totalPages, hasPrevPage, hasNextPage, prevPage, nextPage, carritoId})


    } catch (error) {
        res.setHeader("Content-Type", "application/json")
        res.status(500).json({ Error: "Error 500 - Error inesperado en el servidor" })
    }
})



router.get("/realtimeproducts", async (req, res) => {
    try {
        let productos = await Producto.getProducts()
        res.setHeader("Content-Type", "text/html")
        res.status(200).render("realTimeProducts", { productos })
    } catch (error) {
        res.setHeader("Content-Type", "application/json")
        res.status(500).json({ Error: "Error 500 - Error inesperado en el servidor" })
    }
})

router.get("/chat", (req, res) => {
    try {
        res.setHeader("Content-Type", "text/html")
        res.status(200).render("chat")
    } catch (error) {
        res.setHeader("Content-Type", "application/json")
        res.status(500).json({ Error: "Error 500 - Error inesperado en el servidor" })
    }
})

router.get("/carts/:cid", async (req, res) => {
    let id = req.params.cid
    let productos
    try {
        let carrito = await Carts.getCartById(id)
        console.log(carrito)
        productos = carrito.productos
        res.setHeader("Content-Type", "text/html")
        res.status(200).render("cart", { productos })
    } catch (error) {
        res.setHeader("Content-Type", "application/json")
        res.status(500).json({ Error: "Error 500 - Error inesperado en el servidor" })
    }
})

router.get("/signUp", (req, res) => {
    res.setHeader("Content-Type", "text/html")
    res.status(200).render("signUp")
})

router.get("/login", (req, res) => {
    res.setHeader("Content-Type", "text/html")
    res.status(200).render("login")
})

router.get("/perfil", auth, (req, res) => { //Ruta protegida con middleware de autenticación
    res.setHeader("Content-Type", "text/html")
    res.status(200).render("perfil", {
        usuario: req.session.usuario
    })
})




export { router }