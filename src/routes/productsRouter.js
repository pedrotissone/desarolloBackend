import { Router } from "express"
import { upload } from "../utils/utils.js"
import { auth } from "../middlewares/auth.js"
import { ProductController } from "../controller/ProductController.js"


const router = Router()

router.get("/", ProductController.getProducts)

router.get("/:pid", ProductController.getProductById)

router.post("/", auth(["admin"]), upload.single("thumbnail"), ProductController.createProduct)

router.put("/:pid", auth(["admin"]), ProductController.modifyProduct)

router.delete("/:pid", auth(["admin"]), ProductController.eraseProduct)

export { router };