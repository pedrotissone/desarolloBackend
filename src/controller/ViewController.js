import { CartManagerMongo as CartManager } from "../dao/CartManagerMongo.js"
import { ProductManagerMongo as ProductManager } from "../dao/ProductManagerMongo.js"
import jwt from "jsonwebtoken"
import { SECRET, logger } from "../utils/utils.js"


let Producto = new ProductManager()
let Carts = new CartManager()

export class ViewController {

    static getProducts = async (req, res) => {// Home

        // let usuario = req.session.usuario
        let usuario = req.user ? req.user : null
        
            
        try {
            let productos = await Producto.getProducts()
            res.setHeader("Content-Type", "text/html")
            res.status(200).render("home", { productos, usuario }) //Para la vista home, paso la variable products y el usuario si hay
        } catch (error) {
            res.setHeader("Content-Type", "application/json")
            res.status(500).json({ Error: "Error 500 - Error inesperado en el servidor" })
        }
    }


    static getProductsPaginate =  async (req, res) => { //Paginacion con Handlebars

        let carrito = {
            _id: req.user.carrito
        }
    
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
    
            const resultado = await Producto.getProductsPaginate(filtro, opciones, sortOptions)    
    
            //Desestructuro el resultado en las propiedades que necesito
            let { payload, totalPages, hasPrevPage, hasNextPage, prevPage, nextPage } = resultado
            res.setHeader("Content-Type", "text/html")
            res.status(200).render("products", { payload, totalPages, hasPrevPage, hasNextPage, prevPage, nextPage, carrito })    
    
        } catch (error) {
            res.setHeader("Content-Type", "application/json")
            res.status(500).json({ Error: "Error 500 - Error inesperado en el servidor" })
        }
    }


    static getProductsForRealTime =  async (req, res) => {
        try {
            let productos = await Producto.getProducts()
            res.setHeader("Content-Type", "text/html")
            res.status(200).render("realTimeProducts", { productos })
        } catch (error) {
            res.setHeader("Content-Type", "application/json")
            res.status(500).json({ Error: "Error 500 - Error inesperado en el servidor" })
        }
    }


    static getChat = (req, res) => {
        try {
            res.setHeader("Content-Type", "text/html")
            res.status(200).render("chat")
        } catch (error) {
            res.setHeader("Content-Type", "application/json")
            res.status(500).json({ Error: "Error 500 - Error inesperado en el servidor" })
        }
    }

    static getCartById = async (req, res) => {
        let id = req.params.cid
        let productos
        try {
            let carrito = await Carts.getCartById(id)
            // console.log(carrito)
            productos = carrito.productos
            res.setHeader("Content-Type", "text/html")
            res.status(200).render("cart", { productos, carrito })
        } catch (error) {
            res.setHeader("Content-Type", "application/json")
            res.status(500).json({ Error: "Error 500 - Error inesperado en el servidor" })
        }
    }

    static getSignup =  (req, res) => {
        res.setHeader("Content-Type", "text/html")
        res.status(200).render("signUp")
    }

    static getLogin = (req, res) => {
        res.setHeader("Content-Type", "text/html")
        res.status(200).render("login")
    }

    static getPerfil = (req, res) => {
        res.setHeader("Content-Type", "text/html")
        res.status(200).render("perfil", {
            usuario: req.user
        })
    }

    static getOlvideClave = (req, res) => {
        res.setHeader("Content-Type", "text/html")
        res.status(200).render("olvideClave")
    }

    static getCrearNuevaClave = async (req, res) => {
        //1) Extraer token del req.params
        let token = req.params.token
        
        //2) Verifico la Validez del token
        let decoded
        try {
            decoded = jwt.verify(token, SECRET);
            console.log('Token válido y aún en vigencia:', decoded);
          } catch (err) {
            if (err.name === 'TokenExpiredError') {
              console.error('El token ha expirado.');
            } else if (err.name === 'JsonWebTokenError') {
              console.error('El token no es válido.');
            } else {
              console.error('Error al verificar el token:', err);
            }
          }

          //3 Redirijo vista según la validez del token
          if (decoded) {
              res.setHeader("Content-Type", "text/html")
              return res.status(200).render("crearNuevaClave", decoded)
          } else {
            res.setHeader("Content-Type", "text/html")
            res.status(200).render("login", {message: "Lo siento el token expiro o es incorrecto, deberá repetir el procedimiento para restablecer la contraseña" })
        }
    }

}