import { Router } from "express"
import { auth } from "../middlewares/auth.js"
import { ViewController } from "../controller/ViewController.js"


const router = Router()


router.get("/", ViewController.getProducts)

router.get("/products", auth(["usuario"]), ViewController.getProductsPaginate)

router.get("/realtimeproducts", ViewController.getProductsForRealTime)

router.get("/chat", auth(["usuario"]), ViewController.getChat)

router.get("/carts/:cid", ViewController.getCartById)

router.get("/signUp", ViewController.getSignup)

router.get("/login", ViewController.getLogin)

router.get("/perfil", auth(["usuario", "admin"]), ViewController.getPerfil)


export { router }