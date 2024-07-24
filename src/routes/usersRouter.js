import {Router} from "express"
import { UserController } from "../controller/UserController.js";

const router = Router()


router.post("/restablecerClave", UserController.getRestablecerClave)

router.post("/corroborarNuevaClave/:token", UserController.getCorroborarNuevaClave)

router.put("/premium/:uid", UserController.getPremium)


export {router};