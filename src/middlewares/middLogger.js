import { logger } from "../utils/utils.js"

//middleware con el logger
export const middLogger = (req, res, next) => {
    req.logger = logger
  
    next()
  }