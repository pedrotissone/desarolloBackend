export const auth = (req, res, next) => {
    if(!req.session.usuario) {
        res.setHeader("Content-Type", "application/json")
       return res.status(400).json("Error, No existen usuarios autenticados") 
    }
    next()
}