import { Router } from "express"
import { auth } from "../middlewares/auth.js"
import { ViewController } from "../controller/ViewController.js"


const router = Router()


router.get("/", ViewController.getProducts)

router.get("/products", auth(["usuario", "premium"]), ViewController.getProductsPaginate)

router.get("/realtimeproducts", ViewController.getProductsForRealTime)

router.get("/chat", auth(["usuario", "premium"]), ViewController.getChat)

router.get("/carts/:cid", ViewController.getCartById)

router.get("/signUp", ViewController.getSignup)

router.get("/login", ViewController.getLogin)

router.get("/perfil", auth(["usuario", "premium", "admin"]), ViewController.getPerfil)

router.get("/olvideClave", ViewController.getOlvideClave)

router.get("/crearNuevaClave/:token", ViewController.getCrearNuevaClave)

router.get("/:cid/mediosDePago", auth(["usuario", "premium"]), ViewController.getMediosDePago)

router.get("/feedbackMercadoPago", auth(["usuario", "premium"]), ViewController.getFeedbackMercadoPago)


export { router }