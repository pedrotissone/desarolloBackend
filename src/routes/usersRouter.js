import {Router} from "express"
import { UserController } from "../controller/UserController.js";
import { auth } from "../middlewares/auth.js";

const router = Router()


router.post("/restablecerClave", UserController.getRestablecerClave)

router.post("/corroborarNuevaClave/:token", UserController.getCorroborarNuevaClave)

router.put("/premium/:uid", auth(["admin", "usuario", "premium"]), UserController.getPremium)


export {router};